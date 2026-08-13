# Scriper 2 - Web Scraper & Scraped Leads Dashboard

A dedicated, high-performance web scraping and lead dashboard application built with Node.js, Express, Playwright, React, Vite, and Tailwind CSS.

## Features

- 🕷️ **Playwright Live Scraper Engine**: Headless browser automation targeting Google Maps and JustDial listings.
- ⚡ **Real-time Scrape Job Progress**: Live percentage bar, status tracking, item count, and stop capability.
- 📊 **Scraped Leads Explorer**: Dynamic data table featuring search, multi-faceted filtering (Source, Phone, Website, City), sorting, and detailed lead inspector modal.
- 💾 **Dual-Mode Persistence**: MongoDB Mongoose connection support with automatic fallback to local JSON database storage (works out of the box with zero DB setup required).
- 📥 **CSV & JSON Export**: One-click export for scraped lead data.
- 📜 **Mission History**: Comprehensive audit log of past scraping runs.

## Prerequisites

- **Node.js**: v18+
- Playwright Chromium browser binaries (installed automatically via npm)

## Setup & Running

### 1. Install All Dependencies

From the project root (`scriper-2`), run:

```bash
npm run install:all
```

### 2. Install Playwright Browsers (if needed)

```bash
cd backend
npx playwright install chromium
```

### 3. Run Development Servers

From the root directory:

```bash
npm run dev
```

This starts both:
- **Backend API Server**: `http://localhost:5000`
- **Frontend Dashboard**: `http://localhost:5173`

Open `http://localhost:5173` in your web browser.
