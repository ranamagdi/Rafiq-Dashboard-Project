
export default function ProjectCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 animate-pulse">
     
      <div className="w-full h-40 rounded-sm bg-[#E8EDFF] mb-4" />

    
      <div className="space-y-2">
        <div className="h-6 bg-[#E8EDFF] rounded-xs w-3/4" />
        <div className="h-3 bg-[#E8EDFF] rounded-xs w-1/2" />
      </div>
    </div>
  );
}