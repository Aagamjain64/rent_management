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

Owner "Add tenant" me ye do cheezein bhar sakta hai (baad me tenant page pe "Rental details" se edit bhi ho jata hai):

- **Staying since** — tenant kab se reh raha hai. Khaali chhodo to aaj ki date lagti hai.
- **Old pending balance** — app se pehle ka jo paisa abhi baaki hai. Ye Previous due me judta hai.

Sabse aasan tareeka: Staying since = is mahine ki date, Old pending balance = abhi jitna baaki hai. Agar purani payments bhi daalni ho to Staying since purani date rakho aur payments us date ke saath add karo (Add payment me date badal sakte ho).

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
