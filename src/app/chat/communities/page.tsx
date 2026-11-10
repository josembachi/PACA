"use client";

import React, { useState, useEffect } from "react";
import { PageShell } from "../../_components/PageShell";
import { CommunityCard } from "@/components/chat/CommunityCard";
import { Community } from "@/lib/types";
import { Search } from "lucide-react";

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      // Mock data for demonstration
      setCommunities([
        { id: '1', name: 'Matemática Avançada', description: 'Comunidade para estudantes de cálculo e álgebra linear.', created_by: 'user1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: '2', name: 'Programação React', description: 'Discussões sobre Next.js, React 19 e ecossistema frontend.', created_by: 'user2', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: '3', name: 'Física Quântica', description: 'Explorando os mistérios do universo subatómico.', created_by: 'user3', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = communities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Comunidades <span className="text-primary-600">PACA</span>
            </h1>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
              Conecta-te com pessoas que partilham os teus interesses académicos.
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar comunidades..." 
              className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all w-full md:w-64"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(c => <CommunityCard key={c.id} community={c} />)}
          </div>
        )}
      </div>
    </PageShell>
  );
}
