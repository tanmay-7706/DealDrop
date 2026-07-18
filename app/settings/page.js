"use client";

import { useEffect, useState } from "react";
import { getUserSettings, updateUserSettings } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    default_currency: "INR",
    discord_webhook_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const data = await getUserSettings();
      if (data) {
        setSettings({
          default_currency: data.default_currency || "INR",
          discord_webhook_url: data.discord_webhook_url || "",
        });
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await updateUserSettings(settings);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Settings saved successfully!");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="inline-block">
            <Image
              src="/dealdrop-logo.jpeg"
              alt="Deal Drop Logo"
              width={200}
              height={60}
              className="h-8 w-auto"
            />
          </Link>
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Preferences</h2>
            <p className="text-sm text-gray-500 mb-6">Manage your general account settings.</p>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Currency
                </label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={settings.default_currency}
                  onChange={(e) => setSettings({ ...settings, default_currency: e.target.value })}
                >
                  <option value="INR">₹ INR (Indian Rupee)</option>
                  <option value="USD">$ USD (US Dollar)</option>
                  <option value="EUR">€ EUR (Euro)</option>
                  <option value="GBP">£ GBP (British Pound)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">This currency will be used as a fallback if the store's currency cannot be determined.</p>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Discord Integrations</h2>
            <p className="text-sm text-gray-500 mb-6">Get notified instantly in your Discord server when a price drops.</p>

            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discord Webhook URL
                </label>
                <Input
                  type="url"
                  placeholder="https://discord.com/api/webhooks/..."
                  value={settings.discord_webhook_url}
                  onChange={(e) => setSettings({ ...settings, discord_webhook_url: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-2">
                  To get a webhook URL, go to your Discord Server Settings &gt; Integrations &gt; Webhooks &gt; New Webhook.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600 gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
