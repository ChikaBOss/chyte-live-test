export const vendors = [
    {
      id: "vendor-1",
      name: "Tasty Bites",
      image: "/logo.png",
      category: "Snacks & Drinks",
      rating: 4.5,
      location: "FUTO South Gate",
    },
    {
      id: "vendor-2",
      name: "Mama Nkechi Kitchen",
      image: "/logo.png",
      category: "Local Dishes",
      rating: 4.8,
      location: "FUTO Hostel Junction",
    },
  ];
  
  
  // src/utils/data.ts (or wherever you define it)

  export const topVendors = [
    {
      id: "v1",
      name: "SEKANI",
      image: "/logo.png",
      category: "Local & Continental",
      specialty: "Fried Rice, Jollof, Swallow",
      location: "Eziobodo",
      rating: 4.9,
    },
    {
      id: "v2",
      name: "FUTO CAFE",
      image: "/logo.png",
      category: "Cafeteria",
      specialty: "Variety of Affordable Meals",
      location: "Inside FUTO Campus",
      rating: 4.8,
    },
    {
      id: "v3",
      name: "SONIC FOODS",
      image: "/logo.png",
      category: "Fast Food",
      specialty: "Shawarma, Rice, Smoothies",
      location: "FUTO Road, Eziobodo",
      rating: 4.7,
    },
    // {
    //   id: "v4",
    //   name: "Healthy Bites",
    //   image: "/logo.png",
    //   category: "Salads",
    //   specialty: "Fruit & Veggie Salads",
    //   location: "FUTO Back Gate",
    //   rating: 4.6,
    // },
  ]; 

  export const foodVendors = [
    {
      id: 'fv1',
      name: 'Chop Life Kitchen',
      image: '/logo.png',
      category: 'Local & Continental',
      specialty: 'Party Rice & Afang Soup',
      location: 'FUTO Hostel A',
      rating: 4.8,
    },
    {
      id: 'fv2',
      name: 'Bellyful Foods',
      image: '/logo.png',
      category: 'Fast Food',
      specialty: 'Jollof Spaghetti & Turkey',
      location: 'South Gate Area',
      rating: 4.7,
    },
    {
      id: 'fv3',
      name: 'Yammy Pot',
      image: '/logo.png',
      category: 'Home-Cooked',
      specialty: 'Yam Porridge & Vegetables',
      location: 'Eziobodo Junction',
      rating: 4.6,
    },
    {
      id: 'fv4',
      name: 'Nwanyi Kitchen',
      image: '/logo.png',
      category: 'Traditional',
      specialty: 'Okro Soup & Fufu',
      location: 'FUTO Back Gate',
      rating: 4.5,
    },
  ];

  // utils/data.ts

export const chefs = [
    {
      id: 'c1',
      name: 'Chef Amara',
      image: '/images/chef1.jpg',
      specialty: 'African Dishes',
      experience: '5 years',
      rating: 4.8,
      location: 'FUTO Hostel Area',
    },
    {
      id: 'c2',
      name: 'Chef Emeka',
      image: '/images/chef2.jpg',
      specialty: 'Intercontinental',
      experience: '7 years',
      rating: 4.9,
      location: 'FUTO South Gate',
    },
    {
      id: 'c3',
      name: 'Chef Tega',
      image: '/images/chef3.jpg',
      specialty: 'Pastries & Cakes',
      experience: '4 years',
      rating: 4.7,
      location: 'FUTO Road',
    },
  ];

  // src/utils/pharmacies.ts

export const pharmacies = [
    {
      id: "p1",
      name: "HealthFirst Pharmacy",
      image: "/images/pharmacy1.jpg", // Add real image later
      location: "FUTO South Gate",
      specialty: "Prescription drugs & supplements",
      rating: 4.9,
    },
    {
      id: "p2",
      name: "Campus Meds",
      image: "/images/pharmacy2.jpg",
      location: "FUTO Hostel Junction",
      specialty: "Student-friendly medications",
      rating: 4.7,
    },
    {
      id: "p3",
      name: "GreenLife Pharmacy",
      image: "/images/pharmacy3.jpg",
      location: "FUTO North Road",
      specialty: "OTC and herbal medicines",
      rating: 4.6,
    },
  ];

  // src/utils/data.ts

export type Vendor = {
  id: string;
  name: string;
  image: string;     // e.g. "/images/logo.png"
  category: string;
  location: string;
  rating: number;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;     // e.g. "/images/jollof.jpg"
  vendorId: string;  // <— important
  vendorName: string; // <— denormalized for convenience
};

