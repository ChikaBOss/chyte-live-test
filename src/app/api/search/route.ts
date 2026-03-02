import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb'; // adjust path if needed
import vendors from '@/models/VendorProduct';
import Meal from '@/models/meal';
import PharmacyProduct from '@/models/PharmacyProduct';
import TopVendorProduct from '@/models/TopVendorProduct';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  await connectToDB();

  // Create a regex for case‑insensitive search
  const regex = new RegExp(query, 'i');

  // Run searches in parallel
  const [vendorProducts, chefMeals, pharmacyProducts, topVendorProducts] = await Promise.all([
    vendors.find({ name: regex, isAvailable: true }).populate('vendorId', 'businessName pickupZone').lean(),
    Meal.find({ name: regex }).populate('chefId', 'displayName businessName pickupZone').lean(),
    PharmacyProduct.find({ name: regex, isAvailable: true }).populate('pharmacyId', 'pharmacyName businessName pickupZone').lean(),
    TopVendorProduct.find({ name: regex, isAvailable: true }).populate('topVendorId', 'businessName pickupZone').lean(),
  ]);

  // Normalize results
  const results = [
    ...vendorProducts.map(p => ({
      id: p._id,
      name: p.name,
      price: p.price,
      image: p.imageUrl,
      vendorId: p.vendorId?._id || p.vendorId,
      vendorName: p.vendorId?.businessName || 'Vendor',
      vendorType: 'vendor',
      pickupZone: p.vendorId?.pickupZone,
    })),
    ...chefMeals.map(m => ({
      id: m._id,
      name: m.name,
      price: m.price,
      image: m.imageUrl,
      vendorId: m.chefId?._id || m.chefId,
      vendorName: m.chefId?.displayName || m.chefId?.businessName || 'Chef',
      vendorType: 'chef',
      pickupZone: m.chefId?.pickupZone,
    })),
    ...pharmacyProducts.map(p => ({
      id: p._id,
      name: p.name,
      price: p.price,
      image: p.imageUrl,
      vendorId: p.pharmacyId?._id || p.pharmacyId,
      vendorName: p.pharmacyId?.pharmacyName || p.pharmacyId?.businessName || 'Pharmacy',
      vendorType: 'pharmacy',
      pickupZone: p.pharmacyId?.pickupZone,
    })),
    ...topVendorProducts.map(p => ({
      id: p._id,
      name: p.name,
      price: p.price,
      image: p.imageUrl,
      vendorId: p.topVendorId?._id || p.topVendorId,
      vendorName: p.topVendorId?.businessName || 'Top Vendor',
      vendorType: 'topvendor',
      pickupZone: p.topVendorId?.pickupZone,
    })),
  ];

  // Sort by name
  results.sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({ results });
}