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
    const key = layer.group ?? "Layers";
    acc[key] = acc[key] ? [...acc[key], layer] : [layer];
    return acc;
  }, {});

  return (
    <aside className="flex h-64 w-full shrink-0 flex-col border-t border-border bg-card lg:h-auto lg:w-72 lg:border-l lg:border-t-0">
      <div className="flex h-11 items-center justify-between border-b border-border px-4">
        <p className="panel-label">Layers</p>
        <span className="text-[11px] text-muted-foreground">{layers.length}</span>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        {layers.length === 0 ? (
          <p className="px-4 py-8 text-center text-xs text-muted-foreground">No paths yet.</p>
        ) : (
          <div>
            {Object.entries(groups).map(([group, groupLayers]) => (
              <div key={group}>
                <p className="px-3 pb-1 pt-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {group}
                </p>
                <ul>
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
                          "flex h-8 cursor-pointer items-center gap-2 px-2",
                          selectedLayerId === layer.id
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                          !layer.visible && "opacity-45"
                        )}
                      >
                        <span
                          className="h-3.5 w-3.5 shrink-0 border border-black/30"
                          style={{ backgroundColor: layer.color }}
                        />
                        <Input
                          value={layer.name}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateLayer(layer.id, { name: e.target.value })}
                          className="h-6 border-transparent bg-transparent px-1 text-xs shadow-none focus-visible:border-border focus-visible:bg-background"
                          disabled={layer.locked}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 shrink-0"
                          aria-label={layer.visible ? "Hide layer" : "Show layer"}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateLayer(layer.id, { visible: !layer.visible });
                          }}
                        >
                          {layer.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 shrink-0"
                          aria-label={layer.locked ? "Unlock layer" : "Lock layer"}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateLayer(layer.id, { locked: !layer.locked });
                          }}
                        >
                          {layer.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
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
    </aside>
  );
}
