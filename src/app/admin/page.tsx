"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import type { Asset } from "@/types";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetch("/api/assets?limit=100")
        .then((res) => res.json())
        .then((data) => {
          setAssets(data.assets);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-gray-900 border border-white/10 rounded-xl p-8 max-w-sm w-full">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Admin Login</h1>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const username = (form.elements.namedItem("username") as HTMLInputElement).value;
              const password = (form.elements.namedItem("password") as HTMLInputElement).value;
              await signIn("credentials", { username, password, callbackUrl: "/admin" });
            }}
            className="space-y-4"
          >
            <input
              name="username"
              type="text"
              placeholder="Username"
              className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  const totalDownloads = assets.reduce((sum, a) => sum + a.downloads, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage your 3D assets</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/upload"
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            + Upload Asset
          </Link>
          <button
            onClick={() => signOut()}
            className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Total Assets</p>
          <p className="text-3xl font-bold text-white mt-1">{assets.length}</p>
        </div>
        <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Total Downloads</p>
          <p className="text-3xl font-bold text-white mt-1">{totalDownloads}</p>
        </div>
        <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Featured</p>
          <p className="text-3xl font-bold text-white mt-1">
            {assets.filter((a) => a.featured).length}
          </p>
        </div>
      </div>

      {/* Asset Table */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-800 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Name</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Category</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Format</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Downloads</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Featured</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4 text-white font-medium">{asset.name}</td>
                  <td className="px-6 py-4 text-gray-400">{asset.category.name}</td>
                  <td className="px-6 py-4 text-gray-400 uppercase">{asset.format}</td>
                  <td className="px-6 py-4 text-gray-400">{asset.downloads}</td>
                  <td className="px-6 py-4">
                    {asset.featured && (
                      <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/admin/edit/${asset.id}`}
                        className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={async () => {
                          if (!confirm("Delete this asset?")) return;
                          await fetch(`/api/assets/${asset.id}`, { method: "DELETE" });
                          setAssets(assets.filter((a) => a.id !== asset.id));
                        }}
                        className="px-3 py-1 bg-red-900/50 hover:bg-red-900 text-red-300 text-sm rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {assets.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No assets yet. Upload your first 3D model!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
