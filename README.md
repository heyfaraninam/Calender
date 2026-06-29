<div align="center">

# ✦ CALENDAR

### A glassmorphic calendar app with month, week & day views, drag-to-reschedule, recurring events, and color labels — built in pure HTML, CSS & JS.

<br/>

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![No Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen?style=for-the-badge)
![Local Storage](https://img.shields.io/badge/storage-localStorage-blueviolet?style=for-the-badge)

<br/>

> Month · Week · Day · Drag & Drop · Recurring · Color Labels · Upcoming Panel

<br/>

</div>

---

## ✦ Features

### 📅 Three Views

| View | Description |
|------|-------------|
| **Month** | 6-week grid with up to 3 event chips per day and overflow count |
| **Week** | 7-column hourly grid, events positioned by exact start/end time |
| **Day** | Single-column hourly timeline showing title, time, and notes |

### 🖱️ Drag & Drop
Drag any event chip to a new day in month or week view to instantly reschedule it.

### 🔁 Recurring Events
Set any event to repeat:

| Mode | Behaviour |
|------|-----------|
| None | One-time event |
| Daily | Repeats every day |
| Weekly | Repeats on the same weekday |
| Monthly | Repeats on the same date each month |

### 🎨 Color Labels
8 color swatches per event — purple, cyan, pink, yellow, green, orange, teal, rose.

### 🕐 Current Time Indicator
A glowing red line in week and day views shows exactly where you are right now.

### 📋 Sidebar
- **Mini calendar** — click any day to jump to Day view, dots show days with events
- **Upcoming panel** — next 30 days of events sorted by date and time, click to jump

### 💾 Persistent Storage
All events saved to `localStorage` — survive page refresh and browser restarts.

---

## ✦ Getting Started

```bash
git clone https://github.com/heyfaraninam/Calendar.git
cd calendar
open index.html
```

No build step. No npm. No config.

---

## ✦ File Structure

```
calendar/
├── index.html     # Layout, topbar, sidebar, modal, views
├── styles.css     # Glassmorphism, grid layouts, event chips, modal
└── app.js         # Calendar logic, recurring events, drag & drop, localStorage
```

---

## ✦ Keyboard & Interaction

| Action | How |
|--------|-----|
| Create event | Click any cell or ＋ Event button |
| Edit event | Click any event chip |
| Delete event | Open event → Delete button |
| Reschedule | Drag event to new day |
| Navigate | ‹ › arrows or mini calendar |
| Jump to today | Today button in topbar |

---

## ✦ Browser Support

| Browser | Support |
|---------|---------|
| Chrome 76+ | ✅ Full |
| Firefox 103+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Edge 79+ | ✅ Full |

---

## ✦ Part of a Series

| Project | Description |
|---------|-------------|
| [Calculator](https://github.com/heyfaraninam/Calculator) | Glassmorphic calculator with 4 themes & scientific mode |
| [Notes](https://github.com/heyfaraninam/Notes) | Notes app with tags, pinning & search |
| [Weather](https://github.com/heyfaraninam/Weather) | Weather app with forecast & geolocation |
| [Typing Speed](https://github.com/heyfaraninam/typing-speed) | Typing test with live WPM & history |
| [Password Generator](https://github.com/heyfaraninam/password-generator) | Cryptographic password generator |
| [Pomodoro](https://github.com/heyfaraninam/pomodoro) | Pomodoro timer with ambient sounds |
| [Movies](https://github.com/heyfaraninam/movies) | Movie search with cast, trailers & favorites |
| **Calendar** | This project |

---

## ✦ Tags

`calendar` `glassmorphism` `vanilla-js` `drag-and-drop` `dark-theme` `localstorage` `recurring-events` `html-css-js` `no-dependencies` `frontend`

---

## ✦ License

MIT — free to use, modify, and ship.

---

<div align="center">

Made with care · pure HTML · CSS · JS · no frameworks needed

</div>
