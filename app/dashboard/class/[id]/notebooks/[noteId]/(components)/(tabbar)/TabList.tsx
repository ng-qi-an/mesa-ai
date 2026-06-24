import { cn } from "@/lib/utils";

export function TabList({className, children}: {className?: string, children: React.ReactNode}) {

  return (
    <div className={cn('flex items-center border-b w-full overflow-x-auto pb-[1px] scrollbar-none!', className)}>
      {children}
    </div>
  );
}


