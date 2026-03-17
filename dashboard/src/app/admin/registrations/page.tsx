"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import {
  fetchRegistrations,
  approveRegistration,
  rejectRegistration,
  viewDocument,
} from "@/lib/auth";
import { RegistrationDetail } from "@/lib/types";
import {
  CheckCircle,
  XCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

export default function RegistrationsPage() {
  const { t } = useI18n();
  const [registrations, setRegistrations] = useState<RegistrationDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchRegistrations();
      setRegistrations(res.registrations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (tenantId: string) => {
    setActionLoading(tenantId);
    try {
      await approveRegistration(tenantId);
      await load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (tenantId: string) => {
    if (!rejectReason.trim()) return;
    setActionLoading(tenantId);
    try {
      await rejectRegistration(tenantId, rejectReason);
      setShowRejectModal(null);
      setRejectReason("");
      await load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-5xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">
        {t("admin.registrations")}
      </h1>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : registrations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">{t("admin.noRegistrations")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {registrations.map((reg) => (
            <div
              key={reg.tenant.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() =>
                  setExpandedId(expandedId === reg.tenant.id ? null : reg.tenant.id)
                }
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800">
                      {reg.tenant.name_ar}
                    </span>
                    {reg.tenant.name_en && (
                      <span className="text-sm text-gray-400">
                        ({reg.tenant.name_en})
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded text-xs font-medium">
                      {t(`package.${reg.tenant.package}` as any)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {reg.tenant.email} &bull; {reg.tenant.phone}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {reg.documents.length} {t("admin.documents")}
                  </span>
                  {expandedId === reg.tenant.id ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded detail */}
              {expandedId === reg.tenant.id && (
                <div className="border-t border-gray-100 p-4 space-y-3">
                  {/* Owner info */}
                  {reg.owner && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-600">
                        {t("admin.owner")}:
                      </span>{" "}
                      <span className="text-gray-800">
                        {reg.owner.full_name} ({reg.owner.email})
                      </span>
                    </div>
                  )}

                  {/* Documents */}
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      {t("admin.documents")}:
                    </p>
                    <div className="space-y-1">
                      {reg.documents.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => viewDocument(doc.id)}
                          className="flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700 cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                          {t(`document.${doc.doc_type}` as any)} — {doc.file_name}
                        </button>
                      ))}
                      {reg.documents.length === 0 && (
                        <p className="text-xs text-gray-400">
                          {t("admin.noDocs")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleApprove(reg.tenant.id)}
                      disabled={actionLoading === reg.tenant.id}
                      className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {t("admin.approve")}
                    </button>
                    <button
                      onClick={() => setShowRejectModal(reg.tenant.id)}
                      disabled={actionLoading === reg.tenant.id}
                      className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      {t("admin.reject")}
                    </button>
                  </div>

                  {/* Reject modal */}
                  {showRejectModal === reg.tenant.id && (
                    <div className="bg-red-50 rounded-lg p-4 space-y-2">
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder={t("admin.rejectReason")}
                        className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(reg.tenant.id)}
                          disabled={!rejectReason.trim()}
                          className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 disabled:opacity-50"
                        >
                          {t("admin.confirmReject")}
                        </button>
                        <button
                          onClick={() => {
                            setShowRejectModal(null);
                            setRejectReason("");
                          }}
                          className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-xs hover:bg-gray-50"
                        >
                          {t("admin.cancel")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
