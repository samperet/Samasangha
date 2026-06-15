# SamaSangha Website — Copy Inventory

A complete inventory of user-facing text on the SamaSangha public website, organized by page and section, for a content review/editing pass.

> Note: Database-driven content (events, posts/talks, dharma gems, dance articles/interviews, albums/tracks, teacher bios, lineage metadata, editable pages) is sourced from the seed files: `prisma/seed-content.ts`, `prisma/seed-lineage.ts`, `prisma/seed-albums.ts`, `prisma/seed-videos.ts`, `prisma/seed.ts`, and `lib/lineage.ts`. Dynamic/templated values (event titles, dates, prices, track durations, etc.) are noted as such. HTML tags have been stripped from seed copy while preserving the readable structure.

---

## Global (appears on every page)

### Navbar — wordmark
- Wordmark (two halves around the winged-heart logo): "Sama" · "Sangha"
- Logo accessible label: "SamaSangha home"
- Logo image alt: "SamaSangha winged heart"

### Navbar — links
- "Home" (shown on all pages except the homepage)
- "Welcome" (links to /about/teachers; internal context note in code: "Learn about the path and the lineage")
- "Teachings"
- "Music"
- "Retreats"
- Search overlay opens with Cmd/Ctrl+K (see Search Overlay below).

### Footer
- Footprints image alt: "Golden footprints inscribed with sacred symbols"
- Button: "Mureeds Circle"
- Button: "Join the mailing list" (external Mailchimp link)
- Button: "♡ Donate" (external PayPal link)
- Social link: "Facebook"
- Social link: "Instagram"
- Decorative repeating prayer band: the word "HEART" repeated (aria-label "HEART")

### Search Overlay (Cmd/Ctrl+K)
- Input placeholder: "Search teachings, events, music…"
- Close button label: "Close search"
- Loading: "Searching…"
- No results: "Nothing found for "{query}"" (dynamic query)
- Empty state (no query yet): "Start typing to search across teachings, events, and music."
- Footer hints: "esc to close" · "↵ to visit"
- Result group headers and labels are dynamic (sourced from search results).

### Notification Banner (admin-managed, shown on mapped pages)
- Region label: "Announcements"
- Message text: dynamic (pulled from the database per page)
- Dismiss button label: "Dismiss announcement"

### Music Player Bar (persistent, appears when audio is playing)
- Now-playing track title and album title: dynamic
- Control labels: "Previous track", "Pause"/"Play", "Next track", "Mute"/"Unmute", "Volume", "Close player", "Seek"
- Time display: dynamic (e.g. "1:23 / 4:56")

---

## Home — /

### Hero / Invocation (InvocationCarousel)
- Visually-hidden page heading (for SEO): "SamaSangha"
- Invocation (italic serif, the central text):
  > Towards the One, the Perfection of Love, Harmony and Beauty, the Only Being, united with all the Illuminated Souls who form the Embodiment of the Master, the Spirit of Guidance.

### About card
- Image alt: "Abraham and Halima"
- Blockquote:
  > SamaSangha is the community of seekers who have gathered in Massachusetts, and also far and wide, with the guidance of Sufi Murshids Halima and Abraham.
- Link: "Learn more on our Welcome page →"

### Weekly Practice card
- Image alt: "Weekly Practice, people in a circle"
- Heading: "Weekly Practice"
- Body:
  > Every Tuesday morning Abraham, Halima, and the Sama Sangha gather online for Sufi practice and meditation, zikr, breath, and heart awakening. All are welcome.
  > Our intentions are toward 7 generations, toward Peace on Earth. Practice is free, supported by dana.
- Detail list:
  - When: "Every Tuesday, 9 AM EST"
  - Where: "Online via Zoom, link sent via newsletter"
  - Cost: "Free, dana welcome"
  - Open to: "All, no experience needed"
- Button: "Join our Newsletter →" (external Mailchimp link)

### Dances of Universal Peace card
- Image alt: "Dances of Universal Peace circle"
- Heading: "Dances of Universal Peace"
- Body:
  > Sacred circle dances drawing from the spiritual traditions of the world, Hindu, Buddhist, Sufi, Christian, Jewish, and Indigenous. Singing and moving together, we embrace the unity at the heart of all paths.
  > The Dances of Universal Peace are held in trust by the Sufi Ruhaniat International for the benefit of all people. No experience required, only your presence.
- Detail list:
  - When: "Third Saturday · 7:30–9:45 PM"
  - Where: "Friends Meeting House, Cambridge"
  - Contribution: "$10–15 suggested"
  - Led by: "Abraham, Halima & Friends"
- Button: "About the Dances →"

### Home Retreats section
- Heading: "Home Retreats"
- Empty state: "No upcoming events scheduled. Join the mailing list to be notified." ("Join the mailing list to be notified." is a link to /contact)
- Each event card (dynamic from database — featured upcoming events):
  - Event title, date range, location/"Online", and description: dynamic
  - Button: "Register" (when registration is enabled or a register URL exists)
  - Button: "Learn more →"
- Footer link: "View all retreats →"

---

## Welcome / Teachers & Lineage — /about/teachers
Page metadata title: "Welcome"

### Page header
- Heading: "Welcome"

### About us
- Eyebrow: "About us"
- Body:
  > SamaSangha is the community of seekers who have gathered in Massachusetts, and also far and wide, with the guidance of Sufi Murshids Halima and Abraham.
  > In the Sufi Ruhaniat lineage of Pir-o-Murshid Hazrat Inayat Khan and Murshid Samuel Lewis our sangha supports our collective realization that love, harmony, and beauty are the foundation of spiritual life. Tuning to the interconnected nature which unites all of creation, our practice serves the protection of all life on Earth.
  > Since 1972 Halima and Abraham have been leading gatherings of the Dances of Universal Peace in Cambridge Massachusetts, where Murshid Sam first brought the dances in 1969. Sama (which refers to the sacred dance and music) is the name of our center and our sangha includes our many friends who have shared these practices with us. In recent years Halima and Abraham have traveled to Russia, Colombia, Ecuador, Mexico, New Zealand, Australia, Holland, Latvia, and Spain, and the many friends they have made around the world have also become part of SamaSangha.
  > Through regular in person and online teachings and gatherings, this sangha continues to grow.

### Our teachers
- Eyebrow: "Our teachers"
- Photo alt: "Abraham and Halima in the yurt"
- Teacher cards (Abraham, Halima): name, role line, bio excerpt (dynamic, sourced from teacher bios in seed-content.ts; roles from lib/lineage.ts), plus "Read more →" link.
  - Abraham role: "Murshid · SamaSangha, Cambridge"
  - Halima role: "Murshida · SamaSangha, Cambridge"

### The silsila (lineage)
- Eyebrow: "The silsila, our lineage"
- Body:
  > In Sufism the silsila is the unbroken chain of heart-to-heart transmission from teacher to student. Ours flows through the Sufi Ruhaniat International.
- Lineage cards (Hazrat Inayat Khan → Murshid Samuel Lewis → Pir Moineddin Jablonski → Pir Shabda Kahn): name, dates, role line, bio excerpt, and a short pull-quote (all from seed-content.ts bios and lib/lineage.ts — see Lineage Metadata section below).

### Honored ancestors
- Eyebrow: "Honored ancestors"
- Body:
  > Elders and healers whose lives and work touched this lineage and the Cambridge community.
- Ancestor cards (Frida Waterhouse, Karmu): name, dates, role line, bio excerpt (dynamic).

---

## Teacher detail — /about/teachers/[slug]
Page metadata title: the teacher's name (dynamic)

