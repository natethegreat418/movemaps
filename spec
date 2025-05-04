
# MovieMap Specification

**Project Idea:**  
Display filming locations of famous movies/TV shows on an interactive map. Click a pin to see movie data, cast, and a clip.

---

## 🎯 Target Audience
- **Primary Persona:** Film buffs

---

## 🌍 Location Granularity
- General, recognizable areas (e.g. “Central Park, NYC”)

---

## 🗂️ Data Source Strategy
- Pull filming data from existing APIs (e.g. TMDb, Wikipedia)
- Allow moderated community contributions

---

## 🎬 Focus of Content
- Only **actual** filming locations (not story-based locations)

---

## 📌 On-Click Pin Data
- Movie/TV Title
- Release Year
- Embedded Trailer or Link
- IMDb Link

---

## 🔍 Filter Options
- Director
- Country
- Actor

---

## 🗺️ Mapping Library
- **Mapbox GL JS**

---

## 🧾 Initial Dataset
- 100 curated titles at launch

---

## ✍️ Community Contributions
Fields required:
- Movie/TV Title
- General Location (name + Mapbox coordinates)
- Trailer URL
- IMDb Link

---

## ✅ Moderation Workflow
- Internal user approval required
- Moderator may add additional metadata before publishing
- Lightweight admin interface built into the app

---

## 📱 Mobile Support
- Fully mobile-friendly and responsive design

---

## 📍 Location Conflicts
- Stack multiple films/shows into a scrollable list when they share a location

---

## 🔐 User Features
- No user login or bookmarking features at launch
- Moderator login only

---

## 🧱 Tech Stack

### Frontend
- React + Vite

### Map
- Mapbox GL JS

### Backend
- Node.js + Express

### Database
- PostgreSQL + PostGIS

### Auth
- Firebase Auth (for moderator access)

### Admin Interface
- Lightweight admin panel within the app

---

## 📦 Deployment
- Hosting on **Netlify**

---

## 🖌️ Visual & Branding
- To be handled later in the design phase

---

## 📊 Analytics
- Not included in MVP, but app will be structured for future integration

---

## 🗃️ Format Flexibility
- Distinction between TV and Movie stored as metadata in DB (not emphasized in UI for now)
