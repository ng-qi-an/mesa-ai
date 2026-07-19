import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/react";
import {CollisionPriority} from '@dnd-kit/abstract';

export function TabList({className, children, group}: {className?: string, children: React.ReactNode, group: string}) {
  const {ref} = useDroppable({
    id: group,
    type: 'column',
    accept: 'tab',
    collisionPriority: CollisionPriority.Low,
  });
  return (
    <div className={cn(`flex items-center border-b w-full overflow-x-auto pb-[1px] scrollbar-none!`, className)} ref={ref}>
      {children}
    </div>
  );
}


