# Edge Functions

## CORS error when email still sends

If `supabase.functions.invoke('send-excel-email')` sends mail but the browser shows a CORS error, the function is running on Supabase but the **response** is missing CORS headers (or `OPTIONS` is not handled).

Fix in **Supabase Dashboard → Edge Functions → send-excel-email**:

1. Handle `OPTIONS` and return `corsHeaders`.
2. Add `...corsHeaders` and `Content-Type: application/json` on **every** success and error `Response`.

See `send-excel-email/index.example.ts` for the pattern.

Deploy after editing:

```bash
supabase functions deploy send-excel-email
```
