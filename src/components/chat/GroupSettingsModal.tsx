"use client";

import React, { useState } from "react";
import { X, Save, Camera } from "lucide-react";
import { communityService } from "@/services/communityService";
import { Conversation } from "@/lib/types";

interface GroupSettingsModalProps {
  conversation: Conversation;
  onClose: () => void;
  onSuccess: () => void;
}

export function GroupSettingsModal({ conversation, onClose, onSuccess }: GroupSettingsModalProps) {
  const [name, setName] = useState(conversation.group_name || "");
  const [avatar, setAvatar] = useState(conversation.group_avatar_url || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await communityService.updateGroupSettings(conversation.id, {
        group_name: name,
        group_avatar_url: avatar,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating group settings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Definições do Grupo</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-4 border-primary-500">
                {avatar ? (
                  <img src={avatar} alt="Group" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-gray-400">{name[0] || "G"}</span>
                )}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors">
                <Camera size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-500">Alterar foto do grupo</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Grupo</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Grupo de Estudo de Cálculo"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">URL da Imagem</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              value={avatar}
              onChange={e => setAvatar(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-all disabled:opacity-50"
          >
            <Save size={16} />
            {loading ? "A guardar..." : "Guardar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
