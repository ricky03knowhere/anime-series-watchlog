==================================================
DEVELOPMENT APPROACH
==================================================

Bangun aplikasi secara bertahap.

PHASE 1:
Setup project
React Vite
Express
Supabase
Environment

PHASE 2:
Database
Migration
Seed

PHASE 3:
Backend API
Media
Genre
Studio

PHASE 4:
Frontend layout
Sidebar
Navbar
Theme

PHASE 5:
Watchlist
Search
Filter
Sorting
Pagination

PHASE 6:
CRUD
Add
Edit
Delete
Upload poster

PHASE 7:
Dashboard
Charts
Analytics

PHASE 8:
Top 10
History
Timeline

PHASE 9:
Insights
Genre Explorer
Studio Explorer

PHASE 10:
Polishing
Responsive
Performance
Security

==================================================
IMPORTANT CODING RULES
==================================================

Gunakan clean architecture.

Pisahkan:

UI
API
Business Logic
Database

Jangan menaruh SQL/database logic di React component.

Jangan membuat satu file component yang terlalu besar.

Gunakan reusable components.

Gunakan TypeScript.

Jangan hardcode data dashboard.

Semua chart harus mengambil data dari API/database.

Semua statistik harus dihitung berdasarkan data aktual.

Gunakan Supabase PostgreSQL aggregation untuk analytics.

Jangan menggunakan mock data setelah API sudah tersedia.

Gunakan loading skeleton selama API request.

Gunakan toast setelah CRUD berhasil.

Gunakan confirmation dialog sebelum delete.

==================================================
FINAL UI CONCEPT
==================================================

Overall visual direction:

"Retro Cinema meets Anime Database"

Bayangkan:
- VHS rental store
- anime magazine
- movie ticket
- comic book
- modern analytics dashboard

Primary:
Purple

Secondary:
Cyan

Accent:
Yellow

Background:
Cream / Dark Navy

UI:
rounded
bold
playful
clean
modern

Poster harus menjadi elemen visual utama.

Jangan membuat UI terlihat seperti admin dashboard enterprise biasa.

Harus terasa seperti personal anime/movie collection.

==================================================
FINAL DELIVERABLE
==================================================

Hasil akhir harus berupa aplikasi full-stack yang dapat dijalankan secara lokal:

Frontend:
npm install
npm run dev

Backend:
npm install
npm run dev

Database:
Supabase migration + seed.

Pastikan seluruh fitur berikut berfungsi:

✓ Dashboard
✓ Statistics
✓ Charts
✓ Watchlist
✓ Search
✓ Pagination
✓ Genre filter
✓ Release year filter
✓ Score filter
✓ Watched date filter
✓ Studio filter
✓ Sorting
✓ Add media
✓ Edit media
✓ Delete media
✓ Poster upload
✓ Genre CRUD
✓ Studio CRUD
✓ Media detail
✓ Top 10
✓ Top 10 year filter
✓ Watch history
✓ Timeline
✓ Genre explorer
✓ Studio explorer
✓ Insights
✓ Recommendation
✓ Random picker
✓ Import CSV
✓ Export CSV
✓ Export JSON
✓ Dark mode
✓ Responsive design
✓ Error handling
✓ Loading state
✓ Empty state

Jangan hanya membuat tampilan frontend.

Implementasikan:
UI + API + Database + Supabase Storage + Validation + CRUD + Analytics.

Semua fitur harus terhubung ke database Supabase yang sebenarnya.