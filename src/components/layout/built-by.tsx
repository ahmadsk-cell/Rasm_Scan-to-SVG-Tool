import Link from "next/link";
import { cn } from "@/lib/utils";
import { RasmMarkSvg } from "@/components/layout/rasm-mark-svg";

const GITHUB_URL = "https://github.com/ahmadsk-cell";

export function BuiltBy({
  className,
  align = "left",
  showLogo = false,
}: {
  className?: string;
  align?: "left" | "center";
  showLogo?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-[11px] text-muted-foreground",
        align === "center" && "justify-center",
        className
      )}
    >
      {showLogo && <RasmMarkSvg size={20} title="" />}
      <p>
        Built by{" "}
        <Link
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground/80 underline-offset-2 transition-colors hover:text-primary hover:underline"
        >
          ASK Andalus
        </Link>
      </p>
    </div>
  );
}
