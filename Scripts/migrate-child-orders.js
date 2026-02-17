// scripts/migrate-child-orders.js
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected');

  const childOrders = await mongoose.connection.collection('childorders').find({}).toArray();
  console.log(`📦 Found ${childOrders.length} child orders`);

  let updated = 0;

  for (const order of childOrders) {
    const update = { $set: {} };

    // If vendorRole is missing, try to infer from context or set default 'vendor'
    if (!order.vendorRole) {
      // Try to determine role – maybe from parent order or default
      update.$set.vendorRole = 'vendor'; // fallback
    }

    // If commissionAmount/vendorAmount are missing, calculate them
    if (order.commissionAmount === undefined || order.vendorAmount === undefined) {
      const subtotal = order.subtotal || 0;
      // You need a way to know the commission rate. This is a guess.
      const commissionRate = 0.10; // default 10%
      const commission = subtotal * commissionRate;
      const vendorAmount = subtotal - commission;

      if (order.commissionAmount === undefined) update.$set.commissionAmount = commission;
      if (order.vendorAmount === undefined) update.$set.vendorAmount = vendorAmount;
      if (!order.commissionRate) update.$set.commissionRate = commissionRate;
    }

    // If status is 'DELIVERED' but not 'PAID', you might want to set paid status
    // This depends on your business logic. For now, we'll leave as is.

    if (Object.keys(update.$set).length > 0) {
      await mongoose.connection.collection('childorders').updateOne(
        { _id: order._id },
        update
      );
      updated++;
      console.log(`✅ Updated order ${order._id}`);
    }
  }

  console.log(`\n📊 Updated ${updated} orders`);
  process.exit();
}

migrate();