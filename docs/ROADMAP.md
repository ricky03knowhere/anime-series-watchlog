==================================================
1. DASHBOARD
==================================================

Buat halaman Dashboard sebagai halaman utama.

Header:

"Welcome to Your Watchlog"

Subtitle:
"Track. Rate. Discover. Repeat."

Tambahkan statistik utama:

1. Total Watched
2. Anime Watched
3. TV Series Watched
4. Total Episodes
5. Average Score
6. Favorite Genre
7. Favorite Studio
8. Total Watch Time

Card statistik harus menggunakan visual retro ticket/card.

==================================================
2. DASHBOARD CHARTS
==================================================

Gunakan Recharts.

Chart 1:
Watched Media Over Time

Line chart / area chart.

X:
tahun

Y:
jumlah media ditonton

Bisa toggle:
- yearly
- monthly

----------------------------------

Chart 2:
Anime vs TV Series

Donut / Pie Chart.

Menampilkan:
Anime
TV Series

----------------------------------

Chart 3:
Genre Distribution

Horizontal bar chart.

Menampilkan genre berdasarkan jumlah media.

----------------------------------

Chart 4:
Score Distribution

Bar chart:

6.0 - 6.9
7.0 - 7.9
8.0 - 8.9
9.0 - 10

----------------------------------

Chart 5:
Release Year Distribution

Bar chart.

Menampilkan jumlah media berdasarkan tahun rilis.

----------------------------------

Chart 6:
Watched Day / Month

Bar chart:

January
February
March
...
December

Menampilkan bulan paling sering menonton.

----------------------------------

Chart 7:
Top Studios

Horizontal bar chart.

Menampilkan 10 studio dengan media terbanyak.

----------------------------------

Chart 8:
Average Score by Genre

Bar chart.

Genre vs average score.

Selain chart biasa, saya akan membuat beberapa "personality insight".

Misalnya dari data aktual:

🎭 Your Watch Personality

THE ACTION EXPLORER

You watched 42 Action titles, making it your most watched genre.

Kemudian:

⭐ You're a Rating Snob

Your average rating is 8.4/10.

atau:

🎬 Studio Loyalty

You watched 12 titles from Bones, making it your favorite studio.

Dan:

⏰ Your Prime Watching Month

December is your most active month with 18 titles watched.

Jadi dashboard tidak hanya mengatakan:

"Genre Action = 35%"

tetapi mengubahnya menjadi informasi yang terasa personal.


memperkirakan total waktu menonton.

Misalnya:

Total Episodes
1,248

Estimated Watch Time
≈ 498 hours

That's about
20.7 days

Dengan asumsi default:

Anime episode = 24 menit
TV episode = 45 menit

dan bisa dibuat configurable di Settings.

Dashboard kemudian bisa menampilkan:

🍿 You've spent approximately 20.7 days watching anime & TV series.

Ini akan menjadi salah satu insight paling menarik dari aplikasi Anda.

==================================================
3. WATCHLIST / MEDIA LIST
==================================================

Buat halaman:

/watchlist

Tampilkan data dalam mode tabel modern & mode poster / grid view

Columns:

No.
Poster
Title
Type
Release Date
Genre
Studio
Episodes
Description
Score
Watched Date
Action

Desktop:
gunakan table.

Mobile:
ubah menjadi card/list.

Poster kecil sekitar 50x70.

Title dapat diklik untuk membuka detail.

Score menggunakan badge warna berdasarkan nilai:

9.0 - 10:
purple

8.0 - 8.9:
yellow

7.0 - 7.9:
orange

< 7:
red

dengan icon bintang, yang dihitung berdasarkan score.
contoh 5 bintang untuk 10 score, 3 bintang untuk score 6

==================================================
4. SEARCH
==================================================

Tambahkan search box.

Search berdasarkan:
- title
- description
- studio
- genre

Gunakan debounce.

Placeholder:

"Search anime, series, studio..."

==================================================
5. FILTER
==================================================

Tambahkan advanced filter.

Filter:

Media Type:
- All
- Anime
- TV Series

Genre:
dropdown / multi select

Release Year:
- All
- 2026
- 2025
- 2024
...
atau range year

Rating:
- All
- 9+
- 8+
- 7+
- <7

