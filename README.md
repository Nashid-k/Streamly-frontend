# 🎬 StreamUI Frontend (Next.js)

Welcome to the **StreamUI Frontend**, a highly responsive, cinematic streaming interface built with modern web technologies. This application is engineered to deliver an authentic, premium user experience akin to industry leaders like Netflix, Prime Video, and Disney+ Hotstar.

## ✨ Features

- **Premium UX/UI:** Glassmorphic navigation, smooth 300ms peek-UI card expansions, and satisfying button ripple micro-interactions.
- **Cinematic Hero Banners:** Edge-to-edge billboards featuring auto-playing background trailers and bold typography.
- **Magnetic Carousels:** CSS scroll-snapping ensures movie rows glide perfectly into place.
- **Multi-Platform Theming:** Switch instantly between themes (Netflix, Prime, Hotstar) with dedicated color palettes and CSS variables.
- **Smart Search & AI Filtering:** Search the entire catalog in real-time, or let AI apply smart filters based on complex queries.
- **Cross-Platform PWA:** Installable as a Progressive Web App for a native app feel on mobile devices.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env.local` file in the root of the `frontend` directory and add your API endpoints or secrets (e.g., your backend URL).
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

3. **Run the Development Server:**
   ```bash
   npm run dev
   ```

4. **Open in Browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the magic happen!

## 🛠️ Tech Stack
- **Framework:** Next.js (React)
- **Styling:** Custom CSS with Premium Keyframe Animations & CSS Variables
- **Icons:** Lucide React
- **Motion:** Framer Motion (for page transitions)

## 🎨 Design Philosophy
The UI is driven by an obsessive focus on detail:
- **Typography:** Tight letter-spacing for headers, giving a cinematic, heavy weight.
- **Feedback:** Every interaction (from clicking a button to hovering a card) provides immediate, satisfying visual feedback.
- **Layout:** Utilizing modern CSS Grid (`.classic-grid`) for flawless responsiveness across mobile, tablet, and ultra-wide displays.
