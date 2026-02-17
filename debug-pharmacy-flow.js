// debug-pharmacy-flow.js
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function debugPharmacyFlow() {
  console.log('🔍 Debugging Pharmacy Flow...\n');
  
  const uri = "mongodb+srv://chyteit_db_user:Passion120@chytecluster.dtvisfs.mongodb.net/test?retryWrites=true&w=majority&appName=ChyteCluster";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    
    const db = client.db('test');
    
    console.log('📊 STEP 1: Check Pharmacy Document');
    console.log('='.repeat(50));
    
    const pharmacy = await db.collection('pharmacies').findOne({
      email: 'chikafavourchisom@gmail.com'
    });
    
    if (!pharmacy) {
      console.log('❌ ERROR: No pharmacy found with email: chikafavourchisom@gmail.com');
      return;
    }
    
    console.log('✅ Pharmacy found:');
    console.log({
      _id: pharmacy._id.toString(),
      email: pharmacy.email,
      role: pharmacy.role,
      pharmacyName: pharmacy.pharmacyName,
      ownerName: pharmacy.ownerName,
      approved: pharmacy.approved
    });
    
    console.log('\n📊 STEP 2: Check Pharmacy Wallet');
    console.log('='.repeat(50));
    
    const pharmacyWallet = await db.collection('wallets').findOne({
      userId: pharmacy._id.toString(),
      role: 'pharmacy'
    });
    
    console.log('✅ Pharmacy wallet:');
    if (pharmacyWallet) {
      console.log({
        balance: pharmacyWallet.balance,
        role: pharmacyWallet.role,
        totalEarned: pharmacyWallet.totalEarned,
        matchesPharmacyId: pharmacyWallet.userId === pharmacy._id.toString()
      });
    } else {
      console.log('❌ No wallet found for this pharmacy');
      
      // Check if any wallet exists with pharmacy role
      const anyPharmacyWallet = await db.collection('wallets').findOne({
        role: 'pharmacy'
      });
      
      if (anyPharmacyWallet) {
        console.log('\n⚠️ Found a pharmacy wallet but with different user ID:');
        console.log({
          userId: anyPharmacyWallet.userId,
          balance: anyPharmacyWallet.balance
        });
      }
    }
    
    console.log('\n📊 STEP 3: Check Chef Data (for comparison)');
    console.log('='.repeat(50));
    
    const chef = await db.collection('chefs').findOne({
      email: 'chikafavourchisom@gmail.com'
    });
    
    if (chef) {
      console.log('✅ Chef found:');
      console.log({
        _id: chef._id.toString(),
        role: chef.role
      });
      
      const chefWallet = await db.collection('wallets').findOne({
        userId: chef._id.toString(),
        role: 'chef'
      });
      
      if (chefWallet) {
        console.log('💰 Chef wallet balance:', chefWallet.balance);
      }
    }
    
    console.log('\n📊 STEP 4: Check Child Orders');
    console.log('='.repeat(50));
    
    // Check child orders for pharmacy
    const pharmacyOrders = await db.collection('childorders').find({
      vendorId: pharmacy._id.toString(),
      vendorRole: 'pharmacy'
    }).toArray();
    
    console.log(`📦 Pharmacy child orders: ${pharmacyOrders.length}`);
    
    if (pharmacyOrders.length > 0) {
      console.log('\nSample pharmacy order:');
      const sampleOrder = pharmacyOrders[0];
      console.log({
        orderId: sampleOrder._id,
        vendorAmount: sampleOrder.vendorAmount,
        subtotal: sampleOrder.subtotal,
        status: sampleOrder.status,
        vendorRole: sampleOrder.vendorRole
      });
    }
    
    // Check child orders for chef (to compare)
    if (chef) {
      const chefOrders = await db.collection('childorders').find({
        vendorId: chef._id.toString(),
        vendorRole: 'chef'
      }).toArray();
      
      console.log(`\n👨‍🍳 Chef child orders: ${chefOrders.length}`);
    }
    
    console.log('\n📊 STEP 5: Test Authentication Flow');
    console.log('='.repeat(50));
    
    console.log('Expected behavior:');
    console.log('1. Login with email: chikafavourchisom@gmail.com, role: "pharmacy"');
    console.log('2. NextAuth should find pharmacy with ID:', pharmacy._id.toString());
    console.log('3. Session should have userId:', pharmacy._id.toString());
    console.log('4. Earnings API should query with userId:', pharmacy._id.toString());
    console.log('5. Should return balance: ₦', pharmacyWallet?.balance || 0);
    
    console.log('\n🔍 Potential Issues:');
    console.log('1. Is NextAuth returning wrong user ID?');
    console.log('2. Is session storing wrong user ID?');
    console.log('3. Is earnings API using wrong query?');
    console.log('4. Is there a wallet mismatch?');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

debugPharmacyFlow();