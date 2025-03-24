export default function Header() {
  return (
    <header>
      <div className="bg-black/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center">
              <img 
                src="/images/dunnenergy.jpg" 
                alt="Dunn Energy" 
                className="h-8 md:h-10 object-contain"
                priority="true"
              />
            </div>
            <nav className="flex space-x-8 text-sm text-gray-300">
              <a href="/" className="hover:text-green-400 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Calculator
              </a>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
} 