import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';

function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

function CartPage() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, subtotal, shipping, total } = useShop();

  return (
    <div className="min-h-screen bg-zinc-50 px-5 pb-28 pt-24 text-zinc-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight">Cart</h1>
          <p className="mt-2 text-sm text-zinc-500">Review your outfits before checkout.</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="rounded-[32px] bg-white p-10 text-center shadow-sm ring-1 ring-zinc-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
              <ShoppingBag size={28} className="text-zinc-500" />
            </div>
            <h2 className="mt-5 text-2xl font-black tracking-tight">Your cart is empty</h2>
            <p className="mt-2 text-sm text-zinc-500">Add a few pieces from the home feed and they will appear here.</p>
            <Link to="/home" className="mt-6 inline-flex rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-4">
              {cartItems.map((item) => (
                <article key={`${item.productId}-${item.size ?? 'default'}`} className="rounded-[30px] bg-white p-5 shadow-sm ring-1 ring-zinc-200">
                  <div className="flex gap-4">
                    <div className="h-32 w-24 shrink-0 overflow-hidden rounded-[20px] bg-zinc-100">
                      <img src={item.product.img} alt={item.product.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col gap-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">{item.product.category}</p>
                          <h2 className="mt-1 text-xl font-black tracking-tight">{item.product.name}</h2>
                          <p className="mt-1 text-sm text-zinc-500">Size: {item.size || 'Default'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId, item.size)}
                          className="rounded-full bg-zinc-100 p-2 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-4">
                        <div className="inline-flex items-center gap-3 rounded-full bg-zinc-100 px-3 py-2">
                          <button type="button" onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}>
                            <Minus size={16} />
                          </button>
                          <span className="min-w-[1.5rem] text-center text-sm font-semibold">{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}>
                            <Plus size={16} />
                          </button>
                        </div>
                        <div className="text-lg font-black tracking-tight">{formatPrice(item.lineTotal)}</div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-zinc-200">
              <h2 className="text-2xl font-black tracking-tight">Order Summary</h2>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Shipping</span>
                  <span className="font-semibold">{formatPrice(shipping)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-200 pt-4 text-base">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-black tracking-tight">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="mt-6 w-full rounded-full bg-zinc-900 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
              >
                Proceed to Checkout
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;
