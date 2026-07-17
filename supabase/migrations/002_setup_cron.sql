-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create function to trigger price checks via Next.js API
CREATE OR REPLACE FUNCTION trigger_price_check()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://your-actual-vercel-url.vercel.app/api/cron/check-prices',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer dc528db5c63eabb7cbdf145f207b8b92af0ad325ce529e8927c65dee3ebd364c'
    )
  );
END;
$$;

-- Schedule the cron job to run daily at 9 AM UTC
SELECT cron.schedule(
  'daily-price-check',
  '0 9 * * *',
  $$ SELECT trigger_price_check() $$
);