Watched Date:
- All
- This Month
- This Year
- Custom Date Range

Studio:
dropdown / searchable select

Episodes:
range min/max

Tambahkan tombol:

Apply Filter
Reset Filter

Filter dapat disimpan di URL query parameters agar ketika refresh filter tetap aktif.

Contoh:

/watchlist?type=anime&genre=action&year=2020&minScore=8

==================================================
6. SORTING
==================================================

Table harus mendukung sorting:

Title
Release Date
Score
Watched Date
Episodes

Sorting:
ascending
descending

Default:
Watched Date descending.

==================================================
7. PAGINATION
==================================================

Pagination:

10 / 25 / 50 / 100 items per page

Tampilkan:

Previous
1
2
3
...
Next

Informasi:

"Showing 1-10 of 125"

Gunakan server-side pagination jika dataset sudah besar.

==================================================
8. CRUD MEDIA
==================================================

Buat CRUD lengkap.

Create:
POST /api/media

Read:
GET /api/media
GET /api/media/:id

Update:
PUT /api/media/:id

Delete:
DELETE /api/media/:id

Form media:

Poster
Title
Type
Release Date
Genre
Studio
Episodes
Score
Watched Date
Description
Backdrop
External Links

Poster upload menggunakan Supabase Storage.

Bucket:

media-posters

Backdrop bucket:

media-backdrops

Ketika media dihapus:
pertimbangkan menghapus file poster dari Supabase Storage.

==================================================
8. MEDIA DETAIL PAGE
==================================================

Route:

/watchlist/:id

Buat halaman detail seperti movie/anime detail page.

Hero:

Backdrop image

Poster

Title

Type

Score

Release Date

Episodes

Genre badges

Studio

Watched Date

Description

External Links

Tambahkan section:

"Your Review"

Optional:
review pribadi.

Tambahkan:

Edit
Delete
Back to Watchlist

Visual seperti poster film retro.

==================================================
9. ADD / EDIT MEDIA FORM
==================================================

Gunakan modal atau dedicated page.

Form validation:

Title:
required

Type:
required

Release Date:
valid date

Episodes:
integer >= 0

Score:
0 - 10
maksimal 1 angka decimal

Watched Date:
valid date

Genre:
minimal 1 genre

Studio:
optional

Description:
optional

Poster:
image only

Allowed:
jpg
jpeg
png
webp

Maximum file size:
1MB

Preview image sebelum upload.

==================================================
10. GENRE MANAGEMENT
==================================================

Route:

/genres

CRUD genre.

Tampilan:

Genre cards/table.

Columns:

Name
Description
Total Media
Created At
Action

CRUD:

Create Genre
Edit Genre
Delete Genre

Sebelum delete genre:
cek apakah genre sedang digunakan oleh media.

Jika digunakan:
tampilkan warning:

"This genre is currently used by X media. Are you sure?"

Tambahkan halaman:

/genres/:id

Genre detail menampilkan:

Genre name
Description
Total media
Average score
Top media
Media list

==================================================
11. STUDIO MANAGEMENT
==================================================

Route:

/studios

CRUD studio.

Columns:

Studio
Type / related media
Total Media
Average Score
Action

Studio detail:

/studios/:id

Menampilkan:

Studio name
Description
Website
Total Media
Average Score
Highest Rated Media
Media list

==================================================
12. TOP 10 PAGE
==================================================

Route:

/top-10

Buat halaman ranking Top 10.

Header:

"TOP 10 WATCHLIST"

Subheading:

"Your highest rated anime & TV series"

Default:
Top 10 berdasarkan score.

Tampilkan seperti ranking cards:

#01
#02
#03
...

Setiap card:
Poster
Title
Score
Type
Release Year
Genre
Studio

Ranking #1 lebih besar secara visual.

Gunakan gold/yellow visual untuk #1.
Cyan untuk #2.
Purple untuk #3.

==================================================
13. TOP 10 FILTER
==================================================

Top 10 dapat difilter berdasarkan:

Year:
All
2026
2025
2024
...
2010

Media Type:
All
Anime
TV Series

Genre:
All
Action
Adventure
Comedy
...

Studio:
All

Sort:

Highest Score
Most Episodes
Recently Watched

