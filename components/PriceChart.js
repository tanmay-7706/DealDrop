"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getPriceHistory } from "@/app/actions";
import { Loader2 } from "lucide-react";

export default function PriceChart({ productId, initialData = null }) {
  const [data, setData] = useState(initialData || []);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) return;

    async function loadData() {
      const history = await getPriceHistory(productId);

      const chartData = history.map((item) => ({
        date: new Date(item.checked_at).toLocaleDateString(),
        price: parseFloat(item.price),
      }));

      setData(chartData);
      setLoading(false);
    }

    loadData();
  }, [productId, initialData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500 w-full">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading chart...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 w-full">
        No price history yet. Check back after the first daily update!
      </div>
    );
  }

  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const currentPrice = prices[prices.length - 1];
  
  const isGoodDeal = currentPrice <= avgPrice && currentPrice <= minPrice * 1.05;
  const currencyCode = data[0]?.currency;
  const currencySymbol = currencyCode === 'USD' ? '$' : currencyCode === 'INR' ? '₹' : currencyCode === 'EUR' ? '€' : currencyCode === 'GBP' ? '£' : currencyCode || '₹';

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
          <div className="text-xs text-gray-500 mb-1">Current Price</div>
          <div className="text-lg font-bold text-gray-900">{currencySymbol}{currentPrice.toFixed(2)}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
          <div className="text-xs text-gray-500 mb-1">Lowest Price</div>
          <div className="text-lg font-bold text-green-600">{currencySymbol}{minPrice.toFixed(2)}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
          <div className="text-xs text-gray-500 mb-1">Highest Price</div>
          <div className="text-lg font-bold text-red-500">{currencySymbol}{maxPrice.toFixed(2)}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
          <div className="text-xs text-gray-500 mb-1">Average Price</div>
          <div className="text-lg font-bold text-gray-700">{currencySymbol}{avgPrice.toFixed(2)}</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">Price History</h4>
        {isGoodDeal ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            🟢 Great Time to Buy!
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            ⏳ Wait for a Drop
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value) => [`${currencySymbol}${value}`, "Price"]}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#FA5D19"
            strokeWidth={3}
            dot={{ fill: "#FA5D19", r: 4, strokeWidth: 2, stroke: "white" }}
            activeDot={{ r: 6, fill: "#FA5D19", stroke: "white", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}