import { Mail, MapPin, Sparkles, Shirt, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

const stylePicks = ['Streetwear', 'Traditional', 'Minimal', 'Occasion Wear'];

function UserProfile() {
  return (
    <div className="min-h-screen bg-zinc-50 pb-28 pt-24 text-zinc-900">
      <div className="mx-auto max-w-4xl px-5 pb-10 sm:px-6">
        <section className="overflow-hidden rounded-[32px] bg-white shadow-sm ring-1 ring-zinc-200">
          <div className="h-32 bg-gradient-to-r from-zinc-900 via-zinc-800 to-stone-600" />
          <div className="px-6 pb-8">
            <div className="-mt-14 flex h-28 w-28 items-center justify-center rounded-[28px] border-4 border-white bg-zinc-200 text-3xl font-black text-zinc-700">
              DP
            </div>
            <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight">Dev Parmar</h1>
                <p className="mt-2 max-w-xl text-sm text-zinc-500">
                  Your signed-in space for personal details, style preferences, and wardrobe shortcuts.
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/vendor"
                  className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 hover:border-zinc-300"
                >
                  <Store size={16}/> Vendor Dashboard
                </Link>
                <button
                  type="button"
                  className="rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-zinc-200">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">Details</p>
            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 px-4 py-4">
                <Mail size={18} className="text-zinc-500" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-400">Email</p>
                  <p className="text-sm font-semibold">devparmar@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 px-4 py-4">
                <MapPin size={18} className="text-zinc-500" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-400">Location</p>
                  <p className="text-sm font-semibold">India</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 px-4 py-4">
                <Shirt size={18} className="text-zinc-500" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-400">Wardrobe</p>
                  <p className="text-sm font-semibold">12 saved outfit sessions</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-zinc-200">
            <div className="flex items-center gap-2 text-zinc-500">
              <Sparkles size={18} />
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">Preferences</p>
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-tight">Your style interests</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {stylePicks.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700"
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-6 rounded-3xl bg-zinc-900 p-5 text-white">
              <p className="text-sm font-semibold">Style note</p>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                Explore Home for new clothing drops and open Wardrobe to revisit the looks you already tried on.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default UserProfile;
