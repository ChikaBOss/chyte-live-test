"use client";

import { useState, useEffect } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

export default function PharmacyProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("pharmacyProducts");
    if (saved) setProducts(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("pharmacyProducts", JSON.stringify(products));
  }, [products]);

  const addProduct = () => {
    if (!name || !price) return alert("Please enter name and price");

    const newProduct: Product = {
      id: Date.now(),
      name,
      price: Number(price),
      description,
    };

    setProducts([...products, newProduct]);
    setName("");
    setPrice("");
    setDescription("");
  };

  const deleteProduct = (id: number) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Pharmacy Products</h1>

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
        <button
          onClick={addProduct}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add Product
        </button>
      </div>

      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100 border-b">
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
                <td colSpan={4} className="py-4 text-center text-gray-500">
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