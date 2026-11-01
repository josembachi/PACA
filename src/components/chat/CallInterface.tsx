"use client";

import React from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

interface CallInterfaceProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onEndCall: () => void;
}

export function CallInterface({ localStream, remoteStream, onEndCall }: CallInterfaceProps) {
  const localVideoRef = React.useRef<HTMLVideoElement>(null);
  const remoteVideoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  React.useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="fixed inset-0 z-[200] bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl">
        {/* Remote Video (Main) */}
        <video 
          ref={remoteVideoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
        
        {/* Local Video (PIP) */}
        <div className="absolute bottom-6 right-6 w-48 h-32 bg-gray-800 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg">
          <video 
            ref={localVideoRef} 
            autoPlay 
            muted 
            playsInline 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center gap-6">
        <button className="p-4 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors">
          <Mic size={24} />
        </button>
        <button className="p-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-xl scale-110" onClick={onEndCall}>
          <PhoneOff size={32} />
        </button>
        <button className="p-4 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors">
          <Video size={24} />
        </button>
      </div>
    </div>
  );
}
