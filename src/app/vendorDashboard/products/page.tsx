"use client";

import { useState, useEffect } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image?: string; // base64 string for preview
}

export default function VendorProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);

  // Load products from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("vendorProducts");
    if (saved) setProducts(JSON.parse(saved));
  }, []);

  // Save products to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("vendorProducts", JSON.stringify(products));
  }, [products]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addProduct = () => {
    if (!name || !price) return alert("Please enter name and price");

    const newProduct: Product = {
      id: Date.now(),
      name,
      price: Number(price),
      description,
      image: image || undefined,
    };

    setProducts([...products, newProduct]);
    setName("");
    setPrice("");
    setDescription("");
    setImage(null);
  };

  const deleteProduct = (id: number) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Products</h1>

      {/* Add Product Form */}
      <div className="bg-white shadow p-4 rounded mb-6">
        <h2 className="font-semibold mb-3">Add New Product</h2>
        <input
          className="border p-2 w-full mb-2 rounded"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          className="border p-2 w-full mb-2 rounded"
          placeholder="Price (₦)"
          value={price}
          onChange={(e) =>
            setPrice(e.target.value ? Number(e.target.value) : "")
          }
        />
        <textarea
          className="border p-2 w-full mb-2 rounded"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          className="border p-2 w-full mb-2 rounded"
          onChange={handleImageUpload}
        />
        {image && (
          <img
            src={image}
            alt="Preview"
            className="w-32 h-32 object-cover mb-2 rounded border"
          />
        )}
        <button
          onClick={addProduct}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add Product
        </button>
      </div>

      {/* Product List */}
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="py-3 px-4">Image</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Price (₦)</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded border"
                      />
                    ) : (
                      <span className="text-gray-400 italic">No image</span>
                    )}
                  </td>
                  <td className="py-3 px-4">{product.name}</td>
                  <td className="py-3 px-4">{product.price}</td>
                  <td className="py-3 px-4">{product.description}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="py-4 text-center text-gray-500 italic"
                >
                  No products yet. Add some above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}