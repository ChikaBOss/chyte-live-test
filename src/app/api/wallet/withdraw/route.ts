import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDB } from '@/lib/mongodb';
import Wallet from '@/models/Wallet';
import Withdrawal from '@/models/Withdrawal';
import Transaction from '@/models/Transaction';
import PaystackService from '@/lib/paystack';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectToDB();
    
    const { amount, bankDetails } = await request.json();
    
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }
    
    // Get user wallet
    const wallet = await Wallet.findOne({
      userId: session.user.id,
      role: { $in: ['vendor', 'rider'] }
    });
    
    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }
    
    // Check minimum withdrawal
    const minWithdrawal = 1000; // 1000 NGN minimum
    if (amount < minWithdrawal) {
      return NextResponse.json(
        { error: `Minimum withdrawal is ₦${minWithdrawal}` },
        { status: 400 }
      );
    }
    
    // Check sufficient balance
    if (wallet.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }
    
    // Get platform settings for withdrawal fee
    const withdrawalFee = 50; // 50 NGN fee
    const netAmount = amount - withdrawalFee;
    
    // Create withdrawal request
    const withdrawal = await Withdrawal.create({
      userId: session.user.id,
      role: wallet.role,
      walletId: wallet._id,
      amount,
      fee: withdrawalFee,
      netAmount,
      bankDetails,
      status: 'PENDING'
    });
    
    // Deduct from wallet balance (move to pending)
    await Wallet.findByIdAndUpdate(wallet._id, {
      $inc: {
        balance: -amount,
        pendingBalance: amount
      }
    });
    
    // Create transaction record
    await Transaction.create({
      type: 'DEBIT',
      amount,
      userId: session.user.id,
      role: wallet.role,
      source: 'WITHDRAWAL',
      walletId: wallet._id,
      status: 'PENDING',
      metadata: {
        withdrawalId: withdrawal._id,
        description: 'Withdrawal request'
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted',
      data: {
        withdrawalId: withdrawal._id,
        amount,
        fee: withdrawalFee,
        netAmount,
        status: 'PENDING'
      }
    });
    
  } catch (error: any) {
    console.error('Withdrawal error:', error);
    return NextResponse.json(
      { error: 'Withdrawal failed', details: error.message },
      { status: 500 }
    );
  }
}