Tambahkan toggle:

"Release Year"

agar ranking bisa berdasarkan tahun rilis.

Contoh:

Top 10 Anime 2020
Top 10 TV Series 2020
Top 10 Action 2020

==================================================
14. WATCH HISTORY
==================================================

Route:

/history

Buat timeline berdasarkan watched_date.

Contoh:

2020

December
----------------
My Hero Academia S02
My Hero Academia S01

October
----------------
One Punch Man S02
One Punch Man S01
Dr. Stone S01

September
----------------
Kimetsu no Yaiba

May
----------------
Dragon Ball Super

Tampilan seperti movie timeline / film reel.

Tambahkan filter tahun dan bulan.

==================================================
15. INSIGHTS PAGE
==================================================

Route:

/insights

Buat halaman analytics yang lebih mendalam dibanding dashboard.

Section:

"Your Watching Personality"

Berdasarkan data.

Contoh:

Action Lover
Sci-Fi Explorer
High Rating Critic
Anime Enthusiast
Series Binger

Hitung berdasarkan data sebenarnya.

Jangan menggunakan hardcoded result.

----------------------------------

Insight 1:
Most Watched Genre

----------------------------------

Insight 2:
Highest Rated Genre

----------------------------------

Insight 3:
Most Watched Studio

----------------------------------

Insight 4:
Highest Rated Studio

----------------------------------

Insight 5:
Most Productive Watching Year

Tahun dengan media paling banyak ditonton.

----------------------------------

Insight 6:
Average Rating Over Time

Line chart.

----------------------------------

Insight 7:
Anime vs TV Preference

Percentage.

----------------------------------

Insight 8:
Average Episodes Per Media

----------------------------------

Insight 9:
Most Watched Month

----------------------------------

Insight 10:
Oldest Release You Watched

----------------------------------

Insight 11:
Newest Release You Watched

----------------------------------

Insight 12:
Longest Series

Media dengan episode terbanyak.

==================================================
16. GENRE EXPLORER
==================================================

Route:

/genre-explorer

Buat halaman visual untuk eksplorasi genre.

Tampilkan genre dalam bentuk cards:

Action
Adventure
Comedy
Drama
Fantasy
Sci-Fi
...

Setiap card:

Total watched
Average score
Top media

Ketika diklik:
tampilkan semua media dari genre tersebut.

Tambahkan chart:

Genre popularity
Genre average score

==================================================
17. STUDIO EXPLORER
==================================================

Route:

/studio-explorer

Tampilkan studio sebagai cards.

Contoh:

Bones
MAPPA
Madhouse
Toei Animation
Netflix
HBO
...

Card:

Studio name
Total watched
Average score
Top title

Klik:
lihat studio detail.

==================================================
18. WATCHING TIMELINE
==================================================

Route:

/timeline

Buat visual timeline berdasarkan:

Watched Date

Gunakan konsep:
film reel / movie timeline.

Setiap event:

Poster
Title
Score
Watched Date

Bisa zoom berdasarkan:

Year
Month

==================================================
19. TOP 5 QUICK RANKING
==================================================

Dashboard juga menampilkan:

"Your Top Rated"

Top 5 media berdasarkan score.

Ranking:

01
02
03
04
05

==================================================
20. SCORE VISUALIZATION
==================================================

Gunakan score badge.

9.0 - 10.0:
"Masterpiece"

8.0 - 8.9:
"Excellent"

7.0 - 7.9:
"Good"

6.0 - 6.9:
"Average"

<6:
"Low"

Badge menggunakan warna tema.

==================================================
21. DATA CONSISTENCY
==================================================

Pastikan:

score hanya 0-10
episodes >= 0
release_date valid
watched_date valid
title tidak boleh kosong
genre tidak duplicate
studio tidak duplicate

Jika release_date lebih besar dari watched_date:
beri warning karena media masuk ke watchlist sebelum rilis.

Namun jangan otomatis menolak jika user memang ingin memasukkan data khusus.

==================================================
22. ACCESSIBILITY
==================================================

Gunakan:

semantic HTML
ARIA label
keyboard navigation
focus states
sufficient contrast
alt text pada poster

Jangan hanya mengandalkan warna untuk menunjukkan status.