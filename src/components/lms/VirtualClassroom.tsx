"use client";

import React, { useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Layout, Maximize } from "lucide-react";
import { InteractiveWhiteboard } from "./InteractiveWhiteboard";
import { useWebRTC } from "@/hooks/useWebRTC";

interface VirtualClassroomProps {
  conversationId: string;
  userId: string;
}

export function VirtualClassroom({ conversationId, userId }: VirtualClassroomProps) {
  const [viewMode, setViewMode] = useState<'split' | 'whiteboard' | 'video'>('split');
  
  const { startCall, stopCall, localStream, remoteStream, callStatus } = useWebRTC({
    conversationId,
    userId,
    onCallEnded: () => console.log("Call ended"),
  });

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-950">
      {/* Top Bar */}
      <div className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-gray-800 dark:text-white">Sala de Aula Virtual</h2>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Ao Vivo
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setViewMode(viewMode === 'split' ? 'whiteboard' : 'split')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'split' ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Layout size={20} />
          </button>
          <button 
            onClick={() => stopCall()}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
          >
            <PhoneOff size={18} /> Encerrar Aula
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 p-6 gap-6 grid grid-cols-12">
        {viewMode === 'split' && (
          <>
            {/* Video Section */}
            <div className="col-span-4 flex flex-col gap-4">
              <div className="aspect-video bg-black rounded-2xl overflow-hidden relative shadow-xl border-2 border-white dark:border-gray-800">
                <video ref={(el) => { if(el) el.srcObject = remoteStream }} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-[10px] rounded">Professor</div>
              </div>
              <div className="aspect-video bg-black rounded-2xl overflow-hidden relative shadow-lg border-2 border-primary-500">
                <video ref={(el) => { if(el) el.srcObject = localStream }} autoPlay muted playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-[10px] rounded">Você</div>
              </div>
              
              {/* Call Controls */}
              <div className="flex justify-center gap-4 mt-4">
                <button className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-50 transition-colors text-gray-600 dark:text-gray-300">
                  <Mic size={24} />
                </button>
                <button className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-50 transition-colors text-gray-600 dark:text-gray-300">
                  <Video size={24} />
                </button>
              </div>
            </div>

            {/* Whiteboard Section */}
            <div className="col-span-8 h-full">
              <InteractiveWhiteboard conversationId={conversationId} userId={userId} />
            </div>
          </>
        )}

        {viewMode === 'whiteboard' && (
          <div className="col-span-12 h-full">
            <InteractiveWhiteboard conversationId={conversationId} userId={userId} />
          </div>
        )}

        {viewMode === 'video' && (
          <div className="col-span-12 h-full flex items-center justify-center">
            <div className="w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden relative">
              <video ref={(el) => { if(el) el.srcObject = remoteStream }} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute bottom-6 right-6 w-48 h-32 bg-gray-800 rounded-2xl overflow-hidden border-2 border-white/20">
                <video ref={(el) => { if(el) el.srcObject = localStream }} autoPlay muted playsInline className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
