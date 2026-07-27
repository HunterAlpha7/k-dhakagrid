"use client";
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-900 animate-pulse rounded-lg border border-slate-800" />,
});

export default function DynamicMap(props: any) {
  return <Map {...props} />;
}
