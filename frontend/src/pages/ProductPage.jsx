import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, ShieldCheck, ShoppingBag, Sparkles, Truck } from 'lucide-react';
import { useShop } from '../context/ShopContext';

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { productMap, addToCart } = useShop();
  const product = productMap[id];
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] ?? null);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return Object.values(productMap)
      .filter((item) => item.id !== product.id && item.category === product.category)
      .slice(0, 3);
  }, [product, productMap]);

  if (!product) {
    return (
      <div className="min-h-screen bg-zinc-50 px-6 pb-24 pt-28 text-zinc-900">
        <div className="mx-auto max-w-3xl rounded-[28px] bg-white p-8 text-center shadow-sm ring-1 ring-zinc-200">
          <h1 className="text-3xl font-black tracking-tight">Product not found</h1>
          <Link to="/home" className="mt-6 inline-flex rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => addToCart(product.id, selectedSize);
  const handleBuyNow = () => {
    addToCart(product.id, selectedSize);
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-5 pb-28 pt-24 text-zinc-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center gap-3 text-sm text-zinc-500">
          <Link to="/home" className="inline-flex items-center gap-2 text-zinc-500 transition-colors hover:text-zinc-900">
            <ArrowLeft size={16} />
            Back
          </Link>
          <span>/</span>
          <span>{product.category}</span>
        </div>

        <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[34px] bg-white p-4 shadow-sm ring-1 ring-zinc-200">
            <div className="overflow-hidden rounded-[28px] bg-zinc-100">
              <img src={product.img} alt={product.name} className="h-[36rem] w-full object-cover" />
            </div>
          </div>

          <div className="rounded-[34px] bg-white p-6 shadow-sm ring-1 ring-zinc-200 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                {product.badge}
              </span>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                {product.category}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black tracking-tight">{product.name}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">{product.longDescription}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black tracking-tight">{product.price}</div>
                <div className="mt-1 text-sm text-zinc-400">Inclusive of taxes</div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-zinc-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Fabric</p>
                <p className="mt-2 text-sm font-semibold">{product.fabric}</p>
              </div>
              <div className="rounded-3xl bg-zinc-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Color</p>
                <p className="mt-2 text-sm font-semibold">{product.color}</p>
              </div>
              <div className="rounded-3xl bg-zinc-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Fit</p>
                <p className="mt-2 text-sm font-semibold">{product.fit}</p>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Select Size</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                      selectedSize === size
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleAddToCart}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
              >
                <ShoppingBag size={18} />
                Add to Cart
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-6 py-3.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-50"
              >
                Buy Now
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-3.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                <Heart size={18} />
                Wishlist
              </button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] bg-zinc-50 p-5">
                <div className="flex items-center gap-2 text-zinc-900">
                  <Truck size={18} />
                  <p className="text-sm font-semibold">Shipping</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-500">{product.shipping}</p>
              </div>
              <div className="rounded-[28px] bg-zinc-50 p-5">
                <div className="flex items-center gap-2 text-zinc-900">
                  <ShieldCheck size={18} />
                  <p className="text-sm font-semibold">Assurance</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-500">Easy exchange and quality-checked finishing on every piece.</p>
              </div>
            </div>

            <div className="mt-8 rounded-[28px] bg-zinc-950 p-6 text-white">
              <div className="flex items-center gap-2 text-zinc-200">
                <Sparkles size={18} />
                <p className="text-sm font-semibold">What stands out</p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {product.details.map((detail) => (
                  <div key={detail} className="rounded-2xl bg-white/5 p-4 text-sm text-zinc-300">
                    {detail}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="mt-10 rounded-[34px] bg-white p-6 shadow-sm ring-1 ring-zinc-200">
            <h2 className="text-2xl font-black tracking-tight">More in {product.category}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {relatedProducts.map((item) => (
                <Link key={item.id} to={`/product/${item.id}`} className="rounded-[28px] bg-zinc-50 p-4 transition-transform hover:-translate-y-1">
                  <div className="overflow-hidden rounded-[22px] bg-zinc-100">
                    <img src={item.img} alt={item.name} className="h-64 w-full object-cover" />
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">{item.badge}</p>
                    <h3 className="mt-2 text-lg font-black tracking-tight">{item.name}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{item.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default ProductPage;
