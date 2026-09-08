import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin, ShieldCheck, Truck, Clock } from "lucide-react";

export function ShopFooter() {
  return (
    <footer
      id="shop-footer"
      className="bg-[#0a2540] text-slate-300 mt-16 border-t border-slate-800"
    >
      {/* Guarantees / Value props */}
      <div className="border-b border-slate-800/80 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[#00bcd4] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Certified Water Quality</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                FDA Ghana &amp; GSA certified standards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[#00bcd4] shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Accra &amp; Tema Delivery</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Scheduled refills &amp; engineering site visits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[#00bcd4] shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Professional Engineers</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Borehole &amp; RO turnkey commissioning
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-cyan-500 flex items-center justify-center text-[#0a2540] font-black text-sm">
              TV
            </div>
            <span className="font-extrabold text-lg text-white tracking-tight">TOVILA</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tovila Water Solutions is a premier water engineering and treatment firm in Ghana,
            providing commercial and residential water solutions, dispenser refills, and
            professional borehole drilling.
          </p>
          <div className="pt-2">
            <span className="inline-block text-[11px] bg-slate-800 text-cyan-300 font-mono px-2.5 py-1 rounded border border-slate-700">
              Secure Payments via Paystack GHS
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
            Shop Catalog
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link
                to="/shop/$categorySlug"
                params={{ categorySlug: "dispenser-drinking-water" }}
                className="hover:text-cyan-300 transition"
              >
                Dispenser Drinking Water Supply
              </Link>
            </li>
            <li>
              <Link
                to="/shop/$categorySlug"
                params={{ categorySlug: "water-treatment" }}
                className="hover:text-cyan-300 transition"
              >
                Water Treatment Products &amp; Services
              </Link>
            </li>
            <li>
              <Link
                to="/shop/$categorySlug"
                params={{ categorySlug: "borehole-drilling" }}
                className="hover:text-cyan-300 transition"
              >
                Borehole Drilling Services
              </Link>
            </li>
            <li>
              <Link to="/shop/cart" className="hover:text-cyan-300 transition">
                Shopping Cart &amp; Booking
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
            Client Assurance
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>• Transparent deposit amounts for engineering jobs</li>
            <li>• Guaranteed water laboratory testing reports</li>
            <li>• 100% genuine replacement filter elements</li>
            <li>• On-site survey before deep aquifer drilling</li>
            <li>
              <a href="/index.html" className="text-cyan-400 hover:underline">
                Visit corporate portfolio &amp; case studies &rarr;
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
            Contact &amp; Support
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>East Legon / Spintex Corridor, Accra, Ghana</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
              <a href="tel:+233208123456" className="hover:text-white transition">
                +233 (0) 20 812 3456
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
              <a href="mailto:shop@tovila.com" className="hover:text-white transition">
                shop@tovila.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800/80 py-4 px-4 sm:px-6 text-center text-xs text-slate-500">
        <p>
          &copy; {new Date().getFullYear()} Tovila Water Solutions. All Rights Reserved. Catalog
          items and prices are demo placeholders pending client confirmation.
        </p>
      </div>
    </footer>
  );
}
