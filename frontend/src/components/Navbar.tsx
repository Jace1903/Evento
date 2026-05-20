export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
              Evento
            </span>
          </a>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-violet-600 transition-colors">Discover</a>
            <a href="#" className="hover:text-violet-600 transition-colors">For You</a>
            <a href="#" className="hover:text-violet-600 transition-colors">Calendar</a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="hidden sm:block text-sm font-medium text-slate-600 hover:text-violet-600 transition-colors">
            Sign in
          </button>
          <button className="text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-full transition-colors">
            Get started
          </button>
        </div>
      </div>
    </nav>
  );
}
