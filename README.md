# Revenio

A campus lost & found platform built to replace chaotic WhatsApp/Telegram threads with a searchable, moderated, and secure system for students to report and recover lost items.

## Features

- **Google OAuth login** — restricted to college email accounts via Google Identity Services
- **Post lost/found items** — with category, location, date, tags, and optional photo upload
- **Pre-post confirmation** — posters must confirm they checked the opposite listing (Lost ↔ Found) before submitting, with a one-click "Check now" shortcut
- **Search & filter** — full-text search across title/description/tags, plus category filtering
- **My Items** — a personal dashboard of everything a user has posted
- **Claim flow** — claimants answer a verification question set by the finder; posters review, approve, or reject claims; rejected claimants may retry
- **Lost/Found suggestions** — a founder can suggest one of their found posts matches someone else's lost post; the loser reviews the suggestion and must still submit a normal claim (with verification) to actually resolve it — suggestions never bypass claim verification
- **Auto-resolution** — approving one claim automatically rejects other pending claims on the same item and marks the item as claimed; if the claim was linked to the claimant's own lost post, that lost post is deleted and its pending suggestions are dismissed
- **Mark as Returned** — poster, admin, or the approved claimant can close out a resolved item
- **Messaging** — a lightweight, non-live message thread attached to each claim, suggestion, or report, so the two relevant parties (or, for reports, the reporter and any admin) can coordinate; messages are cascade-deleted when their item is returned
- **Image uploads** — via Cloudinary, with client-side size/type validation before upload
- **Report abuse** — report an item, a user, or a claimant; duplicate pending reports on the same target are blocked
- **Profile panel** — a unified `/dashboard` route: regular users see their own Claims/Suggestions/Reports (tagged incoming/outgoing, filterable); admins see the Admin Panel instead
- **Admin panel** — view and block/unblock users, review and resolve abuse reports, delete individual claims/suggestions/items, and run a one-click cleanup that purges resolved data (returned items, rejected claims, dismissed suggestions, reviewed/dismissed reports, and their associated messages)
- **Role separation** — admins are moderation-only accounts; they cannot post, claim, or suggest matches
- **Dark/light theme** — Catppuccin Latte (light) and Mocha (dark) palettes, toggleable and persisted
- **Responsive design** — usable down to 320px width

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
│   │   │   ├── item
│   │   │   │    ├── ClaimForm.jsx
│   │   │   │    ├── ClaimFormReview.jsx
│   │   │   │    ├── ItemActions.jsx
│   │   │   │    ├── ItemHeader.jsx
│   │   │   │    ├── MyClaimHistory.jsx
│   │   │   │    ├── SuggestionForm.jsx
│   │   │   │    └── SuggestionReviewPanel.jsx
│   │   │   ├── profile
│   │   │   │    ├── AdminPanel.jsx
│   │   │   │    └── UserPanel.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PageContainer.jsx
│   │   │   ├── ReportButton.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/
│   │   │   ├── ItemDetail.jsx
│   │   │   ├── ItemsDashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MessagePage.jsx
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
│    │   │   ├── message.controller.js
│    │   │   ├── report.controller.js
│    │   │   ├── suggestion.controller.js
│    │   │   └── upload.controller.js
│    │   ├── middleware/
│    │   │   ├── auth.middleware.js
│    │   │   ├── error.middleware.js
│    │   │   └── upload.middleware.js
│    │   ├── models/
│    │   │   ├── claim.model.js
│    │   │   ├── item.model.js
│    │   │   ├── message.model.js
│    │   │   ├── report.model.js
│    │   │   └── suggestion.model.js
│    │   │   └── user.model.js
│    │   ├── routes/
│    │   │   ├── admin.routes.js
│    │   │   ├── auth.routes.js
│    │   │   ├── claim.routes.js
│    │   │   ├── item.routes.js
│    │   │   ├── message.routes.js
│    │   │   ├── report.routes.js
│    │   │   └── suggestion.routes.js
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

**Item** — type (lost/found), title, description, category, location, date, photoUrl, status (active/claimed/returned), postedBy, claimQuestion, tags

**Claim** — itemId, claimantId, answer, message, status (pending/approved/rejected), linkedLostItem (optional — the claimant's own lost post, deleted automatically on approval)

**Suggestion** — lostItem, foundItem, suggestedBy, status (pending/dismissed)

**Report** — reportedBy, targetItem, targetUser, reason, status (pending/reviewed/dismissed)

**Message** — attachedClaim / attachedSuggestion / attachedReport (exactly one set), senderId, recipientId (null for report threads — shared admin inbox), body

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

Seeds three role-labeled test accounts (Bot Loser, Bot Founder, Bot Claimer) with sample items, claims, and reports.

1. Generate with:

```bash
npm run seed
```

2. Delete with:

```bash
npm run unseed
```

## API Overview

| Method | Route                               | Description                                                                                                |
| ------ | ----------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| POST   | `/api/auth/google`                  | Verify Google token, issue JWT                                                                             |
| GET    | `/api/auth/me`                      | Get current user                                                                                           |
| GET    | `/api/items`                        | List items (supports `type`, `category`, `status`, `q`)                                                    |
| POST   | `/api/items`                        | Create a lost/found item                                                                                   |
| GET    | `/api/items/mine`                   | Get logged-in user's own items (supports `type`)                                                           |
| GET    | `/api/items/:id`                    | Get single item                                                                                            |
| PATCH  | `/api/items/:id/status`             | Update item status                                                                                         |
| DELETE | `/api/items/:id`                    | Delete an item (admin)                                                                                     |
| POST   | `/api/claims`                       | Submit a claim                                                                                             |
| GET    | `/api/claims/mine`                  | Get logged-in user's claims, tagged incoming/outgoing                                                      |
| GET    | `/api/claims/item/:itemId`          | Get claims for an item (poster sees own claim, poster/admin see all)                                       |
| PATCH  | `/api/claims/:id`                   | Approve/reject a claim                                                                                     |
| DELETE | `/api/claims/:id`                   | Delete a claim (admin)                                                                                     |
| POST   | `/api/suggestions`                  | Suggest a found item as a match for a lost item                                                            |
| GET    | `/api/suggestions/mine`             | Get logged-in user's suggestions, tagged incoming/outgoing                                                 |
| GET    | `/api/suggestions/lost/:lostItemId` | Get suggestions on a lost item (poster/admin)                                                              |
| PATCH  | `/api/suggestions/:id/dismiss`      | Dismiss a suggestion                                                                                       |
| DELETE | `/api/suggestions/:id`              | Delete a suggestion (admin)                                                                                |
| POST   | `/api/reports`                      | Submit a report                                                                                            |
| GET    | `/api/reports`                      | List reports (admin)                                                                                       |
| GET    | `/api/reports/mine`                 | List the logged-in user's own reports                                                                      |
| PATCH  | `/api/reports/:id`                  | Update report status (admin)                                                                               |
| POST   | `/api/messages`                     | Send a message on a claim/suggestion/report thread                                                         |
| GET    | `/api/messages/:type/:id`           | Get a message thread (`type` = claim / suggestion / report)                                                |
| GET    | `/api/admin/users`                  | List all users (admin)                                                                                     |
| PATCH  | `/api/admin/users/:id/block`        | Block/unblock a user (admin)                                                                               |
| DELETE | `/api/admin/cleanup`                | Purge resolved reports, rejected claims, dismissed suggestions, returned items, and their messages (admin) |
| POST   | `/api/upload`                       | Upload an image to Cloudinary                                                                              |
