import AssetCard from "./AssetCard";
import type { Asset } from "@/types";

interface AssetGridProps {
  assets: Asset[];
}

export default function AssetGrid({ assets }: AssetGridProps) {
  if (assets.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">No assets found</p>
        <p className="text-gray-500 mt-2">Try adjusting your filters or search</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {assets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </div>
  );
}