### Static labels / chrome
- Back link: "← Teachers & Lineage"
- Role line, name, dates, and pull-quote with attribution: dynamic (from lib/lineage.ts and the bio)
- Biography body: dynamic (teacher.bio HTML from seed-content.ts)

### Elemental Invocation (Hazrat Inayat Khan page only)
- Eyebrow: "Listen · Elemental Invocation"
- Body: "The Elemental Invocation, sung in the tradition of Hazrat Inayat Khan."
- Audio fallback: "Your browser does not support the audio element."

### Photographs (when gallery present)
- Eyebrow: "Photographs"
- Photo captions: dynamic (see Lineage Metadata section)

### Writings (Abraham & Halima pages only)
- Eyebrow: "Writings"
- Abraham:
  - Label: "Dance leadership · Elements of Mastery"
  - Title: "Dancing the Heart Awake"
  - Body: "On the art, craft, and spiritual practice of Dance leading, the essential ingredients for heart awakening in the Dances of Universal Peace."
- Halima:
  - Label: "Dance leadership · Elements of Mastery"
  - Title: ""Be Ye Songs of Glory""
  - Body: "On cultivating effacement, fana, and the capacity to become a conduit for transformative experience in the Dances of Universal Peace."

### Lineage prev/next nav
- "← Earlier in the lineage" / "Later in the lineage →" with the adjacent teacher's name (dynamic)

---

## Our Story — /about/our-story
Page metadata title: "Our Story"

### Header + body
- Heading: "Our Story"
- Empty state (if no content): "Coming soon."
- Body content (dynamic page record, seed-content.ts page slug "our-story"):
  > SamaSangha is the community of seekers who have gathered in Massachusetts, and also far and wide, with the guidance of Sufi Murshids Halima and Abraham.
  > In the Sufi Ruhaniat lineage of Pir-o-Murshid Hazrat Inayat Khan and Murshid Samuel Lewis our sangha supports our collective realization that love, harmony, and beauty are the foundation of spiritual life. Tuning to the interconnected nature which unites all of creation, our practice serves the protection of all life on Earth.
  > Since 1972 Halima and Abraham have been leading gatherings of the Dances of Universal Peace in Cambridge Massachusetts, where Murshid Sam first brought the dances in 1969. Sama, which refers to the sacred dance and music, is the name of our center and our sangha includes our many friends who have shared these practices with us.
  > In recent years Halima and Abraham have traveled to Russia, Colombia, Ecuador, Mexico, New Zealand, Australia, Holland, Latvia, and Spain, and the many friends they have made around the world have also become part of SamaSangha.
  > Through regular in-person and online teachings and gatherings, this sangha continues to grow.

---

## Contact — /contact
Page metadata title: "Contact"

### Header
- Heading: "Get in Touch"
- Body: "We'd love to hear from you. Reach out with questions, or sign up to stay connected."

### Send a Message (ContactForm)
- Sub-heading: "Send a Message"
- Field labels: "Name *", "Email *", "Subject", "Message *"
- Validation messages: "Name is required", "Valid email required", "Message must be at least 10 characters"
- Submit button: "Send Message" (loading: "Sending...")
- Error: "Something went wrong. Please try again."
- Success state: "Thank you! We'll be in touch soon."

### Join Our Mailing List (SubscribeForm)
- Sub-heading: "Join Our Mailing List"
- Body: "Receive updates on events, teachings, and community news, a few times per month at most."
- Email input placeholder: "your@email.com"
- Button: "Subscribe" (loading: "...")
- Error: "Something went wrong."
- Success state: "Thank you! You're subscribed."

---

## Dances of Universal Peace — /dances
Page metadata title: "Dances of Universal Peace"
Page metadata description: "Live Dances of Universal Peace in Cambridge, sacred circle dances of chant, live music, and movement, on the third Saturday of each month with SamaSangha."

### Header
- Eyebrow: "Monthly gathering"
- Heading: "Dances of Universal Peace"
- Body: "Live Dances of Universal Peace in Cambridge, singing and moving together, we embrace the Unity at the heart of all paths to the Source."
- Hero image alt: "Dances of Universal Peace circle"

### Practice details card
- When: "Third Saturday of the month"
- Time: "Doors 7:15 PM · Dances 7:30–9:45 PM"
- Where: "Friends Meeting House (Friends room), 5 Longfellow Park, Cambridge, MA 02138"
- Contribution: "$10–15 kindly requested"
- Led by: "SamaSangha with Halima, Abraham & Friends"
- Note: "Please arrive a few minutes early to allow for a smooth start. No experience required, only your presence."
- Disclosure summary: "Add to calendar"
- Calendar option labels: "Apple / Outlook / ICS", "Google", "Outlook.com", "Yahoo"

### Venue map
- Eyebrow: "Where we gather"
- Link: "Get directions →"
- Map iframe title: "Map to Friends Meeting House, Cambridge"
- Caption: "Friends Meeting House (Friends room), 5 Longfellow Park, Cambridge, MA 02138"

### About the practice
- Body:
  > The Dances of Universal Peace are part of the timeless tradition of body prayer and sacred dance. Drawing on the sacred phrases, scripture, and poetry of the many spiritual traditions of the earth, the Dances blend chant, live music, and evocative movement into a living experience of unity, peace, and integration.
  > Spiritual practice brings us face to face with Life and Truth, prior to the concepts and beliefs of the person, opening to our true nature, authentic, unguarded, beyond form, and imbued with the spaciousness and love that connects all. This taste of our true nature, as Universal Peace, opens to the possibility of a deep spiritual revolution within the person.
- Blockquote:
  > One Heart, One People, One Unity.
  > May all beings be happy and free.
- Closing line: "The Dances of Universal Peace are held in trust by the Sufi Ruhaniat International for the benefit of all people."

### Footer links
- Button: "Listen to the dances →"
- Button: "Articles & interviews"

---

## Teachings — /deepen
Page metadata title: "Teachings"

### Header
- Heading: "Teachings"
- Body: "Deepen your practice with our library of recorded material."

### Filter / browser (TeachingsBrowser)
- Filter tabs: "All", "Talks", "Dharma gems", "Videos", "Articles", "Interviews"
- Category labels on items: "Talk", "Dharma gem", "Video", "Article", "Interview", "Original dance"
- Search toggle labels: "Search teachings" / "Close search"
- Search input placeholder: "Search teachings…"
- Empty state (with query): "No teachings match "{query}"." (dynamic)
- Empty state (no query): "Nothing here yet, try a different filter."
- Each entry: title, category label, date, and excerpt — all dynamic (posts + music videos from the database; see seed copy for Talks, Dharma Gems, Articles, Interviews, Videos below).

---

## Teaching post (generic) — /deepen/[slug]
Page metadata title: the post title (dynamic) — used for Dharma Gems and Interviews without dedicated routes
- Back link: "← Teachings"
- Category label + date, title, embedded video, and HTML body: all dynamic.

## Talk detail — /deepen/talks/[slug]
Page metadata title: the talk title (dynamic)
- Back link: "← Teachings"
- Date, title, embedded video, and HTML body: all dynamic.

(/deepen/talks redirects to /deepen?type=talks)

---

## Articles — /deepen/dances/articles
Page metadata title: "Dance Articles"
- Heading: "Articles"
- Body: "Writings on the art, craft, and spiritual practice of the Dances of Universal Peace."
- Empty state: "No articles posted yet."
- Each article: title and excerpt (dynamic) plus "Read →" link.

