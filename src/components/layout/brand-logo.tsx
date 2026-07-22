import { cn } from "@/lib/utils";
import { RasmMarkSvg } from "@/components/layout/rasm-mark-svg";

type BrandLogoProps = {
  className?: string;
  size?: number;
  withWordmark?: boolean;
  wordmarkClassName?: string;
};

export function BrandLogo({
  className,
  size = 48,
  withWordmark = false,
  wordmarkClassName,
}: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <RasmMarkSvg size={size} />
      {withWordmark && (
        <div className={cn("leading-tight", wordmarkClassName)}>
          <p className="font-display text-base font-semibold tracking-tight">Rasm</p>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Vector Studio
          </p>
        </div>
      )}
    </div>
  );
}
