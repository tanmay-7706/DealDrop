"use client";

import { useState } from "react";
import { deleteProduct } from "@/app/actions";
import PriceChart from "./PriceChart";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { updateTargetPrice } from "@/app/actions";
import {
  ExternalLink,
  Trash2,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Bell,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

function getStoreName(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes("amazon")) return "Amazon";
    if (hostname.includes("flipkart")) return "Flipkart";
    if (hostname.includes("myntra")) return "Myntra";
    if (hostname.includes("zara")) return "Zara";
    const parts = hostname.replace("www.", "").split(".");
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  } catch (e) {
    return "Store";
  }
}

export default function ProductCard({ product, isPublic = false }) {
  const [showChart, setShowChart] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetPrice, setTargetPrice] = useState(product.target_price || "");
  const [savingTarget, setSavingTarget] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await deleteProduct(product.id);
    setShowDeleteModal(false);
  };

  const handleSaveTarget = async () => {
    setSavingTarget(true);
    await updateTargetPrice(product.id, targetPrice ? parseFloat(targetPrice) : null);
    setShowTargetModal(false);
    setSavingTarget(false);
  };
  
  const storeName = getStoreName(product.url);

  return (
    <Card className="hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
      <CardHeader className="pb-3">
        <div className="flex gap-4">
          {product.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-md border"
            />
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
              {product.name}
            </h3>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-orange-500">
                {product.currency === 'USD' ? '$' : product.currency === 'INR' ? '₹' : product.currency === 'EUR' ? '€' : product.currency === 'GBP' ? '£' : product.currency || '₹'}{product.current_price}
              </span>
              <div className="flex gap-1 ml-auto md:ml-2 flex-wrap justify-end">
                <Badge variant="secondary" className="gap-1 bg-gray-100">
                  {storeName}
                </Badge>
                {product.target_price && (
                  <Badge variant="secondary" className="gap-1 text-green-600 bg-green-50">
                    <Bell className="w-3 h-3" />
                    Target: {product.currency === 'USD' ? '$' : product.currency === 'INR' ? '₹' : product.currency === 'EUR' ? '€' : product.currency === 'GBP' ? '£' : product.currency || '₹'}{product.target_price}
                  </Badge>
                )}
                <Badge variant="secondary" className="gap-1 text-orange-600 bg-orange-50">
                  <TrendingDown className="w-3 h-3" />
                  Tracking
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChart(!showChart)}
            className="gap-1"
          >
            {showChart ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide Chart
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show Chart
              </>
            )}
          </Button>

          <Button variant="outline" size="sm" asChild className="gap-1">
            <Link href={product.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
              View Product
            </Link>
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={() => {
              const url = `${window.location.origin}/deal/${product.id}`;
              navigator.clipboard.writeText(url);
              toast.success("Share link copied to clipboard!");
            }}
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>

          {!isPublic && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTargetModal(true)}
                className="gap-1"
              >
                <Bell className="w-4 h-4" />
                Target Alert
              </Button>

              <Dialog open={showTargetModal} onOpenChange={setShowTargetModal}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Set Target Price</DialogTitle>
                    <DialogDescription>
                      Get notified when the price drops below this amount. Leave blank to clear.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-medium">
                        {product.currency === 'USD' ? '$' : product.currency === 'INR' ? '₹' : product.currency === 'EUR' ? '€' : product.currency === 'GBP' ? '£' : product.currency || '₹'}
                      </span>
                      <Input
                        type="number"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                        placeholder="e.g. 15000"
                        className="text-lg"
                      />
                    </div>
                  </div>
                  <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setShowTargetModal(false)} disabled={savingTarget}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveTarget} disabled={savingTarget} className="bg-orange-500 hover:bg-orange-600">
                      {savingTarget ? "Saving..." : "Save Target"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={deleting}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Remove Product</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to stop tracking this product? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                    {deleting ? "Removing..." : "Remove"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </>
          )}
        </div>
      </CardContent>

      {showChart && (
        <CardFooter className="pt-0">
          <PriceChart productId={product.id} />
        </CardFooter>
      )}
    </Card>
  );
}