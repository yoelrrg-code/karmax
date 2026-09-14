import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-white/95 backdrop-blur-md">
      <LoadingSpinner size={150} showText={true} />
    </div>
  );
}