## Article detail — /deepen/dances/articles/[slug]
Page metadata title: the article title (dynamic)
- Back link: "← Articles"
- Series eyebrow (e.g. "Elements of Mastery"), title, author name/date, hero image + caption, and body: dynamic.
- Sidebar author card (static labels):
  - Eyebrow: "About the author"
  - Role: "Murshid · SamaSangha"
  - Bio: "Senior mentor teacher in the Sufi Ruhaniat and Dances of Universal Peace lineages. Original mureed of Murshid Samuel Lewis."
  - Link: "Full bio →"

## Interviews — /deepen/dances/interviews
Page metadata title: "Dance Interviews"
- Heading: "Interviews"
- Empty state: "No interviews posted yet."
- Each interview: date, title, excerpt, and HTML body — all dynamic.

---

## Weekly Practice — /deepen/tuesday-practice
Page metadata title: "Weekly Practice"
- Heading: "Weekly Practice"
- Empty state: "Details coming soon."
- Body content (dynamic page record, seed-content.ts page slug "tuesday-practice"):
  > Weekly Practice with Abraham, Halima and Sama Sangha
  > Join us Tuesday Mornings for Sufi Practice & Meditation beginning at 9AM EST (Boston MA, USA). We continue to advocate for actions and realizations that support a harmonious relationship between people, nature, and life itself, knowing that this realization begins inside ourselves. Our intentions are towards 7 generations, towards Peace on Earth.
  > Please arrive a few minutes early so we can begin together. Our practice time is approximately 45 minutes long.
  > Practice is free, but there are costs associated with gathering our beloved community, including digital platforms, Zoom costs, faculty support, and more. Feel free to support us with a dana (donation).
  > Sign up to receive a reminder email for upcoming classes, or email northeastsufis@gmail.com to inquire about joining our ongoing weekly practice.

---

## Mureeds' Deepening — /deepen/deepening
Page metadata title: "Mureeds' Deepening"

### Locked state (gate)
- Heading: "Mureeds' Deepening"
- (DeepeningGate, see below)

### Unlocked state
- Heading: "Mureeds' Deepening"
- Intro body (dynamic page record, seed-content.ts page slug "deepening", titled "Deepening, Mureeds' Class"):
  > The Deepening program is an ongoing study and practice for initiated mureeds (students) of the Sufi Ruhaniat International.
  > This includes the God is Breath course and other structured teachings offered by Abraham and Halima to the inner circle of practitioners.
- Section heading: "God is Breath, Mureeds Class"
- Section body: "Study guide for Course 1 (2023/2024) with Halima & Abraham, following the course offered by Murshid Wali Ali Meyer. Each lesson gathers the class text, practice assignments, and readings to view or download."
- Lesson group headings: "Lesson 1", "Lesson 2", "Lesson 3", "Lesson 4"
- Document link labels (per lesson): "Class with Murshid Wali Ali Meyer", "Practice assignments", "Readings (gender-neutral)" — each with a "PDF" tag
- Sub-label: "Class session videos"
- Video link labels: "Video Compilation 1", "Video Compilation 2", "Morning Part I"–"V", "Afternoon Part I"–"V", "Evening Part I"–"IV", "Evening Session" (varies by lesson)

### Deepening Gate (shared password gate; also used on Mureeds Circle pages)
- Heading: "For mureeds"
- Body: "This page holds materials shared within the circle. Enter the password from class to continue."
- Password input placeholder: "Password"
- Submit button: "Enter" (loading: "Opening...")
- Error: "That isn't it, try again."

---

## Music: Albums — /deepen/music/albums
Page metadata title: "Albums"

### Header
- Eyebrow: "Music"
- Heading: "Albums"

### Album grid
- Empty state: "No albums published yet."
- Each card (dynamic from database): album title, and a meta line that is either "{year} · {n} tracks · {m} min" or "Album sample". Play/pause button labels: "Play {album title}" / "Pause {album title}".

### Footer note
- Body: "Inspiration from SamaSangha and the Ruhaniat community. Play an album as you explore the site. All music is offered freely, and donations help us continue our work."
- Button: "♡ Donate" (external PayPal link)

(/deepen/music/videos redirects to /deepen?type=videos)

## Album detail — /deepen/music/albums/[slug] (AlbumPlayer)
Page metadata title: the album title (dynamic)
- Back link: "← All albums"
- Eyebrow: "Album" or "Album · Sample"
- Album title (dynamic), artist line "Sama Sangha" + year/track count (dynamic), and description (dynamic)
- Buttons: "Play Album" / "Play Sample" / "Pause"; "Download album" / "Download sample"
- Track list: track titles and durations (dynamic); per-track download label "Download {track title}", tooltip "Download track"
- Sample-only note: "Only a sample of this album is available to stream, the full recording is offered through the community by donation" (optionally "… via the original album page ↗")

### Download-by-donation modal
- Dialog label: "Download by donation"
- Body: "This music is shared freely with our community and supported by your generosity. If it moves you, please consider a gift of dana."
- Buttons: "Make a donation", and a download button labeled "Download album" / "Download sample" / "Download song"
- Footer: "No gift is required. The download link is right above."
- Close button label: "Close"

---

## Retreats list — /events/upcoming
Page metadata title: "Upcoming Retreats"
(/events redirects here)

### Header + list
- Heading: "UPCOMING RETREATS"
- Empty state: "No upcoming events scheduled." + link "Join the mailing list to be notified →"
- Each event row (dynamic): date range, location/"Online", title, description.
- Buttons: "Register" (when enabled/URL present); "View flyer" (when a flyer exists)

---

## Event detail — /events/[slug]
Page metadata title: the event title (dynamic)
Note: the slug "eat-dance-pray-2026" renders a custom layout (see below).

### Standard layout
- Breadcrumb: "← Events"
- Badges: "Retreat" (if retreat) · "Online" (if online)
- Title, and meta grid (dynamic values):
  - Labels: "Date", "Location", "Cost", "Availability"
  - "Online" shown for online events
  - Cost may show "Early bird until {date}" (dynamic)
  - Availability: "Full, waitlist available" or "{n} spot(s) remaining" (dynamic)
- Description body: dynamic (event.description split into paragraphs)
- CTA card variants:
  - Sliding-scale retreat → RetreatPriceSlider (see below)
  - Open registration: heading "Register for this event" (or "Join the waitlist" when full); body "Fill in your details below and we'll confirm your spot." (or "This retreat is full. Add your name to the waitlist and we'll contact you if a space opens."); button "Register now" (or "Join waitlist")
  - External register URL: heading "Register for this event"; button "Register →"
  - Closed: "Registration for this event has closed."
  - Fallback: "To attend, please contact us." ("contact us" links to /contact)

### Retreat Price Slider (sliding-scale events)
- Heading: "Register for this retreat"
- Body: "This retreat operates on a sliding scale. Choose the amount that feels right for you."
- Optional note (dynamic): e.g. "Early-bird pricing until {date}"
- Amount display + range labels: "${min}, ${max} sliding scale", "${min}", "${mid} suggested", "${max}" (dynamic dollar amounts)
- Button: "Donate ${amount} & Register →" (dynamic amount)

### Eat, Dance & Pray custom layout (EatDancePrayLayout — /events/eat-dance-pray-2026)
- Hero image alt: "Eat, Dance and Pray, gathering in the yurt"
- Back link: "← Events"
- Hero badge: "Retreat · {date range}" (date dynamic)
- Title (dynamic) + location (dynamic)
- Pull quote:
  > "Eat, Dance, and Pray together is the actualized vision Sufi Murshid Samuel Lewis held for world peace."
- Description:
  > With Abraham & Halima, Malika (Colombia) & Friends, this year's retreat invites us to tune into our natural rhythms and demonstrate Peace and Harmony.
  > We gather to BE present together: to practice simple presence with the Walks and Dances of Universal Peace, Zikr, Meditation, Silence, Listening, Kirtan, and Yoga.
  > Our intentions are toward 7 generations, toward Peace on Earth.
