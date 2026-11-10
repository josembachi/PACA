"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";

interface WebRTCOptions {
  conversationId: string;
  userId: string;
  onCallEnded: () => void;
}

export function useWebRTC({ conversationId, userId, onCallEnded }: WebRTCOptions) {
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callStatus, setCallStatus] = useState<'IDLE' | 'CALLING' | 'CONNECTED'>('IDLE');

  const supabase = createClient();

  useEffect(() => {
    if (!conversationId) return;

    // Listen for signaling messages
    const channel = supabase.channel(`webrtc:${conversationId}`);

    channel
      .on("broadcast", { event: "signal" }, async ({ payload }: { payload: { from: string; signal: any } }) => {
        const { from, signal } = payload;
        if (from === userId) return;

        if (signal.type === "offer") {
          await handleOffer(signal);
        } else if (signal.type === "answer") {
          await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(signal));
        } else if (signal.type === "candidate") {
          await peerConnection.current?.addIceCandidate(new RTCIceCandidate(signal));
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
      stopCall();
    };
  }, [conversationId, userId]);

  async function startCall(video = true) {
    setCallStatus('CALLING');
    
    localStream.current = await navigator.mediaDevices.getUserMedia({ 
      video, 
      audio: true 
    });

    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    localStream.current.getTracks().forEach(track => {
      peerConnection.current?.addTrack(track, localStream.current!);
    });

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        supabase.channel(`webrtc:${conversationId}`).send({
          type: "broadcast",
          event: "signal",
          payload: { from: userId, signal: { type: "candidate", candidate: event.candidate } },
        });
      }
    };

    peerConnection.current.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      setCallStatus('CONNECTED');
    };

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    supabase.channel(`webrtc:${conversationId}`).send({
      type: "broadcast",
      event: "signal",
      payload: { from: userId, signal: offer },
    });
  }

  async function handleOffer(offer: RTCSessionDescription) {
    if (!peerConnection.current) {
      peerConnection.current = new RTCPeerConnection({
        iceServers: [{ urls: "stun.l.google.com:19302" }]
      });
    }

    localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStream.current.getTracks().forEach(track => {
      peerConnection.current?.addTrack(track, localStream.current!);
    });

    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);

    supabase.channel(`webrtc:${conversationId}`).send({
      type: "broadcast",
      event: "signal",
      payload: { from: userId, signal: answer },
    });

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        supabase.channel(`webrtc:${conversationId}`).send({
          type: "broadcast",
          event: "signal",
          payload: { from: userId, signal: { type: "candidate", candidate: event.candidate } },
        });
      }
    };

    peerConnection.current.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      setCallStatus('CONNECTED');
    };
  }

  function stopCall() {
    localStream.current?.getTracks().forEach(track => track.stop());
    peerConnection.current?.close();
    peerConnection.current = null;
    setRemoteStream(null);
    setCallStatus('IDLE');
    onCallEnded();
  }

  return {
    startCall,
    stopCall,
    localStream: localStream.current,
    remoteStream,
    callStatus,
  };
}
