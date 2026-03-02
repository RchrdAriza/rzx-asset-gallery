import Link from "next/link";
import AssetGrid from "@/components/gallery/AssetGrid";
import type { Asset } from "@/types";

async function getFeaturedAssets(): Promise<Asset[]> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/assets?featured=true&limit=8`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.assets;
  } catch {
    return [];
  }
}

export default async function Home() {
  const featuredAssets = await getFeaturedAssets();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1)_0%,transparent_70%)]" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="text-white">3D Asset</span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              Gallery
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            A personal collection of original 3D models. Browse, preview in real-time, and download for free.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/gallery"
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-medium transition-colors"
            >
              Explore Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Assets */}
      {featuredAssets.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Featured</h2>
            <Link href="/gallery" className="text-purple-400 hover:text-purple-300 transition-colors">
              View all →
            </Link>
          </div>
          <AssetGrid assets={featuredAssets} />
        </section>
      )}

      {/* Empty state when no assets */}
      {featuredAssets.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="text-gray-500 text-lg">
            No featured assets yet. Upload your first 3D model from the admin panel.
          </p>
        </section>
      )}
    </div>
  );
}
