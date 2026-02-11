import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import prisma from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  inStock: boolean;
}

interface HomeProps {
  products: Product[];
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
  categories: string[];
  selectedCategory: string;
}

const PRODUCTS_PER_PAGE = 12;

export default function Home({
  products,
  totalProducts,
  currentPage,
  totalPages,
  searchQuery,
  categories,
  selectedCategory,
}: HomeProps) {
  const router = useRouter();

  const buildUrl = (params: Record<string, string | number>) => {
    const query = new URLSearchParams();
    if (params.q || searchQuery) query.set('q', String(params.q ?? searchQuery));
    if (params.category || selectedCategory) query.set('category', String(params.category ?? selectedCategory));
    if (params.page) query.set('page', String(params.page));

    // Remove empty params
    if (query.get('q') === '') query.delete('q');
    if (query.get('category') === '' || query.get('category') === 'All') query.delete('category');
    if (query.get('page') === '1') query.delete('page');

    const qs = query.toString();
    return qs ? `/?${qs}` : '/';
  };

  return (
    <>
      <Head>
        <title>ShopNova - Premium E-Commerce Store</title>
        <meta name="description" content="Discover premium products at ShopNova. Browse our curated collection of electronics, furniture, accessories, and more." />
      </Head>

      {/* Hero Section */}
      <section className="page-hero">
        <h1>
          {searchQuery
            ? `Results for "${searchQuery}"`
            : 'Discover Premium Products'}
        </h1>
        <p>
          {searchQuery
            ? `Found ${totalProducts} product${totalProducts !== 1 ? 's' : ''}`
            : 'Curated collection of the finest products for your lifestyle'}
        </p>
      </section>

      {/* Category Filters */}
      <div className="category-filters">
        <Link
          href={buildUrl({ category: 'All', page: 1 })}
          className={`category-chip ${!selectedCategory || selectedCategory === 'All' ? 'active' : ''}`}
        >
          All Products
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat}
            href={buildUrl({ category: cat, page: 1 })}
            className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Product Grid */}
      {products.length > 0 ? (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="cart-empty">
          <div className="cart-empty-icon">🔍</div>
          <h2>No products found</h2>
          <p>Try adjusting your search or filter criteria</p>
          <Link href="/" className="cart-empty-btn">
            View All Products
          </Link>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <Link
            href={buildUrl({ page: currentPage - 1 })}
            className={`pagination-btn ${currentPage <= 1 ? 'disabled' : ''}`}
            aria-disabled={currentPage <= 1}
            onClick={(e) => currentPage <= 1 && e.preventDefault()}
            data-testid="pagination-prev"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Previous
          </Link>

          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>

          <Link
            href={buildUrl({ page: currentPage + 1 })}
            className={`pagination-btn ${currentPage >= totalPages ? 'disabled' : ''}`}
            aria-disabled={currentPage >= totalPages}
            onClick={(e) => currentPage >= totalPages && e.preventDefault()}
            data-testid="pagination-next"
          >
            Next
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { q = '', page = '1', category = '' } = context.query;
  const searchQuery = Array.isArray(q) ? q[0] : q;
  const selectedCategory = Array.isArray(category) ? category[0] : category;
  const currentPage = Math.max(1, parseInt(Array.isArray(page) ? page[0] : page, 10) || 1);

  try {
    // Build where clause
    const where: any = {};

    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    if (selectedCategory && selectedCategory !== 'All') {
      where.category = selectedCategory;
    }

    // Get total count for pagination
    const totalProducts = await prisma.product.count({ where });
    const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));

    // Fetch products with pagination
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (currentPage - 1) * PRODUCTS_PER_PAGE,
      take: PRODUCTS_PER_PAGE,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        category: true,
        inStock: true,
      },
    });

    // Get unique categories for filter chips
    const allCategories = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    const categories = allCategories.map((c) => c.category);

    return {
      props: {
        products: JSON.parse(JSON.stringify(products)),
        totalProducts,
        currentPage,
        totalPages,
        searchQuery,
        categories,
        selectedCategory,
      },
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      props: {
        products: [],
        totalProducts: 0,
        currentPage: 1,
        totalPages: 1,
        searchQuery: '',
        categories: [],
        selectedCategory: '',
      },
    };
  }
};
