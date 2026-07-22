declare module "imagetracerjs" {
  interface ImageTracerColor {
    r: number;
    g: number;
    b: number;
    a: number;
  }

  interface ImageTracerOptions {
    ltres?: number;
    qtres?: number;
    pathomit?: number;
    rightangleenhance?: boolean;
    colorsampling?: number;
    numberofcolors?: number;
    mincolorratio?: number;
    colorquantcycles?: number;
    layering?: number;
    strokewidth?: number;
    linefilter?: boolean;
    scale?: number;
    roundcoords?: number;
    viewbox?: boolean;
    desc?: boolean;
    blurradius?: number;
    blurdelta?: number;
    corsenabled?: boolean;
  }

  interface ImageTracerPath {
    segments: Array<{
      type: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      x3?: number;
      y3?: number;
    }>;
    isholepath?: boolean;
    holechildren: number[];
  }

  interface ImageTracerData {
    layers: ImageTracerPath[][];
    palette: ImageTracerColor[];
    width: number;
    height: number;
  }

  interface ImageTracerInstance {
    imagedataToTracedata(
      imgd: ImageData,
      options?: ImageTracerOptions | string
    ): ImageTracerData;
    getsvgstring(
      tracedata: ImageTracerData,
      options?: ImageTracerOptions | string
    ): string;
    checkoptions(options?: ImageTracerOptions | string): ImageTracerOptions;
    optionpresets: Record<string, ImageTracerOptions>;
  }

  const ImageTracer: ImageTracerInstance;
  export default ImageTracer;
}
