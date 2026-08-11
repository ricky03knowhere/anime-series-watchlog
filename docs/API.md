==================================================
1. API DESIGN
==================================================

Buat REST API.

Media:

GET    /api/media
GET    /api/media/:id
POST   /api/media
PUT    /api/media/:id
DELETE /api/media/:id

Genre:

GET    /api/genres
GET    /api/genres/:id
POST   /api/genres
PUT    /api/genres/:id
DELETE /api/genres/:id

Studio:

GET    /api/studios
GET    /api/studios/:id
POST   /api/studios
PUT    /api/studios/:id
DELETE /api/studios/:id

Dashboard:

GET /api/dashboard/summary
GET /api/dashboard/watched-over-time
GET /api/dashboard/genre-distribution
GET /api/dashboard/studio-distribution
GET /api/dashboard/score-distribution
GET /api/dashboard/release-year
GET /api/dashboard/monthly-watched

Top 10:

GET /api/top-10

Support query parameters:

?page=1
&limit=10
&search=
&type=
&genre=
&studio=
&releaseYear=
&minScore=
&maxScore=
&watchedFrom=
&watchedTo=
&sortBy=
&sortOrder=

==================================================
2. DASHBOARD API
==================================================

Jangan mengambil semua media ke frontend hanya untuk menghitung statistik.

Gunakan SQL aggregation di backend.

Contoh:

COUNT
AVG
SUM
GROUP BY
ORDER BY
DATE_TRUNC

Dashboard harus mengambil data statistik melalui API khusus.

==================================================
3. PERFORMANCE
==================================================

Gunakan:

pagination
server-side filtering
server-side sorting
database indexes
React Query caching
debounced search
lazy loading image
image compression
code splitting

Jangan melakukan request API berulang yang tidak diperlukan.

Gunakan skeleton loading.

==================================================
4. ERROR HANDLING
==================================================

Backend harus memiliki centralized error handler.

Response format:

{
  "success": false,
  "message": "Something went wrong",
  "error": null
}

Success:

{
  "success": true,
  "message": "Media retrieved successfully",
  "data": [...]
}

Untuk pagination:

{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