- Details band labels: "Dates", "Location" (value default "Rural Massachusetts"), "Open to" (value "All are welcome")
- Button: "View flyer" (if a flyer exists)
- Registration card (variants): heading "Reserve your place"; body "Spaces are limited. Register early to secure your spot." (URL variant) or "Spaces are limited. Get in touch to secure your spot." (contact variant); buttons "Register now →" / "Contact us to register →". When sliding-scale, the RetreatPriceSlider is shown instead.

---

## Event registration — /events/[slug]/register
Page metadata title: "Register, {event title}" (dynamic)

### Event summary
- Eyebrow: "Registration" (or "Join the waitlist" when full)
- Title, date/location, and price line: dynamic
- Full notice: "This retreat is full. You'll be added to the waitlist."

### Closed state
- "Registration has closed."
- "Please contact us if you have questions." ("contact us" links to /contact)

### Registration form (RegistrationForm)
- Field labels & hints:
  - "Your name" * — placeholder "Fatima al-Rashid"
  - "Email address" * — placeholder "you@example.com"
  - "Phone number" — hint "Optional, helpful for retreat logistics" — placeholder "+1 (617) 555-0100"
  - "Dietary needs" — hint "Vegetarian, gluten-free, allergies, etc." — placeholder "e.g. vegetarian, no nuts"
  - "Notes or questions" — hint "Anything else we should know, accessibility, childcare, scholarship inquiry, etc." — placeholder "Share anything that would help us welcome you well."
- Validation messages: "Your name is required", "A valid email is required"
- Submit button: "Submit registration" (or "Join waitlist" when full; loading "Submitting…")
- Helper: "A confirmation will be sent to your email address."
- Error fallback: "Something went wrong."
- Success state: heading "Registration received." / body "We've sent a confirmation to your email. We look forward to gathering with you."
- Waitlisted state: heading "You're on the waitlist." / body "We'll contact you as soon as a spot opens up. Thank you for your patience."

---

## Mureeds Circle — /mureeds-circle
Page metadata title: "Mureeds Circle"

### Locked state
- Heading: "Mureeds Circle" + Deepening Gate (see above)

### Unlocked state
- Heading: "Mureeds Circle"
- Link cards (label + description):
  - "Mureeds' Deepening" — "The God is Breath study course and class materials."
  - "Elemental Breath" — "An interactive practice for the breath of the elements." (external)
  - "Weekly Practice Link (9AM EDT)" — "Join the Tuesday morning practice gathering online." (external Zoom)
  - "Sangha Connections" — "Find one another, names, places, and ways to connect."

---

## Sangha Connections (Mureed Directory) — /mureeds-circle/directory
Page metadata title: "Sangha Connections"

### Locked state
- Heading: "Sangha Connections" + Deepening Gate (see above)

### Unlocked state — header
- Heading: "Sangha Connections"
- Body: "Find one another. Add yourself so friends on the path can reach you."

### Directory list (DirectoryList)
- Empty (no profiles): "No one here yet, be the first to add yourself below."
- Search label: "Search directory"
- Search placeholder: "Search by name, location, email, or phone"
- No matches: "No matching mureeds found."
- Each listing: name, location, email, phone — all dynamic (member-submitted)

### Add yourself form (AddProfileForm)
- Section label: "Add yourself to the directory"
- Heading: "Add yourself"
- Body: "Your listing is visible only to mureeds who hold the password."
- Field labels: "Name *", "Location *" (placeholder "Town, State / Country"), "Email *", "Phone", "Photo"
- Photo control: button "Choose image"; placeholder "A friendly picture of you (optional)"
- Submit button: "Add me to the directory" (loading "Adding…")
- Error fallback: "Something went wrong, please try again."
- Success: "Thank you, you're in the directory. ♥"

---

# Database-sourced content (canonical copy from seed files)

The following is the editable copy that populates the dynamic pages above. Pull from these for content review.

## Teacher bios (prisma/seed-content.ts)

### Halima (slug: halima-sussman)
> Murshida Halima is a senior mentor teacher in the Sufi Ruhaniat and Dances of Universal Peace lineages, an inspired musician, and an experienced guide in the path of the awakening heart.
> Halima seeded her love of the Sufi path in Murshid Sam's Marin Dance Meeting. She shares joy and clarity arising from her own practice and taps a depth that arises from a lifetime of integrating spiritual practice, psychological exploration, and a love of the natural world.
> Together with Abraham, Halima has traveled to Russia, Colombia, Ecuador, Mexico, New Zealand, Australia, Holland, Latvia, and Spain, bringing the Dances of Universal Peace and Sufi teachings to communities worldwide.

### Abraham (slug: abraham-sussman)
> Murshid Abraham is an original mureed of Murshid Samuel Lewis. He is a senior mentor teacher in the Sufi Ruhaniat and Dances of Universal Peace lineages, an inspired musician, and an experienced guide in the path of the awakening heart.
> As a young wanderer in 1969, Abraham first met his spiritual teacher, Sufi Murshid Samuel Lewis, dancing in Precita Park in San Francisco. He has been leading gatherings of the Dances of Universal Peace in Cambridge, Massachusetts since 1972, where Murshid Sam first brought the dances in 1969.
> Abraham travels and teaches internationally, returning home to Massachusetts, local family, and sangha.

### Hazrat Inayat Khan (slug: hazrat-inayat-khan)
> 1882–1927
> [blockquote] Open our hearts, that we may hear thy voice, which constantly comes from within. Disclose to us Thy Divine Light, which is hidden in our souls, that we may know and understand life better.
> Hazrat Inayat Khan was asked by his spiritual teacher to unite the East and West through his music and to bring the ideals of spiritual and religious unity to the western world. His teachings and message continue to be cultivated today through several Sufi branches, one of which is the Sufi Ruhaniat International.
> [blockquote] Sufism is the religion of the heart. The religion in which the most important thing is to seek God in the heart of mankind., Hazrat Inayat Khan, Gathekas

### Murshid Samuel Lewis (slug: murshid-samuel-lewis)
> Murshid Samuel Lewis's life stands as proof that spiritual realization transcends all sectarian barriers. Along with his first Sufi teacher Hazrat Pir-o-Murshid Inayat Khan, and mentors Swami Papa Ramdas, Mataji Krishnabai, Sensei Nyogen Senzaki, and other illuminated souls, he sought to answer the cry of humanity by the sharing of spiritual teachings and practices, as well as by his own awakened presence.
> Murshid Sam was an accomplished gardener who worked to alleviate world hunger. To heal the wounds of violence and war, he received a simple yet profound peace program from the spirit of Jesus:
> [blockquote] Eat, Dance, and Pray with the peoples of the world.
> In 1970, when Murshid Sam visited the Northeast, bringing teachings and Sufi dancing to Cambridge, MA, he was accompanied by his young student Shabda. The Dances of Universal Peace he created are now practiced in almost every country on earth.
> Murshid Sam was succeeded by Pir Moineddin Jablonski, who served as spiritual director of the Sufi Ruhaniat International from 1971 through 2000.
> [blockquote] The Sufi not only prays to God, the Sufi represents God. By this I mean that one not only asks for Love and Wisdom and Joy and Peace, one does everything possible to awaken Love and Light and Wisdom and Joy and Peace in others., Murshid Samuel Lewis, Diary, December 1, 1967

