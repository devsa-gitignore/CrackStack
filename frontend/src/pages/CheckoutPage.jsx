import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';

function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, subtotal, shipping, total, clearCart } = useShop();
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handlePlaceOrder = async () => {
    try {
      // Notify vendors for each item in the cart
      for (const item of cartItems) {
        await fetch('http://localhost:5000/api/buyer/buy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.productId,
            vendorId: item.product.vendorId || '65f1a2b3c4d5e6f7a8b9c0d1', // fallback to demo
            buyerDetails: {
              name: 'Dev Parmar',
              email: 'devparmar@gmail.com',
              address: '221B Fashion Street, Ahmedabad'
            }
          })
        });
      }
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      alert('Order processing failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-5 pb-28 pt-24 text-zinc-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-black tracking-tight">Checkout</h1>
        <p className="mt-2 text-sm text-zinc-500">Hardcoded checkout flow for now, with a complete order summary.</p>

        {orderPlaced ? (
          <div className="mt-8 rounded-[32px] bg-white p-10 text-center shadow-sm ring-1 ring-zinc-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 size={30} className="text-emerald-600" />
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-tight">Order placed successfully</h2>
            <p className="mt-3 text-sm text-zinc-500">Your checkout is hardcoded, but the flow is complete and your cart has been cleared.</p>
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="mt-6 rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <section className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-zinc-200">
              <h2 className="text-2xl font-black tracking-tight">Delivery Details</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <input className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none" defaultValue="Dev" />
                <input className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none" defaultValue="Parmar" />
                <input className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none sm:col-span-2" defaultValue="devparmar@gmail.com" />
                <input className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none sm:col-span-2" defaultValue="221B Fashion Street, Ahmedabad" />
                <input className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none" defaultValue="Ahmedabad" />
                <input className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none" defaultValue="380015" />
              </div>

              <h2 className="mt-8 text-2xl font-black tracking-tight">Payment</h2>
              <div className="mt-4 rounded-[26px] bg-zinc-50 p-5">
                <p className="text-sm font-semibold">Hardcoded payment method</p>
                <p className="mt-2 text-sm text-zinc-500">Visa ending in 4242</p>
              </div>
            </section>

            <aside className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-zinc-200">
              <h2 className="text-2xl font-black tracking-tight">Your Order</h2>
              <div className="mt-5 space-y-4">
                {cartItems.map((item) => (
                  <div key={`${item.productId}-${item.size ?? 'default'}`} className="flex items-center gap-3">
                    <div className="h-16 w-14 overflow-hidden rounded-2xl bg-zinc-100">
                      <img src={item.product.img} alt={item.product.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{item.product.name}</p>
                      <p className="text-xs text-zinc-500">Qty {item.quantity} / Size {item.size || 'Default'}</p>
                    </div>
                    <p className="text-sm font-semibold">{formatPrice(item.lineTotal)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-4 border-t border-zinc-200 pt-5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Shipping</span>
                  <span className="font-semibold">{formatPrice(shipping)}</span>
                </div>
                <div className="flex items-center justify-between text-base">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-black tracking-tight">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={cartItems.length === 0}
                className="mt-6 w-full rounded-full bg-zinc-900 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                Place Order
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckoutPage;
