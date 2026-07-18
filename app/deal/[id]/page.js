import { createAdminClient } from "@/utils/supabase/admin";
import PriceChart from "@/components/PriceChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingDown, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: product } = await supabase.from("products").select("*").eq("id", id).single();

  if (!product) return { title: "Deal Not Found" };

  return {
    title: `${product.name} - Price Tracker`,
    description: `Track the price history of ${product.name} on Deal Drop.`,
    openGraph: {
      images: [product.image_url],
    },
  };
}

export default async function DealPage({ params }) {
  const { id } = await params;
  const supabase = createAdminClient();
  
  // Fetch product
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !product) {
    notFound();
  }

  // Fetch price history
  const { data: history } = await supabase
    .from("price_history")
    .select("*")
    .eq("product_id", id)
    .order("checked_at", { ascending: true });

  const chartData = (history || []).map((item) => ({
    date: new Date(item.checked_at).toLocaleDateString(),
    price: parseFloat(item.price),
  }));

  const storeName = (() => {
    try {
      const hostname = new URL(product.url).hostname.toLowerCase();
      if (hostname.includes("amazon")) return "Amazon";
      if (hostname.includes("flipkart")) return "Flipkart";
      if (hostname.includes("myntra")) return "Myntra";
      if (hostname.includes("zara")) return "Zara";
      const parts = hostname.replace("www.", "").split(".");
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    } catch (e) {
      return "Store";
    }
  })();

  const currencySymbol = product.currency === 'USD' ? '$' : product.currency === 'INR' ? '₹' : product.currency === 'EUR' ? '€' : product.currency === 'GBP' ? '£' : product.currency || '₹';

  return (
    <main className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-block mb-8">
          <Image
            src="/dealdrop-logo.jpeg"
            alt="Deal Drop Logo"
            width={200}
            height={60}
            className="h-8 w-auto"
          />
        </Link>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-6 md:p-10">
          <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
            {product.image_url && (
              <div className="w-full md:w-1/3 shrink-0 bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="max-w-full h-auto max-h-64 object-contain rounded-lg"
                />
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex gap-2 mb-4">
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  <TrendingDown className="w-3 h-3 mr-1" /> Price Tracked
                </Badge>
                <Badge variant="outline" className="text-gray-600">
                  {storeName}
                </Badge>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-end gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-500 font-medium mb-1">Current Price</div>
                  <div className="text-5xl font-extrabold text-orange-500">
                    {currencySymbol}{product.current_price}
                  </div>
                </div>
              </div>
              
              <Button asChild size="lg" className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600">
                <Link href={product.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Deal on {storeName}
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-8 mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Price History</h3>
            <PriceChart productId={id} initialData={chartData} />
          </div>
        </div>
        
        <div className="text-center mt-12 text-gray-500">
          Want to track your own products? <Link href="/" className="text-orange-500 font-medium hover:underline">Sign up for DealDrop</Link>
        </div>
      </div>
    </main>
  );
}
