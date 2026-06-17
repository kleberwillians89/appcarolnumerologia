import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { premiumClasses } from '@/config/premiumClasses';

export const CustomerPortalSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className={`rounded-lg border p-5 ${premiumClasses.card}`}>
      <Skeleton className="h-4 w-28 bg-white/10" />
      <Skeleton className="mt-3 h-8 w-52 bg-white/10" />
      <Skeleton className="mt-3 h-4 w-full max-w-md bg-white/10" />
      <div className="mt-5 grid grid-cols-3 gap-2">
        <Skeleton className="h-20 bg-white/10" />
        <Skeleton className="h-20 bg-white/10" />
        <Skeleton className="h-20 bg-white/10" />
      </div>
    </div>

    {[0, 1].map((item) => (
      <div key={item} className={`rounded-lg border p-5 ${premiumClasses.cardAlt}`}>
        <Skeleton className="h-5 w-40 bg-white/10" />
        <Skeleton className="mt-3 h-4 w-60 bg-white/10" />
        <Skeleton className="mt-5 h-10 w-full bg-white/10" />
      </div>
    ))}
  </div>
);
