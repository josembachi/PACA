"use client";

import React from "react";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { PageShell } from "../_components/PageShell";

export default function ChatPage() {
  return (
    <PageShell>
      <div className="h-[calc(100vh-120px)] overflow-hidden">
        <ChatWindow />
      </div>
    </PageShell>
  );
}