### Pir Moineddin Jablonski (slug: pir-moineddin-jablonski)
> Pir Moineddin assumed leadership of the Ruhaniat in 1971 upon the death of Murshid Samuel Lewis. Continuing his teacher's vision, Pir Moineddin oversaw the spread of the Sufi Message of Love, Harmony, and Beauty through spiritual practice, the Dances of Universal Peace, the Healing work, SoulWork counseling, and conscious community involvement. The Ruhaniat grew from some 150 people to a worldwide network of Sufi communities throughout forty-two states, and in countries across Europe, Asia, South America, and Australasia.
> Moineddin shepherded the individuation of the Ruhaniat from the Sufi Order International in 1977, affirming the practice of Murshid SAM that the living relationship between Sufi mureed and guide was more important than any attempt to impose organizational rules on the relationship. He instituted ethical guidelines and an ethics procedure in the Ruhaniat in the early 1980s.
> Along with Pir Hidayat Inayat Khan of the International Sufi Movement, Moineddin cultivated the foundation and establishment of the Federation of the Sufi Message, which now includes a number of other lineages of Sufi work that stem from the inspiration of Hazrat Inayat Khan.
> [blockquote] I am not Murshid; we are Murshid. I do not have all the answers; we may have the answers.
> [blockquote] The breath is enough, the heart is enough, the eye is enough, the atmosphere is enough.
> Pir Moineddin was a great uniter, a man of tremendous heart and great humor who worked steadfastly on behalf of the greater good of all.

### Pir Shabda Kahn (slug: pir-shabda-kahn)
> On February 27, 2001, Shabda Kahn was appointed Pir (lineage holder) of the Sufi Ruhaniat International in the stream of the great mystic Hazrat Inayat Khan, his disciple Murshid Samuel Lewis, and his successor Pir Moineddin Jablonski.
> Shabda was initiated by Murshid Samuel Lewis on February 16, 1970. In the Fall of 1970, Shabda traveled with Murshid for five weeks as his personal assistant on the East Coast. A month later, Murshid Sam fell and died several weeks after, a morning Shabda was present for.
> Shabda met his second great teacher, Pandit Pran Nath, in 1972, and began the daily practice of North Indian Classical vocal music in the Kirana style, following in the footsteps of Hazrat Inayat Khan. Pran Nath planted an 800-year-old oral tradition of Chisti Sufi Vocal Music in the Western World and requested that Shabda carry on the lineage teaching under the name of the Chisti Sabri School of Music.
> Pir Shabda travels worldwide, teaching and bringing the message of spiritual unity through the expression of Love, Harmony and Beauty.

### Frida Waterhouse (slug: frida-waterhouse)
> [h2] A Brief Autobiography
> The amanuensis, Frida Waterhouse, was born of Jewish parents on October 12, 1907, at Gloversville, New York.
> She moved from Los Angeles to San Francisco under spiritual guidance in July 1963. A part of her genetic inheritance developed into cataracts in both eyes. Eventually she became blind to all but light and darkness because she would not submit to surgery for a period of about four and one-half years, requested by the Divine Ones in order that she might develop more inner sensitivities. Once she became an instrument with the skills required for her special work, her eyes developed acute glaucoma and surgery became imperative. Her sight was successfully restored.
> Her work is primarily to provide a practical springboard that others can use to help them work through compulsive, reactive emotional patterns that can lead to mastery over themselves. She is a channel that invokes spiritual force fields in order to confirm data already received by others.

### Karmu (slug: karmu)
> Karmu gave herbal medicines to everyone who came to see him. In 1968, there were not health food stores in every major city, Karmu's practice was extraordinary for its time. His most used herbs were aloes, goldenseal, valerian, snakesroot, Life Everlasting, these were the backbone of his "black" medicine.
> Abraham remembers Karmu as Murshid Sam's "Black Christ", a healer who turned no one away. The song "Healer Man (Karmu)" on the album Voice of the Heart: Remembering was written in 1981 in his memory.
> A documentary, Karmu: A Place in the Sun, tells his story.

## Lineage metadata — role lines, dates, pull-quotes, captions (lib/lineage.ts)

### Hazrat Inayat Khan
- Dates: 1882–1927
- Role: "Pir-o-Murshid · Founder of the Sufi Message in the West"
- Quote: "Truth is a divine inheritance found in the depth of every human heart." — Hazrat Inayat Khan, Gayan
- Gallery captions: "With the saraswati vina; he came West first as a musician." · "Pir-o-Murshid Hazrat Inayat Khan."

### Murshid Samuel Lewis
- Dates: 1896–1971
- Role: "Murshid · Creator of the Dances of Universal Peace"
- Quote: "One of the reasons I am teaching this music and dancing is to increase Joy, not awe towards another person, but bliss in our own self. This is finding God within, through experience." — Murshid Samuel Lewis
- Gallery captions: "Murshid Sam, 1962." · "Dancing with Murshid Sam." · ""Eat, dance, and pray with the peoples of the world.""

### Pir Moineddin Jablonski
- Dates: 1942–2001
- Role: "Pir · Sufi Ruhaniat International, 1971–2001"
- Quote: "I am not Murshid; we are Murshid. I do not have all the answers; we may have the answers." — Pir Moineddin Jablonski, Job's Tears
- Gallery captions: "With his teacher, Murshid Sam." · "Darshan, 1979."

### Pir Shabda Kahn
- Role: "Pir · Sufi Ruhaniat International, since 2001"
- Quote: "Here's a great line for everyone to practice in order to make friends with life: This is how it is right now." — Pir Shabda Kahn

### Abraham Sussman
- Role: "Murshid · SamaSangha, Cambridge"
- Quote: "An awakened heart is contagious, and when a group practices together, the warmth and light are powerful agents of transformation." — Murshid Abraham Sussman, "Dancing the Heart Awake"
- Gallery captions: "With His Holiness the Dalai Lama." · "With Halima in the yurt, 2022."

### Halima Sussman
- Role: "Murshida · SamaSangha, Cambridge"
- Quote: "When we radiate light, love, joy, and peace, it makes the world a better place. This is how we create Heaven on Earth." — Murshida Halima Sussman, "Be Ye Songs of Glory"
- Gallery caption: "With Abraham in the yurt, 2022."

### Frida Waterhouse
- Dates: 1907–1987
- Role: "Godparent of the lineage · Seer & spiritual counselor"
- Quote: "Your only spiritual path is how you live your life every moment of every day." — Frida Waterhouse, as her students remember her
- Gallery captions: "With Murshid Sam." · "Frida Waterhouse."

### Karmu
- Role: "Healer of Cambridge"

## Editable pages (prisma/seed-content.ts)
The following page records are used (or available) for site pages. Pages "our-story", "tuesday-practice", and "deepening" are rendered (shown in their page sections above). The following are additional seeded pages:

### Page "lineage" (title "Our Lineage") — not directly rendered by a public route reviewed
> Our community is rooted in the Universal Sufi heart stream of Pir-O-Murshid Hazrat Inayat Khan and Murshid Samuel Lewis. SAMA serves as a branch of the Sufi Ruhaniat International, and as a hub for The Dances of Universal Peace.
> The Ruhaniat lineage flows: Hazrat Inayat Khan → Murshid Samuel Lewis → Pir Moineddin Jablonski → Pir Shabda Kahn (current Pir). Halima and Abraham received their initiation and transmission directly from Murshid Samuel Lewis.

