"use client";

import { Eye, EyeOff, Lock, Unlock } from "lucide-react";
import { useStudioStore } from "@/store/studio-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LayerPanel() {
  const { layers, selectedLayerId, setSelectedLayerId, updateLayer } = useStudioStore();

  const groups = layers.reduce<Record<string, typeof layers>>((acc, layer) => {
    const key = layer.group ?? "Ungrouped";
    acc[key] = acc[key] ? [...acc[key], layer] : [layer];
    return acc;
  }, {});

  return (
    <div className="glass-panel flex h-full flex-col rounded-2xl">
      <div className="border-b border-border px-4 py-3">
        <h3 className="font-display text-sm font-semibold">Layers</h3>
        <p className="text-xs text-muted-foreground">{layers.length} paths</p>
      </div>

      <ScrollArea className="flex-1 px-2 py-2">
        {layers.length === 0 ? (
          <p className="px-2 py-8 text-center text-xs text-muted-foreground">
            Layers appear after processing.
          </p>
        ) : (
          <div className="space-y-3">
            {Object.entries(groups).map(([group, groupLayers]) => (
              <div key={group}>
                <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group}
                </p>
                <ul className="space-y-1">
                  {groupLayers.map((layer) => (
                    <li key={layer.id}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedLayerId(layer.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedLayerId(layer.id);
                          }
                        }}
                        className={cn(
                          "flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors",
                          selectedLayerId === layer.id
                            ? "bg-primary/10 ring-1 ring-primary/25"
                            : "hover:bg-muted/70"
                        )}
                      >
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: layer.color }}
                        />
                        <Input
                          value={layer.name}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateLayer(layer.id, { name: e.target.value })}
                          className="h-7 border-transparent bg-transparent px-1 text-xs shadow-none focus-visible:border-border focus-visible:bg-background"
                          disabled={layer.locked}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 shrink-0"
                          aria-label={layer.visible ? "Hide layer" : "Show layer"}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateLayer(layer.id, { visible: !layer.visible });
                          }}
                        >
                          {layer.visible ? (
                            <Eye className="h-3.5 w-3.5" />
                          ) : (
                            <EyeOff className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 shrink-0"
                          aria-label={layer.locked ? "Unlock layer" : "Lock layer"}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateLayer(layer.id, { locked: !layer.locked });
                          }}
                        >
                          {layer.locked ? (
                            <Lock className="h-3.5 w-3.5" />
                          ) : (
                            <Unlock className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
