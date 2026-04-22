export default function EpicCardSkeleton() {

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 animate-pulse">
   
         <div className="flex justify-between">
      <div className="h-4 bg-[#E8EDFF] rounded w-1/4 mb-3" />
        <div className="w-8 h-8 rounded-xl bg-[#E8EDFF] shrink-0 mb-4" />
        </div>

      <div className="h-4 bg-[#E8EDFF] rounded w-full mb-4" />

      
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-[#E8EDFF] shrink-0" />
        <div className="h-3 bg-[#E8EDFF] rounded w-2/5" />
      </div>

     
      <div className="h-2 bg-[#E8EDFF] rounded w-full mb-4" />

      
      <div className="flex justify-between">
        <div className="h-3 bg-[#E8EDFF] rounded w-1/4" />
        <div className="h-3 bg-[#E8EDFF] rounded w-1/5" />
      </div>
    </div>
  );
}