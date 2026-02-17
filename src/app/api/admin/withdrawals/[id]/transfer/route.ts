import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDB } from "@/lib/mongodb";
import Withdrawal from "@/models/Withdrawal";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/Transaction";
import PaystackService from "@/lib/paystack";
import { v4 as uuidv4 } from "uuid";

/* ✅ Next.js 15–compliant context */
type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: NextRequest,
  context: Context
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const { id: withdrawalId } = await context.params;

    // ================= FIND WITHDRAWAL =================
    const withdrawal = await Withdrawal.findById(withdrawalId).populate(
      "userId",
      "name email"
    );

    if (!withdrawal) {
      return NextResponse.json(
        { error: "Withdrawal not found" },
        { status: 404 }
      );
    }

    if (withdrawal.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Withdrawal must be approved before transfer" },
        { status: 400 }
      );
    }

    if (withdrawal.paystackTransferCode) {
      return NextResponse.json(
        { error: "Transfer already initiated" },
        { status: 400 }
      );
    }

    // ================= MARK PROCESSING =================
    withdrawal.status = "PROCESSING";
    await withdrawal.save();

    try {
      // ================= CREATE RECIPIENT =================
      let recipientCode = withdrawal.metadata?.paystackRecipientCode;

      if (!recipientCode) {
        const recipientResponse =
          await PaystackService.createTransferRecipient({
            type: "nuban",
            name: withdrawal.bankDetails.accountName,
            account_number: withdrawal.bankDetails.accountNumber,
            bank_code: withdrawal.bankDetails.bankCode,
            currency: "NGN",
          });

        recipientCode = recipientResponse.data.recipient_code;

        withdrawal.metadata = {
          ...withdrawal.metadata,
          paystackRecipientCode: recipientCode,
          paystackRecipientId: recipientResponse.data.id,
        };

        await withdrawal.save();
      }

      // ================= INITIATE TRANSFER =================
      const transferResponse = await PaystackService.initiateTransfer({
        source: "balance",
        amount: withdrawal.netAmount * 100, // kobo
        recipient: recipientCode,
        reason: `Payout for ${withdrawal.userId.name}`,
        reference: `PAYOUT_${withdrawal._id}_${uuidv4().slice(0, 8)}`,
      });

      withdrawal.paystackTransferCode =
        transferResponse.data.transfer_code;

      withdrawal.metadata = {
        ...withdrawal.metadata,
        paystackTransferId: transferResponse.data.id,
        paystackReference: transferResponse.data.reference,
        transferInitiatedAt: new Date(),
      };

      await withdrawal.save();

      return NextResponse.json({
        success: true,
        message: "Transfer initiated successfully",
        data: {
          transferCode: transferResponse.data.transfer_code,
          reference: transferResponse.data.reference,
          amount: withdrawal.netAmount,
        },
      });
    } catch (paystackError: any) {
      console.error("Paystack transfer error:", paystackError);

      withdrawal.status = "REJECTED";
      withdrawal.failureReason =
        paystackError.message || "Paystack transfer failed";
      await withdrawal.save();

      // ================= REFUND WALLET =================
      const wallet = await Wallet.findById(withdrawal.walletId);

      if (wallet) {
        await Wallet.findByIdAndUpdate(withdrawal.walletId, {
          $inc: {
            balance: withdrawal.amount,
            pendingBalance: -withdrawal.amount,
          },
        });

        await Transaction.create({
          type: "CREDIT",
          amount: withdrawal.amount,
          userId: withdrawal.userId,
          role: withdrawal.role,
          source: "REFUND",
          walletId: withdrawal.walletId,
          metadata: {
            withdrawalId: withdrawal._id,
            description: "Transfer failed, funds returned",
          },
        });
      }

      return NextResponse.json(
        { error: "Transfer failed", details: paystackError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Transfer initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate transfer", details: error.message },
      { status: 500 }
    );
  }
}