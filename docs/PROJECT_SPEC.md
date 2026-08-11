Saya ingin membangun sebuah web application bernama "AnimeSeries Watchlog" untuk mencatat, mengelola, menganalisis, dan menampilkan daftar Anime dan TV Series yang telah saya tonton.

Aplikasi ini merupakan personal media tracker dengan nuansa RETRO FILM + COMICAL + OTAKU dengan visual yang playful tetapi tetap modern dan profesional.

==================================================
1. TECH STACK
==================================================

Frontend:
- React.js
- Vite
- TypeScript
- React Router
- Tailwind CSS
- shadcn/ui atau komponen UI custom
- Recharts untuk chart
- Lucide React untuk icon
- Axios untuk HTTP request
- React Hook Form
- Zod untuk validation
- TanStack Query untuk data fetching/cache jika diperlukan

Backend:
- Node.js
- Express.js
- REST API
- Axios
- dotenv
- cors
- helmet
- morgan
- express-rate-limit
- Zod/Joi untuk request validation

Database:
- Supabase PostgreSQL

Storage:
- Supabase Storage untuk menyimpan poster/image Anime dan TV Series

Architecture:
React Vite
      ↓
Express REST API
      ↓
Supabase PostgreSQL
      ↓
Supabase Storage

Jangan melakukan query database Supabase secara langsung dari frontend untuk operasi CRUD utama.
Semua operasi CRUD utama harus melewati Express API.

Gunakan environment variables:
Frontend:
VITE_API_URL

Backend:
PORT
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY

Jangan pernah expose SUPABASE_SERVICE_ROLE_KEY ke frontend.

==================================================
2. CORE CONCEPT
==================================================

Aplikasi menyimpan daftar Anime dan TV Series yang sudah ditonton.

Setiap item disebut sebagai "Media".

Media memiliki tipe:
- Anime
- TV Series

Contoh data Anime:
- Dragon Ball Super
- Kimetsu no Yaiba
- Dr. Stone S01
- One Punch Man S01
- My Hero Academia S01

Contoh data TV Series:
- The Umbrella Academy S01
- Watchmen
- The Mandalorian S01
- The Boys S01
- Dark S01
- Dark S02

==================================================
3. Struktur halaman
==================================================
| Halaman            | Fungsi                                         |
| ------------------ | ---------------------------------------------- |
| 🏠 Dashboard       | Ringkasan seluruh aktivitas menonton           |
| 🎬 Watchlist       | Semua Anime & TV Series                        |
| 🏆 Top 10          | Ranking berdasarkan rating                     |
| 📅 Watch History   | Riwayat berdasarkan tanggal menonton           |
| 🎞️ Timeline       | Visual perjalanan tontonan dari waktu ke waktu |
| 🏷️ Genres         | CRUD master genre                              |
| 🏢 Studios         | Master & analisis studio                       |
| 🔎 Genre Explorer  | Analisis berdasarkan genre                     |
| 🏭 Studio Explorer | Analisis berdasarkan studio                    |
| 📊 Insights        | Statistik mendalam                             |

==================================================
4. Gambar
==================================================

Untuk image/poster pada database, jangan menyimpan gambar langsung sebagai BLOB di PostgreSQL.

Gunakan:

Supabase
│
├── PostgreSQL
│   ├── media
│   ├── genres
│   ├── studios
│   └── media_genres
│
└── Storage
    ├── media-posters/
    │   ├── dark-s01.webp
    │   ├── dark-s02.webp
    │   └── kimetsu-no-yaiba.webp
    │
    └── media-backdrops/

Database cukup menyimpan:

poster_url
backdrop_url

==================================================
5. UI COMPONENTS
==================================================

Frontend harus memiliki:

Loading state
Empty state
Error state
Success toast
Delete confirmation

Buat reusable components:

Navbar
Sidebar
StatCard
MediaCard
MediaTable
MediaPoster
ScoreBadge
GenreBadge
StudioBadge
SearchBar
FilterPanel
Pagination
SortHeader
DateRangePicker
MediaForm
GenreForm
StudioForm
ConfirmDialog
ImageUploader
ChartCard
EmptyState
LoadingSkeleton
Toast
Modal
Timeline
RankingCard

Jangan membuat komponen duplikat.

==================================================
6. RESPONSIVE DESIGN
==================================================

Desktop:
full dashboard + sidebar + table.

Tablet:
collapsible sidebar.

Mobile:
card-based media list.

Table desktop:
horizontal scroll jika diperlukan.

Dashboard charts:
responsive.

Semua halaman harus usable pada:
- 1440px
- 1280px
- 1024px
- 768px
- 390px

==================================================
7. DARK MODE
==================================================

Tambahkan Dark Mode.

Light:
cream/off-white background.

Dark:
deep navy/black.

Purple/Cyan/Yellow tetap menjadi accent.

Persist theme di localStorage.

==================================================
8. MICRO INTERACTION
==================================================

Gunakan animasi ringan:

hover card
poster zoom
score badge
button press
page transition
chart animation
ranking entrance animation

Jangan berlebihan.

Gunakan Framer Motion jika diperlukan.

==================================================
9. EMPTY STATES
==================================================

Jika belum ada data:

"Your watchlist is empty."

Illustration:
retro TV / film reel / anime-style mascot.

Button:

"+ Add Your First Title"

Jika search tidak menemukan data:

"No titles found."

Button:

"Clear Filters"

==================================================
10. SECURITY
==================================================

Backend:

helmet
cors
rate limiting
input validation
parameterized queries
environment variables

Jangan expose:
SUPABASE_SERVICE_ROLE_KEY

Validasi:
file type
file size
score
dates
episodes

Jangan mempercayai input dari frontend.

==================================================
11. PROJECT STRUCTURE
==================================================

Gunakan struktur:

root/

frontend/
  src/
    components/
    pages/
    layouts/
    hooks/
    services/
    api/
    utils/
    types/
    contexts/
    assets/

backend/
  src/
    controllers/
    routes/
    services/
    repositories/
    middleware/
    validators/
    utils/
    config/

supabase/
  migrations/
  seed/

README.md

==================================================
12. FRONTEND ROUTES
==================================================

/

Dashboard

/watchlist

/watchlist/new

/watchlist/:id

/watchlist/:id/edit

/top-10

/history

/timeline

/genres

/genres/:id

/studios

/studios/:id

/genre-explorer

/studio-explorer

/insights

/recommendations

/random

/settings

==================================================
13. SIDEBAR STRUCTURE
==================================================

MAIN

Dashboard
Watchlist
Top 10
Watch History

EXPLORE

Genre Explorer
Studio Explorer

ANALYTICS

Insights

MANAGEMENT

Genres
Studios

==================================================
14. DASHBOARD VISUAL PRIORITY
==================================================

Dashboard layout:

Header
↓
8 Statistic Cards
↓
Watched Over Time
↓
Anime vs TV + Score Distribution
↓
Genre Distribution
↓
Release Year + Monthly Watching
↓
Top Studios
↓
Recent Watched
↓
Top 10

Dashboard jangan terlalu padat.

Gunakan grid responsive.