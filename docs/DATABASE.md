==================================================
1. DATABASE DESIGN
==================================================

Buat database relational yang rapi dan scalable.

TABLE: media

Columns:

id
UUID / bigint primary key

title
varchar / text
required

media_type
enum:
- anime
- tv_series

release_date
date

episodes
integer

description
text

score
decimal(3,1)
range 0.0 - 10.0

watched_date
date

poster_url
text

backdrop_url
text nullable

studio_id
foreign key → studios.id

created_at
timestamp

updated_at
timestamp


TABLE: genres

id
UUID / bigint primary key

name
varchar unique

description
text nullable

created_at
timestamp

updated_at
timestamp


TABLE: studios

id
UUID / bigint primary key

name
varchar unique

description
text nullable

website_url
text nullable

created_at
timestamp

updated_at
timestamp


TABLE: media_genres

media_id
foreign key → media.id

genre_id
foreign key → genres.id

primary key:
(media_id, genre_id)


Jika diperlukan tambahkan:

TABLE: media_external_links

id
media_id
source
url

source contoh:
- MAL
- AniList
- IMDb
- TMDB
- MyDramaList
- Other


Gunakan foreign key dan index dengan baik.

Tambahkan index untuk:
- title
- media_type
- release_date
- score
- watched_date
- studio_id

Tambahkan timestamps.

==================================================
4. INITIAL GENRE MASTER DATA
==================================================

Seed genre umum:

Action
Adventure
Comedy
Drama
Fantasy
Sci-Fi
Romance
Slice of Life
Mystery
Thriller
Horror
Psychological
Supernatural
Sports
School
Historical
Military
Mecha
Music
Isekai
Crime
Documentary
Family
Animation

Pastikan tidak ada duplicate genre.

==================================================
5. INITIAL STUDIO DATA
==================================================

Untuk Anime:

Toei Animation
ufotable
TMS Entertainment
Madhouse
J.C.Staff
Bones
MAPPA
Kyoto Animation
Wit Studio
A-1 Pictures
CloverWorks
Production I.G
Sunrise

Untuk TV Series:

Netflix
HBO
Warner Bros. Television
Amazon Studios
Lucasfilm
Sony Pictures Television
Apple TV+
Disney+
Paramount Television
Universal Television

==================================================
6. SAMPLE DATA
==================================================

Masukkan sample data dengan menggunakan seed data.

Anime:

Dragon Ball Super
Release Date: 2015
Episodes: 131
Studio: Toei Animation
Score: 8.0
Watched Date: 2020/05/01

Kimetsu no Yaiba
Release Date: 2019
Episodes: 26
Studio: ufotable
Score: 8.8
Watched Date: 2020/09/01

Dr. Stone S01
Release Date: 2019
Episodes: 24
Studio: TMS Entertainment
Score: 8.5
Watched Date: 2020/10/01

One Punch Man S01
Release Date: 2015
Episodes: 12
Studio: Madhouse
Score: 8.3
Watched Date: 2020/10/11

One Punch Man S02
Release Date: 2019
Episodes: 12
Studio: J.C.Staff
Score: 7.7
Watched Date: 2020/10/18

My Hero Academia S01
Release Date: 2016
Episodes: 13
Studio: Bones
Score: 7.8
Watched Date: 2020/12/01

My Hero Academia S02
Release Date: 2017
Episodes: 25
Studio: Bones
Score: 7.5
Watched Date: 2020/12/13


TV Series:

The Umbrella Academy S01
Release Date: 2019/02/15
Episodes: 10
Studio: Dark Horse Entertainment
Score: 8.2
Watched Date: 2019/12/01

Watchmen
Release Date: 2019/10/20
Episodes: 9
Studio: Warner Bros. Television
Score: 7.5
Watched Date: 2019/12/02

The Mandalorian S01
Release Date: 2019/11/12
Episodes: 8
Studio: Lucasfilm
Score: 8.1
Watched Date: 2020/01/01

The Boys S01
Release Date: 2019/07/26
Episodes: 8
Studio: Sony Pictures Television
Score: 8.3
Watched Date: 2020/01/02

Dark S01
Release Date: 2017/12/01
Episodes: 10
Studio: Wiedemann & Berg Television
Score: 9.6
Watched Date: 2020/06/01

Dark S02
Release Date: 2019/06/21
Episodes: 8
Studio: Wiedemann & Berg Television
Score: 9.3
Watched Date: 2020/06/18

Description boleh menggunakan deskripsi singkat yang sesuai dengan judul.

Tambahkan poster placeholder untuk sample data jika image belum tersedia.
