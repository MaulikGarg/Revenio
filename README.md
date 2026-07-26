# Revenio

A campus lost & found platform built to replace chaotic WhatsApp/Telegram threads with a searchable, moderated, and secure system for students to report and recover lost items.

## Features

- **Google OAuth login** — restricted to college email accounts via Google Identity Services
- **Post lost/found items** — with category, location, date, tags, and optional photo upload
- **Search & filter** — full-text search across title/description/tags, plus category filtering
- **Claim flow** — claimants answer a verification question set by the finder; posters review, approve, or reject claims
- **Auto-resolution** — approving one claim automatically rejects other pending claims on the same item, and marks the item as claimed
- **Image uploads** — via Cloudinary, with client-side size/type validation before upload
- **Admin panel** — view and block/unblock users, review and resolve abuse reports
- **Dark/light theme** — Catppuccin Latte (light) and Mocha (dark) palettes, toggleable and persisted
- **Responsive design** — usable across mobile, tablet, and desktop breakpoints

## Tech Stack

**Frontend:** React (Vite), React Router, Tailwind CSS v4, Axios, lucide-react

**Backend:** Node.js, Express, MongoDB (Mongoose)

**Auth:** Google Identity Services + JWT

**Image hosting:** Cloudinary (via Multer)

## Project Structure

```
Revenio/
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   ├── components/
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PageContainer.jsx
│   │   │   ├── ReportButton.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── ItemDetail.jsx
│   │   │   ├── ItemsDashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── PostItemForm.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
└── server/
│    ├── scripts/
│    │   ├── seed.js
│    │   ├── unseed.js
│    ├── src/
│    │   ├── config/
│    │   │   ├── cloudinary.js
│    │   │   └── db.js
│    │   ├── controllers/
│    │   │   ├── admin.controller.js
│    │   │   ├── auth.controller.js
│    │   │   ├── claim.controller.js
│    │   │   ├── item.controller.js
│    │   │   ├── report.controller.js
│    │   │   └── upload.controller.js
│    │   ├── middleware/
│    │   │   ├── auth.middleware.js
│    │   │   ├── error.middleware.js
│    │   │   └── upload.middleware.js
│    │   ├── models/
│    │   │   ├── claim.model.js
│    │   │   ├── item.model.js
│    │   │   ├── report.model.js
│    │   │   └── user.model.js
│    │   ├── routes/
│    │   │   ├── admin.routes.js
│    │   │   ├── auth.routes.js
│    │   │   ├── claim.routes.js
│    │   │   ├── item.routes.js
│    │   │   ├── report.routes.js
│    │   │   └── upload.routes.js
│    │   └── app.js
│    ├── .env
│    ├── .gitignore
│    ├── package.json
│    ├── package-lock.json
│    └── server.js
```

## Data Models

**User** — name, email, googleId, role (student/admin), blocked status

**Item** — type (lost/found), title, description, category, location, date, photoUrl, status (active/claimed/returned), postedBy, claimQuestion, tags, matchedWith

**Claim** — itemId, claimantId, answer, message, status (pending/approved/rejected)

**Report** — reportedBy, targetItem, targetUser, reason, status (pending/reviewed/dismissed)

## Setup

### Backend

```bash
cd server
npm install
```

Create a `.env` file in `/server`:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=7d
GOOGLE_CLIENT_ID=your_google_oauth_client_id
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=3000
CLIENT_URL=http://localhost:5173
```

```bash
node server.js
```

### Frontend

```bash
cd client
npm install
```

Create a `.env` file in `/client`:

```
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

```bash
npm run dev
```

### Google OAuth setup

1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
2. Create an OAuth 2.0 Client ID (Web application)
3. Add `http://localhost:5173` under **Authorized JavaScript origins**
4. Use the resulting Client ID in both `.env` files above

### Cloudinary setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Copy your Cloud Name, API Key, and API Secret from the dashboard into the backend `.env`

### Dummy data

1. Generate with:

```bash
npm run seed
```

2. Delete with:

```bash
npm run unseed
```

## API Overview

| Method | Route                        | Description                                             |
| ------ | ---------------------------- | ------------------------------------------------------- |
| POST   | `/api/auth/google`           | Verify Google token, issue JWT                          |
| GET    | `/api/auth/me`               | Get current user                                        |
| GET    | `/api/items`                 | List items (supports `type`, `category`, `status`, `q`) |
| POST   | `/api/items`                 | Create a lost/found item                                |
| GET    | `/api/items/:id`             | Get single item                                         |
| GET    | `/api/items/mine/lost`       | Get lost items of logged in user                        |
| PATCH  | `/api/items/:id/status`      | Update item status                                      |
| POST   | `/api/claims`                | Submit a claim                                          |
| GET    | `/api/claims/item/:itemId`   | Get claims for an item (poster/admin)                   |
| PATCH  | `/api/claims/:id`            | Approve/reject a claim                                  |
| POST   | `/api/reports`               | Submit a report                                         |
| GET    | `/api/reports`               | List reports (admin)                                    |
| GET    | `/api/reports/mine`          | List reports of target user/item                        |
| PATCH  | `/api/reports/:id`           | Update report status (admin)                            |
| GET    | `/api/admin/users`           | List all users (admin)                                  |
| PATCH  | `/api/admin/users/:id/block` | Block/unblock a user (admin)                            |
| POST   | `/api/upload`                | Upload an image to Cloudinary                           |