### Page "dances" (title "Dances of Universal Peace") — seeded; the /dances route uses hardcoded copy instead
> [h2] Live Dances of Universal Peace in Cambridge!
> Third Saturdays of the month. 7:15pm (doors open) · 7:30pm – 9:45pm. Friends Meeting House (in the Friends Room), 5 Longfellow Park, Cambridge, MA 02138. SamaSangha with Halima, Abraham & Friends. A contribution of $10–15 is kindly requested.
> Dances of Universal Peace are part of the timeless tradition of body prayer and sacred dance. Singing and moving together, we embrace the Unity at the heart of all paths to the Source.
> The Dances of Universal Peace are held in trust by the Sufi Ruhaniat International for the benefit of all people.
> The Dances of Universal Peace and Walking Concentrations are spiritual practice in motion. Drawing on the sacred phrases, scripture, and poetry of the many spiritual traditions of the earth, the Dances blend chant, live music and evocative movement into a living experience of unity, peace and integration.

### Page "dances-cambridge" (title "Dances in Cambridge") — seeded
> Cambridge Dances of Universal Peace gather on the third Saturday of every month.
> 7:15pm doors open · 7:30–9:45pm practice. Friends Meeting House (in the Friends Room), 5 Longfellow Park, Cambridge, MA 02138. Suggested contribution: $10–15.
> Led by SamaSangha with Halima, Abraham & Friends. All are welcome, no experience required.
> To be added to the mailing list for announcements, please contact us or sign up below.

## Posts — Dharma Gems (prisma/seed-content.ts and prisma/seed-videos.ts)
Each appears in the Teachings list and on its detail page.

- "Dharma Gem: River of Guidance, A Musical Feast 2026" — excerpt: "Abraham and Halima with Petaluma Livelli and Khusrau Tom Lena share a musical dharma gem." — body: "A musical feast and dharma gem with Abraham and Halima, Petaluma Livelli and Khusrau Tom Lena. A video teaching from the sangha's ongoing weekly practice."
- "Dharma Gem: Halima reads from Jack Kornfield" — excerpt: "Halima reads from a Jack Kornfield poem, August 5, 2022." (body becomes an embedded video via seed-videos.ts)
- "'God is Breath' Reflection" — excerpt: "What draws me to participate in 'God is Breath' at this time, and what I hope to gain from these practices." — body (by Dahlia Sura, February 2023):
  > We thought it would be nice to create a place for our prayer circle to share contemplations, experiences, questions, etc. as we go through 'God is Breath' together. If you feel inspired to share a writing, poetry, or artwork send it to Shakti and she'll add it to this page. And please feel free to comment.
  > I'll start by sharing what is drawing me (Dahlia Sura) to participate in 'God is Breath' at this time and what I hope to gain from these practices.
  > I've been an active meditator (and meditation counselor) for more than forty years. In the past several years I've been noticing that I am increasingly more distractible. It's harder to stay focused and my concentration just isn't as good as it used to be. Ah, the aging brain.
  > I know that the best solution to this jumpy, scattered mind-state is to practice more concentration/focus. So, this 'God is Breath' course is a perfect opportunity for me right now. I'm looking forward to both the daily, structured practices and to the support and encouragement that is inherent in our Sangha.
  > When I look back at the past year I can see the great benefit I got from attending the SAMA Sufi Sesshins. The alternating format of doing a dance/practice and then sitting quietly in meditation really works well for me. I've been taking that format into my daily life by interspersing whatever activities I have on my to-do list with stopping for periods of quiet focus on the breath.
  > My grandchildren were with me for an overnight on Saturday and they slept upstairs, in their own bed, for the first time. As I lay in my bed waiting for the next time that Leif, my 3½ year-old grandson, would awaken to call for me, I felt and sang the wazifa, Ya Raqib. It was such a beautiful, living experience of the watchful, loving awareness that we are practicing together.
  > How about you? Why are you here? What do you hope/intend to strengthen or let go of? Let's evoke our intentions.
  > — Dahlia Sura, February 2023
- "'Toward the One, United With All'" — excerpt: "Waking up, making coffee, and heading to my altar, I feel overwhelming gratitude for the blessings of these practices." — body (by Shakti, February 2023):
  > Waking up, making coffee, and heading to my altar, I feel overwhelming gratitude for the blessings of these practices. It's a gift to be on this journey, on my own, with my partner who sometimes can connect to practice with me, with this group of spiritual seekers. It is a blessing to have living/loving teachers who stand as guides in support of our awakening.
  > As I light this candle, I feel my bones and sense your commitment to lighting your candle; I think about seekers all around the world and through all time, an embodied sense of interconnectedness as I ignite this flame and speak the invocation. We're following in the footsteps of our lineage caravan.
  > During my meditation today, I focused on the phrase 'Toward the One – United with All' and switched my usual breath pattern. Instead of inhaling pointing out, Toward the One, I breathe inward, Toward the One, and invisible hands embrace my heart, front and back pressing inward, inviting me to integrate more fully into myself. A glowing thread of awareness points me to the phrase, 'The Embodiment of the Master.' The call to move toward mastery… a long way to go, but that's the invitation.
  > For my exhale, I reach outward 'United with All,' and an echo comes resonating back to me, the phrase, 'United with All the Illuminated Souls.'
  > Gifted a sense of protection, I extend and reach beyond my home, city, and planet… beyond, beyond the beyond, to the all-pervading life in space. And remember, I am a speck of life in a gigantic universe, embodying this heart, mind, and soul.
  > As I finish meditation and enter the busy day, I try to hold on in remembrance of these momentary awarenesses.
  > Good thing it's a year-long training +++
  > — Shakti, February 2023
- "A Divine Inner Flash" — excerpt: "A Divine Inner Flash, a lifetime in the unfurling." — body (by Tarana Wesley, April 2023):
  > A Divine Inner Flash (a lifetime in the unfurling).
  > It's more of an unfurling than an unfolding, the Soul. I picture a chameleon's tail spiraling at will…
  > As I was doing walking practice with Toward the One on the breath in the delicious cold spring air moving in and out like the sweetest nectar I had the epiphany of my lifelong ability to spiral inward into a depth unimaginable to the rational self. I realized in that moment there was NoThing stopping my soul from spiraling outward in that moment of Being in the One. In that very revelation a fully emerged Tiger Swallowtail brushed by me in the sunshine!
  > — Tarana Wesley, April 2023

Additional video-based Dharma Gems (seed-videos.ts; bodies are embedded YouTube videos):
- "Dharma Gem, Solstice Breathing Practice" (2021-12-21)
- "Basira's Dharma Gem: Sama Sangha" (2021-10-23)
- "Dharma Gem, Divine Light" (2021-12-01)
- "Dharma Gem with Abraham" (2021-10-23)

## Posts — Talks (prisma/seed-content.ts and prisma/seed-videos.ts)

- "2024 European Ruhaniat Jamiat Ahm, Lauterbach, Germany" — excerpt: "Gems from Abraham and Halima's talks at the international gathering of the Ruhaniat Family in Germany." — body:
  > [h2] An international gathering of the Ruhaniat Family
  > Guest teachers this year, Halima and Abraham, teach and inspire people worldwide. They and other Ruhaniat teachers offered various sessions with Dance, Music, Meditation, Peacework, Soulwork, Healing Prayer and Ziraat. There was also space for personal exchange, questions and answers.
- "2023 European Ruhaniat Jamiat Ahm, Lauterbach, Germany" — excerpt: "Abraham and Halima as guest teachers at the 2023 gathering, with focus on astrological walks of Murshid Samuel Lewis." — body:
  > [h2] An international gathering of the Ruhaniat Family
  > This year's guest teachers Halima and Abraham teach and inspire people all over the world. In addition to the Dances and Sufi teachings, there was also a focus on the astrological walks of Murshid Samuel Lewis.
  > The program focused on different ways our theme "inner and outer peace" can be expressed. There were workshops with dances, music, meditation, soulwork, peace work and ziraat, and personal sharing, questions and answers.
