"use client";

import React from "react";
import { Users, ArrowRight } from "lucide-react";
import { Community } from "@/lib/types";
import { chatService } from "@/services/chatService";
import { useAuth } from "@/providers/auth-provider";

interface CommunityCardProps {
  community: Community;
}

export function CommunityCard({ community }: CommunityCardProps) {
  const { auth } = useAuth();

  const handleJoin = async () => {
    const userId = auth?.user.id;

    if (!userId) {
      alert("Precisas de iniciar sessão para entrar numa comunidade.");
      return;
    }

    try {
      await chatService.joinCommunity(community.id, userId);
      alert("Entraste com sucesso na comunidade!");
    } catch (error) {
      console.error("Error joining community:", error);
      alert("Não foi possível entrar na comunidade neste momento.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:shadow-lg transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-2xl overflow-hidden">
          {community.avatar_url ? (
            <img src={community.avatar_url} alt={community.name} className="w-full h-full object-cover" />
          ) : (
            community.name[0]
          )}
        </div>
        <button 
          onClick={handleJoin}
          className="p-2 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-600 hover:text-white transition-all"
        >
          <Users size={20} />
        </button>
      </div>
      
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-primary-600 transition-colors">
        {community.name}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-6">
        {community.description || "Sem descrição disponível para esta comunidade."}
      </p>
      
      <button className="w-full py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary-600 hover:text-white transition-all">
        Explorar Conversas <ArrowRight size={16} />
      </button>
    </div>
  );
}
