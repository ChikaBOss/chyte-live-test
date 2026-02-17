// fix-pharmacy-orders.js
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function fixPharmacyOrders() {
  console.log('🏥 Fixing pharmacy orders...\n');
  
  const uri = "mongodb+srv://chyteit_db_user:Passion120@chytecluster.dtvisfs.mongodb.net/test?retryWrites=true&w=majority&appName=ChyteCluster";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('test');
    
    // 1. Get pharmacy wallet
    const pharmacyWallet = await db.collection('wallets').findOne({
      userId: '696b7604d13d0ca193c05f7f',
      role: 'pharmacy'
    });
    
    console.log('💰 Pharmacy wallet balance:', pharmacyWallet?.balance);
    
    // 2. Get all child orders for pharmacy
    const pharmacyOrders = await db.collection('childorders').find({
      vendorId: '696b7604d13d0ca193c05f7f',
      vendorRole: 'pharmacy'
    }).toArray();
    
    console.log(`📦 Current pharmacy orders: ${pharmacyOrders.length}`);
    
    // Calculate total from orders
    const totalFromOrders = pharmacyOrders.reduce((sum, o) => sum + (o.vendorAmount || 0), 0);
    console.log(`💰 Total from orders: ₦${totalFromOrders}`);
    console.log(`💰 Wallet balance: ₦${pharmacyWallet?.balance}`);
    console.log(`📊 Difference: ₦${(pharmacyWallet?.balance || 0) - totalFromOrders}`);
    
    // 3. Check which parent orders have pharmacy items
    const parentOrders = await db.collection('orders').find({
      'vendorGroups.vendorId': '696b7604d13d0ca193c05f7f'
    }).toArray();
    
    console.log(`\n📊 Found ${parentOrders.length} parent orders with pharmacy items`);
    
    parentOrders.forEach(order => {
      const vendorGroup = order.vendorGroups.find(v => v.vendorId === '696b7604d13d0ca193c05f7f');
      console.log(`\nOrder ${order._id}:`);
      console.log(`  - Subtotal: ₦${vendorGroup?.subtotal}`);
      console.log(`  - Commission (12%): ₦${vendorGroup?.subtotal * 0.12}`);
      console.log(`  - Vendor gets: ₦${vendorGroup?.subtotal * 0.88}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

fixPharmacyOrders();