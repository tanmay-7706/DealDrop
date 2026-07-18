"use server";

import { createClient } from "@/utils/supabase/server";
import { scrapeProduct } from "@/lib/firecrawl";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addProduct(formData) {
  const url = formData.get("url");

  if (!url) {
    return { error: "URL is required" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated" };
    }

    // Scrape product data with Firecrawl
    const productData = await scrapeProduct(url);

    if (!productData.productName || !productData.currentPrice) {
      console.log(productData, "productData");
      return { error: "Could not extract product information from this URL" };
    }

    const newPrice = parseFloat(productData.currentPrice);
    const currency = productData.currencyCode || "INR";

    // Check if product exists to determine if it's an update
    const { data: existingProduct } = await supabase
      .from("products")
      .select("id, current_price")
      .eq("user_id", user.id)
      .eq("url", url)
      .single();

    const isUpdate = !!existingProduct;

    // Upsert product (insert or update based on user_id + url)
    const { data: product, error } = await supabase
      .from("products")
      .upsert(
        {
          user_id: user.id,
          url,
          name: productData.productName,
          current_price: newPrice,
          currency: currency,
          image_url: productData.productImageUrl,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,url", // Unique constraint on user_id + url
          ignoreDuplicates: false, // Always update if exists
        }
      )
      .select()
      .single();

    if (error) throw error;

    // Add to price history if it's a new product OR price changed
    const shouldAddHistory =
      !isUpdate || existingProduct.current_price !== newPrice;

    if (shouldAddHistory) {
      await supabase.from("price_history").insert({
        product_id: product.id,
        price: newPrice,
        currency: currency,
      });
    }

    revalidatePath("/");
    return {
      success: true,
      product,
      message: isUpdate
        ? "Product updated with latest price!"
        : "Product added successfully!",
    };
  } catch (error) {
    console.error("Add product error:", error);
    return { error: error.message || "Failed to add product" };
  }
}

export async function deleteProduct(productId) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) throw error;

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

export async function getProducts() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Get products error:", error);
    return [];
  }
}

export async function getPriceHistory(productId) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("price_history")
      .select("*, currency")
      .eq("product_id", productId)
      .order("checked_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Get price history error:", error);
    return [];
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/");
}

export async function getTrendingProducts() {
  try {
    const { createAdminClient } = await import("@/utils/supabase/admin");
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("products")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(6);

    if (error) throw error;
    
    // Deduplicate by URL in case multiple users track the same product
    const uniqueProducts = [];
    const urls = new Set();
    for (const p of (data || [])) {
      if (!urls.has(p.url)) {
        urls.add(p.url);
        uniqueProducts.push(p);
      }
    }
    
    // Seed with mock data if we have fewer than 3 products to show engagement
    if (uniqueProducts.length < 3) {
      const mockProducts = [
        {
          id: "mock-1",
          name: "Apple AirPods Pro (2nd Generation)",
          url: "https://www.apple.com/shop/product/MTJV3AM/A/airpods-pro",
          current_price: 249.00,
          currency: "USD",
          image_url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MTJV3?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1694014871985",
          created_at: new Date().toISOString(),
          isPublic: true // mock flag
        },
        {
          id: "mock-2",
          name: "Sony WH-1000XM5 Wireless Headphones",
          url: "https://electronics.sony.com/audio/headphones/headband/p/wh1000xm5-b",
          current_price: 398.00,
          currency: "USD",
          image_url: "https://electronics.sony.com/image/5d02da5df552836db894cead8a68f5f3?fmt=pjpeg&wid=330&bgcolor=FFFFFF&bgc=FFFFFF",
          created_at: new Date().toISOString(),
          isPublic: true
        },
        {
          id: "mock-3",
          name: "Dyson Airwrap™ multi-styler",
          url: "https://www.dyson.com/hair-care/hair-stylers/airwrap",
          current_price: 599.99,
          currency: "USD",
          image_url: "https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/images/products/primary/395386-01.png?$responsive$&fmt=png-alpha&cropPathE=desktop&fit=stretch,1&wid=1920",
          created_at: new Date().toISOString(),
          isPublic: true
        }
      ];
      
      // Fill the remaining slots with mock products
      for (const mock of mockProducts) {
        if (uniqueProducts.length >= 6) break;
        if (!urls.has(mock.url)) {
          uniqueProducts.push(mock);
        }
      }
    }

    return uniqueProducts;
  } catch (error) {
    console.error("Get trending products error:", error);
    return [];
  }
}

export async function updateTargetPrice(productId, targetPrice) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("products")
      .update({ target_price: targetPrice || null })
      .eq("id", productId)
      .eq("user_id", user.id);

    if (error) throw error;
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: error.message || "Failed to update target price" };
  }
}

export async function getUserSettings() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // If no settings exist yet, return defaults
    if (error && error.code === 'PGRST116') {
      return { default_currency: 'INR', discord_webhook_url: null };
    }
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Get user settings error:", error);
    return null;
  }
}

export async function updateUserSettings(settings) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("user_settings")
      .upsert({ 
        user_id: user.id, 
        ...settings,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) throw error;
    revalidatePath("/settings");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Update user settings error:", error);
    return { error: error.message || "Failed to update settings" };
  }
}