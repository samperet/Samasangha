# Music files

Audio tracks (~614 MB) are **not committed to git**, only the `covers/` images are.
The database records (albums + tracks) are created by `npx tsx prisma/seed-albums.ts`,
which expects the audio files to exist here under `/public/music/<album-slug>/`.

## Sources (northeastsufis.org)

Full albums (Dropbox shared folders, append `&dl=1` to download as zip):

| Album | Folder |
|---|---|
| In Peace: A Call to Unity | https://www.dropbox.com/scl/fo/de21n48bs7y0o9xe2ap4i/h?rlkey=t0bosz8tiltgzionzx51uygrc |
| Voice of the Heart: Remembering | https://www.dropbox.com/scl/fo/v9wodx87ka6y29lb5sh1y/h?rlkey=dppsskmv6cyp8dh20m9jsqpll |
| Waters of Life | https://www.dropbox.com/scl/fo/unahv99di7rh4u1q8li8b/h?rlkey=df9x20961wm5fyzh3dpw3hpoz |
| Almighty Peace | https://www.dropbox.com/scl/fo/xo2nif2085vdihmkjsirj/h?rlkey=2xvrijo959c4111joxuoim80y |
| Healing Love | https://www.dropbox.com/scl/fo/m751ra4ls5vdhvpxun837/AONl8BTMr4xkhcwGNAhydwc?rlkey=6c75df52kk56bs2srm3zcuxxk |

Full albums (YouTube playlists, fetched with yt-dlp, a couple of private videos
are unavailable so track numbers are resequenced):

| Album | Playlist | Tracks |
|---|---|---|
| The Bridge | https://www.youtube.com/playlist?list=PL582S8X0qxF8r_La2KgZjSKN5Cq7Lwg7d | 11 (orig #3 unavailable) |
| Beginnings | https://www.youtube.com/playlist?list=PL7npr-rpL0I8uucVeMvjrbbB8mOYy7PPg | 14 (orig #3, #7 private) |

```bash
yt-dlp -x --audio-format m4a --audio-quality 0 --ignore-errors \
  -o "%(playlist_index)02d-%(title)s.%(ext)s" "<playlist-url>"
```

Sample-only albums (single MP3 from the site):

- Zikr of the Heart, https://northeastsufis.org/wp-content/uploads/2022/09/Zikr-of-the-Heart-1.mp3

File naming convention: `NN-kebab-case-title.<ext>` matching the `audioUrl` values
in `prisma/seed-albums.ts` (that file is the source of truth).

## Production note

For Vercel deployment these files won't be in the repo. Either upload this
directory to Cloudflare R2 (the project supports `STORAGE_PROVIDER=r2`) and
update the track `audioUrl`s, or host the folder on any static CDN.
