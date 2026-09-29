# Rent Diary — simple MERN rent management

Keep track of tenants, rent paid, remaining rent, electricity (light) bills, and payment history. The UI is English + Hindi.

## Requirements

- Node.js 18+
- MongoDB running locally (default: `mongodb://127.0.0.1:27017/rent_management`)

## Setup

```bash
npm run install:all
```

Copy `server/.env.example` to `server/.env` if needed. A development `.env` is already included.

## Run

Start MongoDB, then:

```bash
npm run seed
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:5000

## Demo logins (PIN `1234`)

| Role   | User ID    |
|--------|------------|
| Admin  | ADMIN001   |
| Owner  | OWNER001   |
| Tenant | TENANT001  |
| Tenant | TENANT002  |

Login page pe pehle role chuno (Tenant / Owner / Admin), phir User ID + PIN.

## Kaun kya kar sakta hai

| Role | Access |
|------|--------|
| Admin | Owners aur tenants banana (room + rent ke saath), tenant ko owner assign karna, PIN reset, sabka payment overview |
| Owner (malik) | Apne tenants add karna (room, monthly rent), payment add/edit (partial bhi), light bill, PDF. Sirf apne tenants dikhte hain |
| Tenant (rent dene wala) | Sirf apni details, is mahine ka rent/remaining/light bill, payment history, PDF. Rent aur room owner tay karta hai, tenant badal nahi sakta |

A new tenant should complete profile details once (name, mobile, room, government ID, monthly rent). After that the dashboard shows the saved information with masked ID numbers.

Owner can add multiple / partial payments. History is never deleted when a new payment is added.

**Download PDF** is available on owner tenant detail and tenant dashboard.

## Pichla baaki (Previous due)

Agar tenant ne pichle mahine ka rent ya light bill poora nahi diya, to wo baaki apne aap agle mahine ke total me judta hai.

`Total due = Previous due + is mahine ka rent + light bill − ab tak diye gaye paise`

Previous due owner dashboard, tenant page, tenant dashboard, admin overview aur PDF me dikhta hai. Tenant ka pehla mahina wahi hota hai jis mahine account bana.

## Purane (pehle se rehne wale) tenants

Owner "Add tenant" me ye bhar sakta hai (tenant page pe "Rental details" se baad me edit bhi hota hai):

- **Pending balance till now** — abhi tak ka jitna paisa baaki hai. Bas wahi number likho.
- **Staying since** — sirf record ke liye. Isse hisaab nahi badalta.

Hisaab us mahine se shuru hota hai jab tenant app me add hua (ya jab pending balance last badla). Us se pehle ka sab pending balance me hi hai, isliye purani payments alag se daalne ki zaroorat nahi.

Example: rent 3500, pending balance 10000 → Total due = 10000 + 3500 = 13500. Agle mahine ki 1 tareekh ko agar kuch nahi diya to previous due 13500 ho jata hai aur naya 3500 judta hai.

## Admin aur remove access

- Login page pe sirf **Tenant / Owner** ka option hai. Admin banane ke liye MongoDB Atlas me us user ka `role` field `"admin"` kar do. Admin kisi bhi option se login kar leta hai (User ID + PIN sahi hona chahiye).
- **Owner** apne tenant ko hata sakta hai (tenant page pe "Remove this tenant" ya dashboard table me "Remove").
- **Admin** owner aur tenant dono hata sakta hai. Owner tabhi hatega jab uske koi tenant na bache.
- Tenant hatane pe uska login, payments aur light bills hamesha ke liye delete ho jate hain. Confirm poochta hai.
- Owner dashboard pe sabhi tenants ka **total pending** paisa upar dikhta hai.
- Deploy se pehle `server/.env` me `JWT_SECRET` badlo aur `ADMIN_PIN=1234` hata do ya badal do.

## Mobile

Mobile pe upar sirf naam aur ☰ (hamburger) button dikhta hai. Usse menu, language aur logout khulte hain. Owner dashboard pe mobile me tenant cards dikhte hain, laptop pe table.

## Paid / Remaining kaise dikhta hai

Rent aur electricity dono ke payment ab cards me alag-alag dikhte hain:

- **Paid this month** = rent diya + light bill diya
- **Remaining this month** = rent baaki + light bill baaki
- **Light bill** card me bill, kitna diya aur kitna baaki teeno dikhte hain
- **Total due** = Previous due + Remaining this month

## Live deploy (client aur server alag)

Client ko server se jodne ke liye `client/.env` chahiye. Local pe iski zaroorat nahi.

1. **Server deploy karo** (Render/Railway). Server ke environment variables me:
   - `MONGODB_URI` = Atlas ka connection string
   - `JWT_SECRET` = lamba random secret
   - `CLIENT_URL` = client ka live URL (jaise `https://rent-app.vercel.app`, end me `/` nahi)
   - `ADMIN_PIN` badlo ya hata do
2. **Client deploy karo** (Vercel/Netlify). Build settings: root `client`, build `npm run build`, output `dist`. Environment variable:
   - `VITE_API_URL` = server ka live URL (jaise `https://rent-api.onrender.com`, `/api` mat lagao)
3. Env badalne ke baad client dobara build/deploy karna padta hai (Vite build ke time value andar daal deta hai).

Check: server URL ke aage `/api/health` (ya koi bhi API) browser me khol ke dekho, aur client se login try karo. Login na ho aur browser console me CORS error aaye to `CLIENT_URL` galat hai.
