import { cn } from "@/lib/utils";

export function TabList({className, children}: {className?: string, children: React.ReactNode}) {

  return (
    <div className={cn('flex items-center border-b', className)}>
      {children}
    </div>
  );
}


