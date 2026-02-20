# Task: Integrate TSTT Marketplace with TSTT MicroLoan Platform

## Context

The TSTT Marketplace (an "Amazon for Trinidad" demo) has been built on Open Mercato and pushed to `dmvevents/open-mercato`. It includes a storefront with a checkout flow that calls two microloan API endpoints. These endpoints currently run in **demo mode** (simulated responses). Your job is to wire them to the **real** `tsct-microloan-platform` so the demo shows a live end-to-end purchase-to-loan flow.

## Step 1: Pull the TSTT Marketplace

```bash
git clone git@github.com:dmvevents/open-mercato.git
cd open-mercato
yarn install
```

Verify the build works:
```bash
yarn build
```

The marketplace storefront is at `/` when you run `yarn dev`. The admin backend is at `/backend`. The old start page is at `/start`.

## Step 2: Understand the Integration Surface

The marketplace has two API routes that proxy to the microloan platform:

### `apps/mercato/src/app/api/microloan/eligibility/route.ts`

**Current behavior:** If `MICROLOAN_API_URL` env var is set, it proxies to the real API. Otherwise returns demo data.

**What it should do with real integration:**
1. Receive `{ phone: string, amount: number }` from the checkout page
2. Call `GET ${MICROLOAN_API_URL}/bff/api/v1/clients/msisdn_${normalizedPhone}` with header `X-API-Key: ${MICROLOAN_API_KEY}`
3. If client exists and is active → eligible
4. If client doesn't exist → create one via `POST ${MICROLOAN_API_URL}/bff/api/v1/clients` with `{ active: true, tags: ["msisdn_${phone}"] }`
5. Return eligibility status + available loan products (the 5 tiers: $500-$2500 TTD)

### `apps/mercato/src/app/api/microloan/apply/route.ts`

**Current behavior:** If `MICROLOAN_API_URL` is set, it creates a loan via the real API. Otherwise returns demo approval.

**What it should do with real integration:**
1. Receive `{ phone, amount, loanProductId, cartItems }` from the checkout
2. Look up the client: `GET ${MICROLOAN_API_URL}/bff/api/v1/clients/msisdn_${phone}`
3. Create a loan: `POST ${MICROLOAN_API_URL}/bff/api/v1/loans` with:
   ```json
   {
     "clientTag": "msisdn_${phone}",
     "amount": "<amount>",
     "currency": "TTD",
     "tags": ["ecommerce_order_${generatedOrderId}", "marketplace_checkout"]
   }
   ```
4. Approve and disburse: `PUT ${MICROLOAN_API_URL}/bff/api/v1/loans/${loanId}?command=approveAndDisburse`
5. Return the loan details (ID, status, amount, term, monthly payment) to the marketplace checkout

## Step 3: Configure the MicroLoan Platform

Ensure the `tsct-microloan-platform` is running locally. It should be accessible at something like `http://localhost:3100` (or whatever port it uses).

### Required services:
- **API Gateway** (Node.js/Express) — the BFF layer
- **Apache Fineract** (lending engine) — handles loan lifecycle
- **PostgreSQL** (gateway DB)
- **MariaDB** (Fineract DB)
- **Redis** (caching)

If using Docker:
```bash
cd tsct-microloan-platform
docker-compose up -d
```

### Create an API key for the marketplace:
The microloan platform uses API key authentication. Create or locate an API key that the marketplace will use. This goes in the marketplace's `.env` file.

## Step 4: Set Environment Variables

Edit `apps/mercato/.env` in the open-mercato project and add:

```env
MICROLOAN_API_URL=http://localhost:3100
MICROLOAN_API_KEY=<your-api-key-here>
```

These are read by the two API route handlers. When set, they switch from demo mode to real API proxying.

## Step 5: Update the Proxy Logic (if needed)

Read these two files carefully and update the real-API code paths:

1. **`apps/mercato/src/app/api/microloan/eligibility/route.ts`**
   - The real-API branch currently does a basic GET to check client existence
   - Update it to handle these cases:
     - Client exists + active → return eligible with loan products
     - Client exists + inactive → return not eligible
     - Client not found (404) → auto-create client, then return eligible
     - API error → return a user-friendly error, don't expose internal details
   - Map the Fineract client response to the `MicroloanEligibility` type:
     ```typescript
     interface MicroloanEligibility {
       eligible: boolean
       maxAmount: number      // 2500 TTD
       currency: string       // "TTD"
       products: Array<{
         id: number
         amount: number        // 500, 1000, 1500, 2000, 2500
         term: string          // "3 months"
         monthlyPayment: number
         interestRate: number  // 0
       }>
     }
     ```

