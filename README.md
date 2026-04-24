# ✂️ Scintillate Unisex Salon — Appointment System

A full Vue.js 3 Composition API salon appointment booking system with:
- 📅 Date navigation (prev/next/today + date picker)
- 🪑 4-chair calendar grid (2 Hair + 2 Beauty)
- 📋 Booking modal (name, mobile, multi-select services)
- 💬 WhatsApp reminder — auto 15 min before + manual send
- 📊 Dashboard with booking stats and charts
- 🗂️ Google Sheets backend sync
- 💾 Local storage (works offline too)

---

## 🚀 Getting Started

### 1. Install & run locally

```bash
npm install
npm run dev
```

Open: http://localhost:5173

---

## 📊 Google Sheets Setup (to save data to Excel/Sheets)

### Step 1: Create Google Sheet
1. Go to https://sheets.google.com → New sheet
2. Copy the Sheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/**SHEET_ID_HERE**/edit`

### Step 2: Deploy Apps Script
1. In your Google Sheet → **Extensions → Apps Script**
2. Delete the default code
3. Paste the entire contents of `GoogleAppsScript.js`
4. Replace `YOUR_GOOGLE_SHEET_ID_HERE` with your actual Sheet ID
5. Click **Deploy → New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click **Deploy** → Copy the **Web App URL**

### Step 3: Connect to Vue app
Open `src/composables/useBookings.js` and replace:
```js
export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
```
with your actual URL.

---

## 📱 WhatsApp Reminders

### How it works:
1. **Auto-scheduled**: When you book with "Schedule WhatsApp reminder" ON, a 15-minute browser timer is set. 15 min before the appointment, a browser dialog pops asking if you want to send the WhatsApp message.
2. **Manual**: Click the WhatsApp icon on any booked slot to send immediately.
3. **Day summary**: "Share day summary" button sends all appointments for the day.

> ⚠️ Auto reminders only work while the browser tab is open. For production use, consider a WhatsApp Business API or a server-side cron job.

---

## 🗂️ Project Structure

```
src/
├── App.vue                    # Root layout with sidebar
├── main.js                    # Vue app + Router setup
├── style.css                  # Global design tokens
├── composables/
│   ├── useBookings.js         # Data: CRUD, localStorage, Sheets sync
│   └── useWhatsApp.js         # WhatsApp messages & reminder timers
├── views/
│   ├── Dashboard.vue          # Stats, charts, quick actions
│   └── Appointments.vue       # Calendar grid + date nav
└── components/
    └── BookingModal.vue       # Book/view/delete modal
```

---

## ➕ Adding New Menu Items

Open `src/App.vue` and add to the `menuItems` array:

```js
{
  path: '/clients',
  label: 'Clients',
  icon: `<svg ...>...</svg>`
}
```

Then add a route in `src/main.js`:
```js
{ path: '/clients', component: Clients }
```

---

## 🏗️ Build for production

```bash
npm run build
```

Output goes to `dist/` — deploy to any static host (Netlify, Vercel, GitHub Pages).