- "Allah Huma Salle Allah Nuru Zaleme" — excerpt: "We create a positive magnetic field on a daily basis when we tune ourselves Toward the One, and share practices together." — body:
  > We create a positive magnetic field on a daily basis when we tune ourselves Toward the One, and share practices together.
  > YA NUR. All Pervading Reality whose aspect is Divine Light, which is the Substance of the Beloved. Recite 33x or 101x out loud, then on the breath infusing oneself with light.
  > Darood from Barkat Ali, one of 4 given to Murshid Sam for his own practice. This musical version is from Murshid Saadi. Allah huma salle allah nuru zalame.
  > We put Divine Light into places of contraction, tension, injustice and imbalance.
  > [audio recording]

Additional video-based Talks (seed-videos.ts; bodies are embedded YouTube videos):
- "2018 Jamiat Khas, Murshid Abraham" — excerpt: "A talk by Murshid Abraham at the 2018 Jamiat Khas gathering."
- "A Hidden Treasure Yearning to Be Known, Part 1" — excerpt: "Abraham and Halima, a 2012 teaching from the Jamiat gathering."
- "A Hidden Treasure Yearning to Be Known, Part 2" — excerpt: "Abraham and Halima, Part 2."
- "A Hidden Treasure Yearning to Be Known, Part 3" — excerpt: "Abraham and Halima, Part 3."
- "Eat, Dance & Pray 2024, Sama Sangha" — excerpt: "A glimpse into the Eat, Dance & Pray gathering with Abraham & Halima, Nur Jahan, and Malika, July 2024."
- "Eat, Dance & Pray 2023, SamaSangha" — excerpt: "A glimpse into the Eat, Dance & Pray gathering with Abraham & Halima, Nur Jahan (Chile), Malika (Colombia), & SamaSangha, July 2023."
- "Rumi Night 2023" — excerpt: "A participatory evening of Dances of Universal Peace and the Mystical Poetry of Mevlana Jelaluddin Rumi."
- "Rumi in the Light 2022" — excerpt: "SamaSangha with Halima, Abraham, with Special Guest Pir Shabda & Friends. Zikr, Light Ritual & the Poetry of Jelaluddin Rumi."

## Posts — Dance Articles (prisma/seed-content.ts)

### "Dancing the Heart Awake" (by Murshid Abraham)
Excerpt: "As a young wanderer in 1969, I first met my spiritual teacher, Sufi Murshid Samuel Lewis, dancing in Precita Park in San Francisco."
> This article continues our Elements of Mastery column in which we explore the art, craft and spiritual practice of Dance leading and mentoring.
> As a young wanderer in 1969, I first met my spiritual teacher, Sufi Murshid Samuel Lewis, dancing in Precita Park in San Francisco. I realized quickly that life was taking me on an extraordinary adventure, and that my primary task was simply to be open, to listen, and to welcome the awesome blessings that were pouring forth from this God-realized dervish. I embraced the dances he shared with us as opportunities for ecstasy and as pathways to higher consciousness. I loved the community drawn together around this unpredictable, funny and wise elder. Adorned in our colorful robes, I experienced beauty in each and all of the dancers, and spiritually, I felt I was arriving home.
> Now, more than forty years later, I feel the same yearning for ecstasy and the genuine awakening of my heart. Whether I am leading a dance, playing music for a dance, or dancing a dance, I recognize that with every step, and every breath, the transformative potential of this sacred practice is powerful beyond limits.
> In considering ecstasy and devotion, we are talking about the inner life, what Hazrat Inayat Khan calls the realm of "vibrations." Heart-awakening means just that: the awakening of our hearts from the stupor of isolation, disconnection, and fear, to become alive in the magnetism of spiritual realization. HIK also teaches us that the essential ailment of the human condition, from which all other illnesses and imbalances arise, is a "coldness of heart." Thus, our warm embrace of the Beloved, in whatever form, brings healing to our hearts and lives.
> [h2] Elements of Mastery in Dance Leadership
> - Solar Radiance, being positive in one's offering, confident in one's direct link to one's teachers and lineage teachings.
> - Embodiment, giving one's embodied focus to the practice. "Left foot, right foot", the Dances call us from distractions of mind-mesh into the vibrancy of embodied presence.
> - Calm abiding, relaxing into the practice, which naturally encourages everyone in the circle to be relaxed and engaged.
> - Fana, being effaced of one's own personality, devoting oneself to the practice, and tuning to the needs of the group.
> The training of Dance Leaders mostly involves our own training in spiritual practice. The elements of mastery described above are not learned from a book. They involve our own experience, as Dance Leaders, of the awakening, from within, of our own hearts. As Rumi says: "Close the language door. Open the love window."
> — Murshid Abraham

### "Be Ye Songs of Glory" (by Murshida Halima)
Excerpt: "The Walks and Dances of Universal Peace are an exquisite vehicle for the transformative spiritual awakening to our true nature."
> The Walks and Dances of Universal Peace are an exquisite vehicle for the transformative spiritual awakening to our true nature. In the Dances we overcome isolation and the illusion of our separate individual states, and join together in the experience of our shared humanity. All people have words and expressions for love, compassion, peace, and joy. The Walks and Dances offer us a medium to experience and open to these kind of qualities that are, in reality, always present.
> [blockquote] The dance is the way of Life; the dance is the sway of Life. What Life gives may be expressed with body, heart, and soul to the glory of God and the elevation of humankind, leading therein to ecstasy and self realization. Verily, this is the sacred dance., Murshid SAM, Intro to Spiritual Dancing
> [blockquote] When mankind, terrorized by conflict and faced with the ruin of civilization, when the power of wealth has dominated justice… let us, in spite of what occurs before our eyes invoke that same Divine Spirit through love and beauty, that we may restore order and balance to humanity., Murshid SAM
> In this light, The Walks and Dances of Universal Peace are an active, positive, and powerful agent of change and transformation. As dance leaders, we cultivate and develop the capacity to become conduits for such transformative experience.
> In this way, the Dances, and leading the Dances are a spiritual practice. When we activate our breath and hearts, when we open to compassion, mercy and love, strength, courage, joy, and peace, these energies move through us and can open in us.
> We could also call this process the cultivation of effacement, the capacity to surrender our own ego, and our own sense of self-importance. Sufis call this act of surrender "fana", which is a similar state to what Buddhists call "cultivating emptiness." In this state of fana, a dance leader becomes a vessel, receptive to the ever-present flow of blessing.
> — Murshida Halima

## Posts — Dance Interview (prisma/seed-content.ts / seed-videos.ts)
- "Interview with Halima and Noor with Arjun" (seed-videos.ts updates title to "Interview with Halima and Noor with Arjun, Training of DUP Leaders") — excerpt: "The first interview of a series presenting senior mentors of the Dances of Universal Peace International Network, exploring the training of dance leaders." — body (text version in seed-content.ts):
  > The first interview of a series presenting senior mentors of the Dances of Universal Peace International Network, exploring the subject of the training of dance leaders.
  > Halima and Noor are interviewed by Arjun in this inaugural conversation from the DUP leadership training series.

## Posts — Original Dances (prisma/seed-content.ts)
Each excerpt: "An original dance by Abraham & Halima." (body is the same line plus an audio player). Titles: "Almighty Peace", "Andalusian Zikr", "Ani Mahamin", "Fatima's Gift", "Healing Love", "Lokah Samastah", "Ruach", "Shakti Ye", "Zimbabwe Zikr".
(Note: these are categorized ORIGINAL_DANCE and are excluded from the Teachings list — they live under Music.)

