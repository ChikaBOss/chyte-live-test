const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

// Allow Node to load .ts files
require("ts-node").register({ transpileOnly: true });

const mongoose = require("mongoose");

// Import your TS model and DB URI
const DeliveryPricing = require("../src/models/DeliveryPricing").default;

const seedData = [
  {
    baseLocation: "Eziobodo",
    deliveryAreas: [
      { area: "Eziobodo", price: 700 },
      { area: "Eziobodo market square", price: 1000 },
      { area: "Inside school", price: 1000 },
      { area: "Umuchima", price: 1200 },
      { area: "Back gate", price: 1500 },
      { area: "Ihiagwa", price: 2000 },
      { area: "Ihiagwa after market square", price: 2500 },
      { area: "Along Futo gate road", price: 2000 },
      { area: "After Futo junction, bk supermarket, Sambawizzy", price: 2500 },
      { area: "Redemption estate", price: 3000 },
      { area: "Avu junction", price: 3500 },
      { area: "Hospital junction", price: 4000 },
      { area: "New owerri/World bank", price: 4000 },
      { area: "Poly junction", price: 3500 }
    ],
    updatedBy: new mongoose.Types.ObjectId()
  },
  {
    baseLocation: "Umuchima",
    deliveryAreas: [
      { area: "Eziobodo", price: 1000 },
      { area: "Eziobodo market square", price: 1500 },
      { area: "Inside school", price: 1000 },
      { area: "Umuchima", price: 700 },
      { area: "Back gate", price: 800 },
      { area: "Ihiagwa", price: 1000 },
      { area: "Ihiagwa after market square", price: 1500 },
      { area: "Along Futo gate road", price: 2000 },
      { area: "After Futo junction, bk supermarket, Sambawizzy", price: 2500 },
      { area: "Redemption estate", price: 3000 },
      { area: "Avu junction", price: 3500 },
      { area: "Hospital junction", price: 4000 },
      { area: "New owerri/World bank", price: 4000 },
      { area: "Poly junction", price: 2500 }
    ],
    updatedBy: new mongoose.Types.ObjectId()
  },
  {
    baseLocation: "Back gate",
    deliveryAreas: [
      { area: "Eziobodo", price: 1000 },
      { area: "Eziobodo market square", price: 1500 },
      { area: "Inside school", price: 1000 },
      { area: "Umuchima", price: 800 },
      { area: "Back gate", price: 700 },
      { area: "Ihiagwa", price: 1000 },
      { area: "Ihiagwa after market square", price: 1500 },
      { area: "Along Futo gate road", price: 2000 },
      { area: "After Futo junction, bk supermarket, Sambawizzy", price: 2500 },
      { area: "Redemption estate", price: 3000 },
      { area: "Avu junction", price: 3500 },
      { area: "Hospital junction", price: 4000 },
      { area: "New owerri/World bank", price: 4000 },
      { area: "Poly junction", price: 2500 }
    ],
    updatedBy: new mongoose.Types.ObjectId()
  }
];

(async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");

    await DeliveryPricing.deleteMany({});
    await DeliveryPricing.insertMany(seedData);

    console.log("✅ Delivery pricing seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
})();