export async function sendDiscordAlert(webhookUrl, product, oldPrice, newPrice) {
  try {
    const priceDrop = oldPrice - newPrice;
    const percentageDrop = ((priceDrop / oldPrice) * 100).toFixed(1);
    const isTargetHit = product.target_price && newPrice <= product.target_price;
    const titleMessage = isTargetHit ? "🎯 Target Price Hit!" : "🚨 Price Drop Alert!";

    const payload = {
      username: "DealDrop Bot",
      avatar_url: "https://deal-dropper.vercel.app/dealdrop-logo.jpeg",
      embeds: [
        {
          title: titleMessage,
          description: `The price for **[${product.name}](${product.url})** has dropped!`,
          color: 16407833, // Orange-ish color #FA5D19
          fields: [
            {
              name: "Current Price",
              value: `${product.currency} ${newPrice.toFixed(2)}`,
              inline: true
            },
            {
              name: "Previous Price",
              value: `~~${product.currency} ${oldPrice.toFixed(2)}~~`,
              inline: true
            },
            {
              name: "You Save",
              value: `${product.currency} ${priceDrop.toFixed(2)} (${percentageDrop}%)`,
              inline: true
            }
          ],
          thumbnail: {
            url: product.image_url || ""
          },
          footer: {
            text: "DealDrop Price Tracker"
          },
          timestamp: new Date().toISOString()
        }
      ]
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Discord webhook error:", error);
    return { error: error.message };
  }
}