## Music Videos (prisma/seed-videos.ts)
Shown in the Teachings list (type "Videos"); links open on YouTube.
- "Dharma Gem: SamaSangha Choir Subhanallah" — "February 2022. SamaSangha choir recording from a Jamiat Khas gathering."
- "Abraham's Song for Samuel Lewis: Sama Sangha" — "October 23, 2021. Abraham's original song in remembrance of Murshid Samuel Lewis."
- "United in the Heart, Sacred Retreat Video" — "July 30–31, 2021. A retreat video woven through the eyes of the beloved."
- "Горный туман (Mountain Mist), Anna Samia Shatkovskaja" — "Shared by Anna Samia Shatkovskaja for Abraham's birthday, September 30, 2023. Composer and pianist."
- "Rumi Night 2015, Butter Zikr" — "A recording from a Rumi Night gathering: Dances of Universal Peace."
- "Karmu: A Place in the Sun" — "Documentary trailer about Karmu, the beloved Cambridge healer and Murshid Sam's 'Black Christ', who turned no one away."

## Albums (prisma/seed-albums.ts — the live, published source)
Album titles, descriptions, and track titles appear on the Albums grid and album detail pages.

### In Peace: A Call to Unity
> Devotional chants from around the world. This musical compilation invokes our common humanity and the ever-flowing blessing to all. Many of these chants are drawn from our favorite Sufi Dances of Universal Peace, a legacy from American Sufi mystic, Samuel Lewis.
Tracks: Quan Zeon Bosai; Beauty Way; Ana Elna; Ruach; Ishe Oluwa; Andalusian Zikr; Darood; Oxum; Sita Ram Nama Bhajo; Fatima's Gift; Pour Upon Us; Om Tara; Walking Peace; Peace Is Power.

### Voice of the Heart: Remembering
> This beautiful collection of devotional songs was inspired by remembrance of loved ones. All songs are composed by Abraham Sussman.
Tracks: Coming Home; Breath of God; Murshid Rides; Let There Be Beauty; Winning and Losing; Oh Great Spirit; Healer Man (Karmu); Prophets' Zikr; On That Day; Spring; Open Heart (Hazrat Pir Moineddin); Wild Goose.

### Waters of Life (2022)
> Songs and chants celebrating the waters of life, offered by Halima, Abraham, and friends from the SamaSangha community.
Tracks (title, lead): KC Bismillah, Halima Sussman; My Lord Is a Rock, Allaudin Ottinger; Alastu, Halima; Shakti Ye, Abraham Sussman; Vilka Yaku, Arjun; Ani Mahamin, Abraham; Om Tare, Malika Elena Salazar; Returning, Halima; Ixchel in the Rain, Malika; Armaiti Anahita, Khadija Goforth; Butter Zikr, Maitreya; Steady On, Maitreya; Allah Zikr / Subhan Allah, Halima; Fill Your Cup, Allaudin.

### Almighty Peace
> All songs composed by Maitreya Jon Stevens, performed by Abraham, Halima, and friends of the Northeast Sufi community.
Tracks: Zikr of the Groove; Butter Zikr; Steady on the Path; Three Gifts; Cascading Zikr; Kirtan Ram; Forgivemeness; Mutu Qabla; Almighty Peace.

### Healing Love (2025)
> Chants and healing music offered by SamaSangha
Tracks: Mother of Compassion (Kwan Zeon Bosal); Fatima's Gift; Ishe Oluwa; Om Tara; Healing Love; Ruach; Shakti Ye; Medicine Buddha Lotus Crown; Ana Elna; Green Tara; Keep My Faith; Darood; Loka (May All Beings Be Well and Happy).

### Zikr of the Heart (2002)
> With Pir Shabda Kahn & Friends. Recorded live in Boston, April 2002, a joyous collection of devotional chant and zikrs recorded during a SAMA retreat, with over 70 live voices and hearts joining in. Full album available by donation.
Tracks: Album Sample (sample-only album).

### The Bridge
> The Way of the Spiritual Traveller, a musical journey from the mystical traditions of the Middle East. A collaboration of Neil Douglas-Klotz, Abraham Sussman and friends, following the modern pilgrim's progress through the peaks and valleys of the spiritual path.
Tracks: The Shepherd of Ripeness; The World Is a Bridge; Ave Maria in Aramaic; A Blessing of Trust and Creation; Meeting Grief and Loss (Second Beatitude); Love Is as Strong as Death (Song of Songs); A Blessing of Work and Rest; A Prayer for All Healers (Darood); Going Through and Further; Following in the Caravan (Ina D'tayeb, Jn 14:2); Ripeness for the Next Spiral of Life (Inana Raya Tauba, Jn 10:11).

### Beginnings
> A Modern Oratorio inspired by the shared creation stories of the Middle East. A musical collaboration of Saadi Neil Douglas-Klotz, Abraham Sussman & friends, a meditation on Creation drawn from the Hebrew and Christian Bibles and the Quran, including the melodies of Saadi's Genesis Meditations cycle.
Tracks: The Creative Word Resounding: Bereshita Itawa; The Story Begins: Bereshith Bara Elohim; The Unformed Seed of Existence: Tohu Wa Bohu; The Great Dark Rolls In: Wa Choshech; Breath and Darkness Make Love: Wa Ruach Elohim; Light Exists: Iehi Aor; Celebration of the Light: Wa Yira Elohim; Wisdom and Life Energy Embrace: Ya Qanani Re'shith; Wisdom Pours Herself Out: Me'olam Nissakhti; The Birth Dance of Holy Wisdom: Be'an Tehomot; The First Remembrance: Alastu Bi-Rabbikum; In the Divine Image: Nahaseh Adam; For Better and Worse, Reigning with All Creation: Pherou; The Seventh Day: Wa Isheboth.

> Note: prisma/seed-content.ts also contains earlier album drafts (e.g. "Saladin: An Epic Poem" — kept unpublished — and a placeholder "Beginnings: A Modern Oratorio" that seed-albums.ts deletes). The live copy above is from seed-albums.ts.

## Events (prisma/seed-content.ts)

### Dance Deepening & Leaders Support 2026 (slug: dance-deepening-2026)
- Dates: May 29–31, 2026; Location: "Rural North Central Massachusetts (1.5 hrs NW of Boston)"; Retreat, featured.
- Description:
  > Transmission & Living Spirit: Towards 7 Generations. With Murshids Halima & Abraham, Malika Salazar + Friends! We attune to the living magnetism that infuses this beautiful practice. Singing and moving together Towards the One, we practice breath, rhythm, sound, listening, and heart awakening. Dancing our prayers, we celebrate the Sacred. All Lovers of the Dance are Welcome. Together we cultivate the ground of our shared future. This is a deepening opportunity for all Dancers and a supportive opportunity for Dance Leaders and Mentors.

### Eat, Dance, and Pray Together 2026 (slug: eat-dance-pray-2026)
- Dates: July 30 – August 2, 2026; Location: "Rural Massachusetts"; Retreat, featured. (Rendered with the custom EatDancePrayLayout.)
- Description:
  > With Abraham & Halima, Malika (Colombia) & Friends. This year's retreat allows us to tune into our natural rhythms and demonstrate Peace and Harmony. Eat, Dance, and Pray together is the actualized vision Sufi Murshid Samuel Lewis held for world peace! We gather to BE present together, to practice simple presence with the Walks and Dances of Universal Peace, Zikr, Meditation, Silence, Listening, Kirtan, and Yoga. We Eat, Dance, and Pray together!

## Seed rooms (prisma/seed.ts)
Retreat room names (admin-side, used in registration logistics): "Yurt", "Main House", "Camping".