2. **`apps/mercato/src/app/api/microloan/apply/route.ts`**
   - The real-API branch should:
     a. Look up client by phone tag
     b. Create the loan account
     c. Immediately approve and disburse (for demo speed)
     d. Return `MicroloanApplication`:
     ```typescript
     interface MicroloanApplication {
       loanId: string          // from Fineract
       status: 'APPROVED'
       amount: number
       term: string
       monthlyPayment: number
       currency: string
     }
     ```
   - Handle errors gracefully: if loan creation fails, return a clear error message
   - Add the marketplace order reference as a loan tag for traceability

## Step 6: Test the End-to-End Flow

1. Start the microloan platform: `docker-compose up -d` (or however it runs)
2. Start the marketplace: `cd open-mercato && yarn dev`
3. Open `http://localhost:3000` — you should see the TSTT Marketplace storefront
4. Add a product to cart → go to checkout
5. Select "Pay with TSTT MicroLoan"
6. Enter a Trinidad phone number (868-XXX-XXXX)
7. Verify eligibility check hits the real Fineract API
8. Select a loan plan and confirm
9. Verify loan is created in Fineract (check via microloan admin dashboard)
10. Order confirmation should show the real loan ID

### Verify in the microloan admin:
- Check `GET /bff/api/v1/clients/msisdn_868XXXXXXX` returns the client
- Check `GET /bff/api/v1/clients/msisdn_868XXXXXXX/loans` shows the new loan
- Loan status should be ACTIVE after approval

## Step 7: Handle Edge Cases

Update the proxy routes to handle:
- **Network errors** (microloan service down): Fall back to demo mode or show "Service temporarily unavailable"
- **Rate limiting**: The microloan API rate-limits at 100 req/min per key
- **Idempotency**: If the user clicks "Confirm" twice, don't create duplicate loans. Use an idempotency key based on the cart contents + phone.
- **Amount validation**: Ensure the cart total doesn't exceed the max loan amount ($2,500 TTD). The checkout UI already shows only eligible plans, but validate server-side too.

## Step 8: Commit and Push

After the integration is working:
```bash
cd open-mercato
git add apps/mercato/src/app/api/microloan/
git commit -m "feat: wire microloan API routes to live Fineract backend"
git push origin main
```

Do NOT commit the `.env` file (it contains the API key).

## Reference: MicroLoan Platform API Cheat Sheet

| Operation | Method | Endpoint | Body |
|-----------|--------|----------|------|
| Check client | GET | `/bff/api/v1/clients/msisdn_{phone}` | — |
| Create client | POST | `/bff/api/v1/clients` | `{ active: true, tags: ["msisdn_{phone}"] }` |
| List client loans | GET | `/bff/api/v1/clients/{id}/loans` | — |
| Create loan | POST | `/bff/api/v1/loans` | `{ clientTag, amount, currency, tags }` |
| Approve+disburse | PUT | `/bff/api/v1/loans/{id}?command=approveAndDisburse` | `{}` |
| Record repayment | POST | `/bff/api/v1/loans/{id}/repay` | `{ amount, currency }` |

**Auth header:** `X-API-Key: <key>` on all requests

**Base URL:** Whatever `MICROLOAN_API_URL` is set to (e.g., `http://localhost:3100`)

## Reference: Marketplace Types

These types are defined in `apps/mercato/src/components/storefront/types.ts`:
- `MicroloanEligibility` — response from eligibility check
- `MicroloanProduct` — a loan tier (amount, term, monthly payment)
- `MicroloanApplication` — response from loan creation
- `CartItem` — items in the shopping cart (passed as context to loan creation)

## Success Criteria

The demo should show:
1. Customer browses products on the storefront
2. Customer adds items to cart
3. Customer enters phone at checkout → real eligibility check against Fineract
4. Customer selects loan plan → real loan created in Fineract
5. Order confirmed with real Fineract loan ID
6. Loan visible in microloan admin dashboard
7. Full round-trip in under 5 seconds
