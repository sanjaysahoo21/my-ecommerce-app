-- =============================================
-- Database Initialization Script for E-Commerce App
-- This script runs automatically when the PostgreSQL
-- container starts for the first time.
-- =============================================

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper function to generate cuid-like IDs
CREATE OR REPLACE FUNCTION generate_cuid() RETURNS TEXT AS $$
BEGIN
  RETURN 'c' || encode(gen_random_bytes(12), 'hex');
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Create Tables
-- =============================================

-- User table (NextAuth.js compatible)
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL DEFAULT generate_cuid(),
  "name" TEXT,
  "email" TEXT,
  "emailVerified" TIMESTAMP(3),
  "image" TEXT,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- Account table (NextAuth.js)
CREATE TABLE IF NOT EXISTS "Account" (
  "id" TEXT NOT NULL DEFAULT generate_cuid(),
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  CONSTRAINT "Account_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- Session table (NextAuth.js)
CREATE TABLE IF NOT EXISTS "Session" (
  "id" TEXT NOT NULL DEFAULT generate_cuid(),
  "sessionToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken");

-- VerificationToken table (NextAuth.js)
CREATE TABLE IF NOT EXISTS "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- Product table
CREATE TABLE IF NOT EXISTS "Product" (
  "id" TEXT NOT NULL DEFAULT generate_cuid(),
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'General',
  "inStock" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- Cart table
CREATE TABLE IF NOT EXISTS "Cart" (
  "id" TEXT NOT NULL DEFAULT generate_cuid(),
  "userId" TEXT NOT NULL,
  CONSTRAINT "Cart_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Cart_userId_key" ON "Cart"("userId");

-- CartItem table
CREATE TABLE IF NOT EXISTS "CartItem" (
  "id" TEXT NOT NULL DEFAULT generate_cuid(),
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "productId" TEXT NOT NULL,
  "cartId" TEXT NOT NULL,
  CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "CartItem_cartId_productId_key" ON "CartItem"("cartId", "productId");

-- Prisma migrations table (to prevent Prisma from complaining)
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  "id" VARCHAR(36) NOT NULL,
  "checksum" VARCHAR(64) NOT NULL,
  "finished_at" TIMESTAMP(3),
  "migration_name" VARCHAR(255) NOT NULL,
  "logs" TEXT,
  "rolled_back_at" TIMESTAMP(3),
  "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);

-- =============================================
-- Seed Data - Test User
-- =============================================
INSERT INTO "User" ("id", "name", "email", "image") VALUES
  ('test-user-id-001', 'Test User', 'test.user@example.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser')
ON CONFLICT ("email") DO NOTHING;

-- =============================================
-- Seed Data - Products (24 products across categories)
-- =============================================
INSERT INTO "Product" ("id", "name", "description", "price", "imageUrl", "category", "inStock", "createdAt", "updatedAt") VALUES
  ('prod-001', 'Wireless Noise-Cancelling Headphones', 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio. Features Bluetooth 5.2 and built-in microphone for calls.', 299.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 'Electronics', true, NOW(), NOW()),
  ('prod-002', 'Mechanical Gaming Keyboard', 'RGB backlit mechanical keyboard with Cherry MX Blue switches, programmable macro keys, and durable aluminum frame. Perfect for gaming and typing enthusiasts.', 149.99, 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500', 'Electronics', true, NOW(), NOW()),
  ('prod-003', 'Ultra-Wide 34" Monitor', 'Immersive 34-inch curved ultrawide monitor with 3440x1440 resolution, 144Hz refresh rate, and HDR support. Ideal for productivity and gaming.', 599.99, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500', 'Electronics', true, NOW(), NOW()),
  ('prod-004', 'Smart Fitness Watch', 'Advanced fitness tracker with heart rate monitoring, GPS, sleep tracking, and 7-day battery life. Water-resistant to 50 meters with a vibrant AMOLED display.', 249.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', 'Electronics', true, NOW(), NOW()),
  ('prod-005', 'Portable Bluetooth Speaker', 'Waterproof portable speaker with 360-degree sound, 20-hour battery life, and deep bass. Connects to multiple devices simultaneously via Bluetooth 5.0.', 79.99, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500', 'Electronics', true, NOW(), NOW()),
  ('prod-006', 'Ergonomic Office Chair', 'Premium ergonomic chair with lumbar support, adjustable armrests, breathable mesh back, and tilt mechanism. Designed for all-day comfort during work.', 449.99, 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500', 'Furniture', true, NOW(), NOW()),
  ('prod-007', 'Standing Desk Converter', 'Height-adjustable standing desk converter with smooth pneumatic lift, spacious work surface, and built-in cable management. Easily converts any desk.', 329.99, 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500', 'Furniture', true, NOW(), NOW()),
  ('prod-008', 'Minimalist Bookshelf', 'Modern 5-tier bookshelf crafted from solid oak wood with a minimalist Scandinavian design. Perfect for organizing books, plants, and decorative items.', 189.99, 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=500', 'Furniture', true, NOW(), NOW()),
  ('prod-009', 'Leather Messenger Bag', 'Handcrafted genuine leather messenger bag with padded laptop compartment, multiple pockets, and adjustable shoulder strap. Fits up to 15-inch laptops.', 129.99, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', 'Accessories', true, NOW(), NOW()),
  ('prod-010', 'Stainless Steel Water Bottle', 'Double-walled vacuum insulated water bottle that keeps drinks cold for 24 hours or hot for 12 hours. BPA-free with a leak-proof bamboo cap. 750ml capacity.', 34.99, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500', 'Accessories', true, NOW(), NOW()),
  ('prod-011', 'Organic Cotton T-Shirt', 'Premium organic cotton t-shirt with a relaxed fit and modern design. Sustainably sourced materials with eco-friendly dyes. Available in multiple colors.', 39.99, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', 'Clothing', true, NOW(), NOW()),
  ('prod-012', 'Running Shoes Pro', 'Lightweight performance running shoes with responsive cushioning, breathable mesh upper, and durable rubber outsole. Designed for long-distance runners.', 159.99, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 'Clothing', true, NOW(), NOW()),
  ('prod-013', 'Espresso Machine Deluxe', 'Professional-grade espresso machine with 15-bar pump pressure, built-in grinder, milk frother, and programmable brewing profiles. Makes cafe-quality coffee at home.', 699.99, 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=500', 'Home & Kitchen', true, NOW(), NOW()),
  ('prod-014', 'Cast Iron Skillet Set', 'Pre-seasoned cast iron skillet set (8", 10", 12") with superior heat retention and distribution. Oven-safe up to 500°F, suitable for all cooktops including induction.', 89.99, 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500', 'Home & Kitchen', true, NOW(), NOW()),
  ('prod-015', 'Smart LED Desk Lamp', 'Adjustable LED desk lamp with wireless charging base, multiple color temperatures, brightness levels, and USB port. Touch-sensitive controls with memory function.', 69.99, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500', 'Home & Kitchen', true, NOW(), NOW()),
  ('prod-016', 'Yoga Mat Premium', 'Extra-thick 6mm yoga mat with alignment lines, non-slip texture on both sides, and carrying strap. Made from eco-friendly TPE material. 72" x 26" dimensions.', 49.99, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500', 'Sports', true, NOW(), NOW()),
  ('prod-017', 'Adjustable Dumbbell Set', 'Space-saving adjustable dumbbell set from 5-52.5 lbs per hand. Quick-change weight selection dial with durable construction. Replaces 15 sets of dumbbells.', 399.99, 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500', 'Sports', true, NOW(), NOW()),
  ('prod-018', 'Resistance Bands Set', 'Professional resistance bands set with 5 levels (10-50 lbs), door anchor, ankle straps, and carrying bag. Perfect for home workouts, physical therapy, and stretching.', 29.99, 'https://images.unsplash.com/photo-1598632640487-6ea4a4e8b963?w=500', 'Sports', true, NOW(), NOW()),
  ('prod-019', 'Wireless Charging Pad', 'Sleek Qi-certified wireless charging pad with 15W fast charging, LED indicator, and anti-slip surface. Compatible with all Qi-enabled smartphones and earbuds.', 24.99, 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500', 'Electronics', true, NOW(), NOW()),
  ('prod-020', 'Bamboo Cutting Board Set', 'Premium bamboo cutting board set (3 sizes) with juice grooves, easy-grip handles, and antimicrobial surface. Knife-friendly and eco-sustainable kitchen essential.', 44.99, 'https://images.unsplash.com/photo-1594226801341-41427b4e5c22?w=500', 'Home & Kitchen', true, NOW(), NOW()),
  ('prod-021', 'Noise-Cancelling Earbuds', 'True wireless earbuds with hybrid active noise cancellation, transparency mode, and spatial audio. IPX5 water-resistant with 8-hour battery plus 24-hour charging case.', 179.99, 'https://images.unsplash.com/photo-1610438235354-a6ae5528385c?w=500', 'Electronics', true, NOW(), NOW()),
  ('prod-022', 'Canvas Backpack', 'Vintage-style canvas backpack with leather accents, padded laptop sleeve, and waterproof lining. Multiple compartments with antique brass hardware. 25L capacity.', 79.99, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', 'Accessories', true, NOW(), NOW()),
  ('prod-023', 'Smart Thermostat', 'WiFi-enabled smart thermostat with learning capability, energy-saving mode, and remote control via app. Compatible with Alexa, Google Home, and Apple HomeKit.', 199.99, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500', 'Home & Kitchen', true, NOW(), NOW()),
  ('prod-024', 'Ceramic Plant Pot Set', 'Set of 3 modern ceramic plant pots with drainage holes and bamboo saucers. Minimalist design in white, grey, and terracotta. Sizes: 4", 6", and 8" diameter.', 54.99, 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500', 'Home & Kitchen', false, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Create a cart for the test user
INSERT INTO "Cart" ("id", "userId") VALUES
  ('cart-test-001', 'test-user-id-001')
ON CONFLICT ("userId") DO NOTHING;
