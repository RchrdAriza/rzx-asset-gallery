export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} RZX. All 3D assets are original creations.
          </p>
          <div className="flex items-center gap-4 text-gray-400 text-sm">
            <span>Built with passion for 3D art</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
