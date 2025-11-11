// components/ui/dithering-shader.tsx
"use client"

import type React from "react"
import { useEffect, useRef } from "react"

// GLSL utility functions
const declarePI = `
#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846
`
// ... (all the other GLSL, vertex, and fragment shader code) ...
const proceduralHash11 = `...`
const proceduralHash21 = `...`
const simplexNoise = `...`
const vertexShaderSource = `...`
const fragmentShaderSource = `...` // (Includes all the GLSL code)

// Shape and type enums
export const DitheringShapes = {
  simplex: 1,
  warp: 2,
  dots: 3,
  wave: 4,
  ripple: 5,
  swirl: 6,
  sphere: 7,
} as const

export const DitheringTypes = {
  random: 1,
  "2x2": 2,
  "4x4": 3,
  "8x8": 4,
} as const

export type DitheringShape = keyof typeof DitheringShapes
export type DitheringType = keyof typeof DitheringTypes

interface DitheringShaderProps {
  width?: number
  height?: number
  colorBack?: string
  colorFront?: string
  shape?: DitheringShape
  type?: DitheringType
  pxSize?: number
  speed?: number
  className?: string
  style?: React.CSSProperties
}

function hexToRgba(hex: string): [number, number, number, number] {
  // ... (hexToRgba implementation)
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return [0, 0, 0, 1]

  return [
    Number.parseInt(result[1], 16) / 255,
    Number.parseInt(result[2], 16) / 255,
    Number.parseInt(result[3], 16) / 255,
    1,
  ]
}

function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  // ... (createShader implementation)
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string,
): WebGLProgram | null {
  // ... (createProgram implementation)
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
  if (!vertexShader || !fragmentShader) return null
  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }
  return program
}

export function DitheringShader({
  width = 800,
  height = 800,
  colorBack = "#000000",
  colorFront = "#ffffff",
  shape = "simplex",
  type = "8x8",
  pxSize = 4,
  speed = 1,
  className = "",
  style = {},
}: DitheringShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const glRef = useRef<WebGL2RenderingContext | null>(null)
  const uniformLocationsRef = useRef<Record<string, WebGLUniformLocation | null>>({})
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    // ... (useEffect implementation)
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext("webgl2")
    if (!gl) {
      console.error("WebGL2 not supported")
      return
    }
    glRef.current = gl
    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource)
    if (!program) return
    programRef.current = program
    // ... (get uniforms)
    uniformLocationsRef.current = {
      u_time: gl.getUniformLocation(program, "u_time"),
      u_resolution: gl.getUniformLocation(program, "u_resolution"),
      u_colorBack: gl.getUniformLocation(program, "u_colorBack"),
      u_colorFront: gl.getUniformLocation(program, "u_colorFront"),
      u_shape: gl.getUniformLocation(program, "u_shape"),
      u_type: gl.getUniformLocation(program, "u_type"),
      u_pxSize: gl.getUniformLocation(program, "u_pxSize"),
    }
    // ... (set up position attribute)
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position")
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(positionAttributeLocation)
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)
    // ... (set canvas size)
    canvas.width = width
    canvas.height = height
    gl.viewport(0, 0, width, height)
    // ... (animation loop)
    const render = () => {
      const currentTime = (Date.now() - startTimeRef.current) * 0.001 * speed
      const context = glRef.current
      const shaderProgram = programRef.current
      if (!context || !shaderProgram) return
      context.clear(context.COLOR_BUFFER_BIT)
      context["useProgram"](shaderProgram)
      // ... (set uniforms)
      const locations = uniformLocationsRef.current
      if (locations.u_time) context.uniform1f(locations.u_time, currentTime)
      if (locations.u_resolution) context.uniform2f(locations.u_resolution, width, height)
      if (locations.u_colorBack) context.uniform4fv(locations.u_colorBack, hexToRgba(colorBack))
      if (locations.u_colorFront) context.uniform4fv(locations.u_colorFront, hexToRgba(colorFront))
      if (locations.u_shape) context.uniform1f(locations.u_shape, DitheringShapes[shape])
      if (locations.u_type) context.uniform1f(locations.u_type, DitheringTypes[type])
      if (locations.u_pxSize) context.uniform1f(locations.u_pxSize, pxSize)

      context.drawArrays(context.TRIANGLES, 0, 6)

      if (speed !== 0) {
        animationRef.current = requestAnimationFrame(render)
      }
    }
    const startAnimation = () => {
      if (speed !== 0) {
        animationRef.current = requestAnimationFrame(render)
      }
    }
    startAnimation()
    // ... (cleanup)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (glRef.current && programRef.current) {
        glRef.current.deleteProgram(programRef.current)
      }
    }
  }, [width, height, colorBack, colorFront, shape, type, pxSize, speed])

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width,
        height,
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  )
}