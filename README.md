# ShopNova — E-Commerce Product Catalog

A full-stack, multi-page e-commerce product catalog built with **Next.js**, featuring Server-Side Rendering (SSR), API Routes, and NextAuth.js authentication. The application demonstrates modern web development patterns including a dark-theme premium UI, PostgreSQL database with Prisma ORM, and Docker containerization.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![NextAuth.js](https://img.shields.io/badge/NextAuth.js-4-green)

---

## ✨ Features

### Core Functionality
- **Server-Side Rendering (SSR)** — Product listing and detail pages rendered on the server for SEO and performance
- **Server-Side Search** — Case-insensitive product search via URL query parameters (`?q=`)
- **Server-Side Pagination** — Navigate through products with `?page=` parameter (12 products per page)
- **Category Filtering** — Filter products by category with URL-based state
- **Shopping Cart** — Full CRUD operations with real-time quantity updates
- **Protected Routes** — Middleware-based authentication on `/cart` routes

### Authentication
- **NextAuth.js** with GitHub OAuth and Credentials-based login
- **Prisma Adapter** for database-backed authentication
- **JWT Session Strategy** for secure token management
- **Custom Sign-In Page** with premium dark theme design

### API Layer
- `GET /api/products` — List products with search, filter, pagination
- `GET /api/products/[id]` — Single product details
- `GET /api/cart` — Fetch authenticated user's cart
- `POST /api/cart` — Add items to cart (Zod validated)
- `PUT /api/cart/update` — Update item quantities
- `DELETE /api/cart` — Remove items from cart
- All cart endpoints are **authenticated** and **validated with Zod**

### UI/UX
- Premium **dark theme** with glassmorphism effects
- **Responsive design** for all screen sizes
- **Micro-animations** on hover, transitions, and loading states
- **Toast notifications** for cart operations
- **data-testid** attributes on all interactive elements

---

## 🚀 Quick Start

### Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js](https://nodejs.org/) 18+ (for local development)

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone git@github.com:sanjaysahoo21/my-ecommerce-app.git
cd my-ecommerce-app

# Start all services (app + database)
docker-compose up

# The app will be available at http://localhost:3000
```

This single command will:
1. Start a PostgreSQL 15 database
2. Run the database seed script (24 products + test user)
3. Build and start the Next.js application
4. Wait for database health before starting the app

### Option 2: Local Development

```bash
# Clone the repository
git clone git@github.com:sanjaysahoo21/my-ecommerce-app.git
cd my-ecommerce-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and OAuth secrets

# Start only the database
docker-compose up db

# Generate Prisma client
npx prisma generate

# Run the development server
npm run dev
```

---

## 🗂 Project Structure

```
my-ecommerce-app/
├── components/          # Reusable React components
│   ├── Layout.tsx       # App layout with navbar and footer
│   ├── ProductCard.tsx  # Product card for grid display
│   ├── Toast.tsx        # Toast notification component
│   └── LoadingSpinner.tsx
├── lib/                 # Utility libraries
│   ├── prisma.ts        # Prisma client singleton
│   └── validations.ts   # Zod validation schemas
├── pages/
│   ├── api/
│   │   ├── auth/[...nextauth].ts  # NextAuth.js handler
│   │   ├── cart/                   # Cart CRUD endpoints
│   │   └── products/              # Product endpoints
│   ├── auth/signin.tsx  # Custom sign-in page
│   ├── products/[id].tsx # Product detail (SSR)
│   ├── cart.tsx          # Shopping cart page
│   ├── index.tsx         # Product listing (SSR)
│   ├── 404.tsx           # Custom 404 page
│   ├── _app.tsx          # App wrapper with providers
│   ├── _document.tsx     # Custom HTML document
│   └── _error.tsx        # Custom error page
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed-data/        # SQL seed scripts
├── styles/
│   └── globals.css       # Global styles & design system
├── middleware.ts         # Route protection middleware
├── docker-compose.yml    # Docker services configuration
├── Dockerfile            # Multi-stage Docker build
├── .env.example          # Environment variable template
└── submission.json       # Test credentials
```

---

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@db:5432/ecommerce` |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | JWT signing secret | `openssl rand -base64 32` |
| `GITHUB_ID` | GitHub OAuth App client ID | Your GitHub OAuth ID |
| `GITHUB_SECRET` | GitHub OAuth App secret | Your GitHub OAuth Secret |

---

## 🧪 Testing

### Test User
The seed script creates a test user account:
- **Email:** `test.user@example.com`
- **Name:** Test User

Use the "Test Account" login option on the sign-in page.

### Data Test IDs
All interactive elements have `data-testid` attributes for E2E testing:

| Page | Element | data-testid |
|------|---------|------------|
| Home | Search Input | `search-input` |
| Home | Search Button | `search-button` |
| Home | Product Card | `product-card-{productId}` |
| Home | Add to Cart | `add-to-cart-button-{productId}` |
| Home | Next Page | `pagination-next` |
| Home | Previous Page | `pagination-prev` |
| Detail | Product Name | `product-name` |
| Detail | Product Price | `product-price` |
| Detail | Description | `product-description` |
| Detail | Add to Cart | `add-to-cart-button` |
| Cart | Cart Item | `cart-item-{productId}` |
| Cart | Remove Button | `remove-item-button-{productId}` |
| Cart | Quantity Input | `quantity-input-{productId}` |
| Cart | Cart Total | `cart-total` |
| Auth | Sign In Button | `signin-button` |
| Nav | Sign Out Button | `signout-button` |

---

## 📦 Tech Stack

- **Framework:** Next.js 16 (Pages Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS + Custom CSS Design System
- **Database:** PostgreSQL 15
- **ORM:** Prisma 7
- **Authentication:** NextAuth.js 4
- **Validation:** Zod
- **Data Fetching:** SWR
- **Containerization:** Docker & Docker Compose

---

## 📄 License

This project is built for educational purposes as part of a full-stack web development course.
