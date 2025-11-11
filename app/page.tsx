// src/app/page.tsx
import { DitheringShader } from "@/components/ui/dithering-shader";

export default function DemoOne() {
  return (
    // 1. Make the container fill the screen and be the relative parent.
    <div className="relative h-screen w-screen overflow-hidden">
      
      {/* 2. Make the shader the absolute background. 
          We add className to stretch its div,
          and we pass large width/height props for a good canvas resolution.
      */}
      <DitheringShader
        className="absolute inset-0 z-0 h-full w-full"
        width={1920}   // Use a high-res default for the canvas
        height={1080}  // This will be stretched/shrunk by the className
        shape="swirl"
        type="4x4"
        colorBack="#220011"
        colorFront="#00ffff"
        pxSize={4}
        speed={0.9}
      />
      
      {/* 3. The text is already absolute and z-10. 
          We just need to center it in the relative parent.
      */}
      <span className="pointer-events-none z-10 text-center text-7xl leading-none absolute font-semibold text-white tracking-tighter whitespace-pre-wrap 
                       top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        Swirl
      </span>
    </div>
  )
}