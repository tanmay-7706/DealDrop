"use client";

import { useState, useMemo } from "react";
import ProductCard from "./ProductCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function DashboardClient({ products }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest, lowest, highest
  
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(query) || p.url.toLowerCase().includes(query));
    }
    
    // Sort
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === "lowest") {
        return a.current_price - b.current_price;
      } else if (sortBy === "highest") {
        return b.current_price - a.current_price;
      }
      return 0;
    });
    
    return result;
  }, [products, searchQuery, sortBy]);

  return (
    <section className="max-w-7xl mx-auto px-4 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Your Tracked Products
          </h3>
          <span className="text-sm text-gray-500">
            {products.length} {products.length === 1 ? "product" : "products"}
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              type="text" 
              placeholder="Search products..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full sm:w-40"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Recently Added</option>
            <option value="lowest">Lowest Price</option>
            <option value="highest">Highest Price</option>
          </select>
        </div>
      </div>

      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
          No products found matching your search.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 items-start">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
