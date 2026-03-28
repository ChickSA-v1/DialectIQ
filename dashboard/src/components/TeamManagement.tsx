"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { getToken } from "@/lib/auth";
import { Plus, Trash2, UserCheck, UserX, X } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://dialectiq-api-297578317935.me-central1.run.app";

interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  allowed_place_ids: string[] | null;
  created_at: string | null;
}

async function fetchTeam(): Promise<TeamMember[]> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/v1/tenant/team`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

async function inviteMember(data: { email: string; full_name: string; password: string }): Promise<void> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/v1/tenant/team/invite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error: ${res.status}`);
  }
}

async function removeMember(id: string): Promise<void> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/v1/tenant/team/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error: ${res.status}`);
  }
}

export default function TeamManagement({ userRole }: { userRole: string }) {
  const { t } = useI18n();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ email: "", full_name: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isOwner = userRole === "owner" || userRole === "admin";

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchTeam();
      setMembers(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleInvite = async () => {
    if (!form.email || !form.full_name || !form.password) return;
    setSubmitting(true);
    setError("");
    try {
      await inviteMember(form);
      setForm({ email: "", full_name: "", password: "" });
      setShowInvite(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: string, name: string) => {
    if (!confirm(t("team.confirmRemove" as any).replace("{name}", name))) return;
    try {
      await removeMember(id);
      await load();
    } catch {}
  };

  if (loading) return <div className="shimmer-bg rounded-2xl h-32" />;

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-gray-700">
          {t("team.title" as any)} ({members.length}/10)
        </h4>
        {isOwner && members.length < 10 && (
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="text-xs text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            {t("team.invite" as any)}
          </button>
        )}
      </div>

      {/* Invite form */}
      {showInvite && (
        <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">{t("team.inviteNew" as any)}</p>
            <button onClick={() => setShowInvite(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            placeholder={t("team.namePlaceholder" as any)}
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <input
            type="email"
            placeholder={t("team.emailPlaceholder" as any)}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <input
            type="password"
            placeholder={t("team.passwordPlaceholder" as any)}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            onClick={handleInvite}
            disabled={submitting}
            className="w-full px-4 py-2 text-sm gradient-primary text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? "..." : t("team.sendInvite" as any)}
          </button>
        </div>
      )}

      {/* Members list */}
      <div className="space-y-2">
        {members.map((m) => (
          <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg ${m.is_active ? "bg-emerald-50" : "bg-gray-100"}`}>
                {m.is_active ? (
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                ) : (
                  <UserX className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{m.full_name}</p>
                <p className="text-xs text-gray-400">{m.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                m.role === "owner"
                  ? "bg-cyan-100 text-cyan-700"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {m.role === "owner" ? t("team.owner" as any) : t("team.member" as any)}
              </span>
              {isOwner && m.role !== "owner" && (
                <button
                  onClick={() => handleRemove(m.id, m.full_name)}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
