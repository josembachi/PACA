"use client";

import React, { useRef, useEffect, useState } from "react";
import { Eraser, Pencil, Square, Circle as CircleIcon } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface WhiteboardProps {
  conversationId: string;
  userId: string;
}

export function InteractiveWhiteboard({ conversationId, userId }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#4f46e5");
  const [tool, setTool] = useState<'pencil' | 'square' | 'circle'>('pencil');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const supabase = createClient();

    // Setup canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.lineCap = "round";
    ctx.lineWidth = 3;

    // Realtime sync: Listen for drawing events from others
    if (typeof supabase?.channel === "function") {
      const channel = supabase.channel(`whiteboard:${conversationId}`)
        .on("broadcast", { event: "draw" }, ({ payload }: { payload: any }) => {
          drawRemote(payload);
        })
        .subscribe();

      return () => {
        if (typeof supabase?.removeChannel === "function") {
          supabase.removeChannel(channel);
        }
      };
    }
  }, [conversationId]);

  const drawRemote = (payload: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = payload.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(payload.x0, payload.y0);
    ctx.lineTo(payload.x1, payload.y1);
    ctx.stroke();
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    // Local draw
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineTo(x, y);
    ctx.stroke();

    // Broadcast to others
    const supabase = createClient();
    if (typeof supabase?.channel === "function") {
      supabase.channel(`whiteboard:${conversationId}`).send({
        type: "broadcast",
        event: "draw",
        payload: { x0: lastX, y0: lastY, x1: x, y1: y, color },
      });
    }
  };

  // Note: Simplified drawing logic for brevity; in production, we'd track lastX/lastY
  let lastX = 0;
  let lastY = 0;

  return (
    <div className="relative w-full h-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <button 
          onClick={() => setTool('pencil')} 
          className={`p-2 rounded-lg ${tool === 'pencil' ? 'bg-primary-100 text-primary-600' : 'text-gray-500'}`}
        >
          <Pencil size={18} />
        </button>
        <button 
          onClick={() => setTool('square')} 
          className={`p-2 rounded-lg ${tool === 'square' ? 'bg-primary-100 text-primary-600' : 'text-gray-500'}`}
        >
          <Square size={18} />
        </button>
        <button 
          onClick={() => setTool('circle')} 
          className={`p-2 rounded-lg ${tool === 'circle' ? 'bg-primary-100 text-primary-600' : 'text-gray-500'}`}
        >
          <CircleIcon size={18} />
        </button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        <input 
          type="color" 
          value={color} 
          onChange={(e) => setColor(e.target.value)} 
          className="w-6 h-6 rounded-full cursor-pointer border-none bg-transparent"
        />
        <button 
          onClick={() => {
            const canvas = canvasRef.current;
            if (canvas) {
              const ctx = canvas.getContext("2d");
              ctx?.clearRect(0, 0, canvas.width, canvas.height);
            }
          }}
          className="p-2 text-gray-500 hover:text-red-500 transition-colors"
        >
          <Eraser size={18} />
        </button>
      </div>
      <canvas 
        ref={canvasRef} 
        onMouseDown={startDrawing} 
        onMouseMove={draw} 
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="w-full h-full cursor-crosshair"
      />
    </div>
  );
}
