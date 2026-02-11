import { LucideIcon } from "lucide-react";

function SidebarHeader({
  title,
  icon: Icon,
}: {
  title: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex-none border-b px-4 py-3">
      <div className="flex items-center gap-2 font-medium text-sm">
        <Icon className="h-4 w-4" />
        <span>{title}</span>
      </div>
    </div>
  );
}

export default SidebarHeader;
