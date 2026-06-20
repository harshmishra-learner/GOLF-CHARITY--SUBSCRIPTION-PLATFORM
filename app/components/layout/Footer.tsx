import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              GolfCharity
            </span>
            <p className="mt-4 text-sm max-w-md">
              Combining the love of golf with charitable giving. Every subscription
              supports worthy causes while giving you a chance to win exciting prizes
              in our monthly draws.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Platform</h3>
            <ul className="mt-4 space-y-3">
              <li><Link href="/" className="text-sm hover:text-white transition">Home</Link></li>
              <li><Link href="/charities" className="text-sm hover:text-white transition">Charities</Link></li>
              <li><Link href="/draw-results" className="text-sm hover:text-white transition">Draw Results</Link></li>
              <li><Link href="/signup" className="text-sm hover:text-white transition">Subscribe</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Legal</h3>
            <ul className="mt-4 space-y-3">
              <li><span className="text-sm cursor-pointer hover:text-white transition">Privacy Policy</span></li>
              <li><span className="text-sm cursor-pointer hover:text-white transition">Terms of Service</span></li>
              <li><span className="text-sm cursor-pointer hover:text-white transition">Refund Policy</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Golf Charity Platform. Made with ❤️ by Harsh Mishra for charity. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
