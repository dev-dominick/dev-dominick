import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/lib/ui';

export default function NonnaRosaDemo() {
  return (
    <div className="min-h-screen bg-amber-50">
      {/* Navigation */}
      <nav className="bg-red-800 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-serif">🍝</div>
              <div>
                <h1 className="text-2xl font-bold font-serif">Nonna Rosa</h1>
                <p className="text-xs text-red-200">Authentic Italian Cuisine</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#menu" className="hover:text-amber-200 transition-colors">Menu</a>
              <a href="#about" className="hover:text-amber-200 transition-colors">About</a>
              <a href="#delivery" className="hover:text-amber-200 transition-colors">Delivery</a>
              <a href="#contact" className="hover:text-amber-200 transition-colors">Contact</a>
              <Button className="bg-amber-500 hover:bg-amber-600 text-red-900 font-semibold">
                Order Online
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[500px] bg-linear-to-b from-red-900 to-red-800">
        <div className="absolute inset-0 bg-[url('/pasta-pattern.png')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h2 className="text-5xl font-bold font-serif mb-4">
              Taste the Tradition of Italy
            </h2>
            <p className="text-xl mb-6 text-red-100">
              Family recipes passed down through generations, now delivered to your door
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-red-900 font-semibold">
                View Menu
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-red-900">
                Book a Table
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Delivery Banner */}
      <section id="delivery" className="bg-amber-100 border-y-4 border-amber-300 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-red-900 mb-4">🚗 We Now Deliver Up to 10 Miles!</h3>
          <p className="text-lg text-gray-700 mb-4">
            Limerick • Schwenksville • Skippack • Lansdale • Spring House • Whitemarsh<br/>
            Conshohocken • Ardmore • Wayne • Malvern • Kimberton • Royersford
          </p>
          <p className="text-sm text-gray-600">
            Place your order online and receive real-time updates! Discounts available on our website.
          </p>
        </div>
      </section>

      {/* Menu Highlights */}
      <section id="menu" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-4xl font-bold text-center text-red-900 mb-12 font-serif">
            Featured Dishes
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Pasta */}
            <div className="bg-amber-50 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-48 bg-red-200 flex items-center justify-center">
                <span className="text-6xl">🍝</span>
              </div>
              <div className="p-6">
                <h4 className="text-2xl font-bold text-red-900 mb-2">Fresh Pasta</h4>
                <p className="text-gray-700 mb-4">
                  Handmade daily with traditional techniques. Choose from fettuccine, pappardelle, or ravioli.
                </p>
                <p className="text-xl font-bold text-amber-700">From $16.99</p>
              </div>
            </div>

            {/* Pizza */}
            <div className="bg-amber-50 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-48 bg-red-200 flex items-center justify-center">
                <span className="text-6xl">🍕</span>
              </div>
              <div className="p-6">
                <h4 className="text-2xl font-bold text-red-900 mb-2">Wood-Fired Pizza</h4>
                <p className="text-gray-700 mb-4">
                  Authentic Neapolitan-style pizza with imported mozzarella and San Marzano tomatoes.
                </p>
                <p className="text-xl font-bold text-amber-700">From $14.99</p>
              </div>
            </div>

            {/* Entrees */}
            <div className="bg-amber-50 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-48 bg-red-200 flex items-center justify-center">
                <span className="text-6xl">🥘</span>
              </div>
              <div className="p-6">
                <h4 className="text-2xl font-bold text-red-900 mb-2">Classic Entrees</h4>
                <p className="text-gray-700 mb-4">
                  Chicken Parmigiana, Veal Marsala, Eggplant Rollatini, and more Italian favorites.
                </p>
                <p className="text-xl font-bold text-amber-700">From $18.99</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-red-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-4xl font-bold mb-6 font-serif">Our Story</h3>
              <p className="text-lg mb-4 text-red-100">
                Nonna Rosa brings the warmth and flavors of traditional Italian cooking to your table. 
                Our recipes have been passed down through three generations, each dish prepared with 
                love and the finest ingredients.
              </p>
              <p className="text-lg text-red-100">
                From our family to yours, we invite you to experience authentic Italian hospitality 
                and cuisine that tastes like home.
              </p>
            </div>
            <div className="bg-red-800 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">👵</div>
              <p className="text-2xl font-serif mb-2">Nonna's Promise</p>
              <p className="text-red-200">
                "Every dish made with the same love I put into feeding my own family"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact/Hours */}
      <section id="contact" className="py-16 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-3xl font-bold text-red-900 mb-6">Visit Us</h3>
              <div className="space-y-4 text-gray-700">
                <div>
                  <p className="font-semibold text-red-900">Address</p>
                  <p>123 Main Street<br/>Collegeville, PA 19426</p>
                </div>
                <div>
                  <p className="font-semibold text-red-900">Phone</p>
                  <p>(610) 555-ROSA</p>
                </div>
                <div>
                  <p className="font-semibold text-red-900">Email</p>
                  <p>info@nonnarosarestaurant.com</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-red-900 mb-6">Hours</h3>
              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span className="font-semibold">Monday - Thursday</span>
                  <span>11:00 AM - 9:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Friday - Saturday</span>
                  <span>11:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Sunday</span>
                  <span>12:00 PM - 8:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-red-950 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-red-200">© 2026 Nonna Rosa Restaurant. All rights reserved.</p>
          <p className="text-sm text-red-300 mt-2">
            Built with ❤️ by{' '}
            <Link href="/" className="text-amber-400 hover:text-amber-300">
              Your Name
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
