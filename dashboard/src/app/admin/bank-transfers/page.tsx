"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import {
  fetchPendingBankTransfers,
  approveBankTransfer,
  rejectBankTransfer,
  getToken,
} from "@/lib/auth";
import { BankTransferItem } from "@/lib/types";
import {
  CheckCircle,
  XCircle,
  FileText,
  Loader2,
  Building2,
  ExternalLink,
} from "lucide-react";

export default function BankTransfersPage() {
  const { t } = useI18n();
  const [transfers, setTransfers] = useState<BankTransferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchPendingBankTransfers();
      setTransfers(res.transfers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (invoiceId: string) => {
    setActionLoading(invoiceId);
    try {
      await approveBankTransfer(invoiceId);
      await load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (invoiceId: string) => {
    setActionLoading(invoiceId);
    try {
      await rejectBankTransfer(invoiceId);
      await load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-2 mb-6">
        <Building2 className="w-5 h-5 text-indigo-600" />
        <h1 className="text-xl font-bold text-gray-900">
          {t("admin.bankTransfers" as any)}
        </h1>
        {transfers.length > 0 && (
          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
            {transfers.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : transfers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">{t("admin.noBankTransfers" as any)}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transfers.map((tr) => (
            <div
              key={tr.invoice_id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
            >
              {/* Header row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800">
                      {tr.tenant_name}
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
                      {t(`package.${tr.package}` as any)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {tr.tenant_email}
                  </p>
                </div>
                <div className="text-end shrink-0">
                  <p className="text-xl font-bold text-gray-900">
                    {tr.amount_sar.toLocaleString()}{" "}
                    <span className="text-sm font-normal text-gray-400">{t("register.sarMonth")}</span>
                  </p>
                  {tr.created_at && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(tr.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Receipt info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4">
                <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700">
                    {t("admin.transferReceipt" as any)}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {tr.transfer_receipt_name || "receipt"}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://dialectiq-api-297578317935.me-central1.run.app";
                    const token = getToken();
                    const res = await fetch(`${API_BASE}/api/v1/payments/bank-transfer/${tr.invoice_id}/receipt`, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!res.ok) { alert("Failed to load receipt"); return; }
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    window.open(url, "_blank");
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {t("admin.viewReceipt" as any)}
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(tr.invoice_id)}
                  disabled={actionLoading === tr.invoice_id}
                  className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading === tr.invoice_id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {t("admin.approveTransfer" as any)}
                </button>
                <button
                  onClick={() => handleReject(tr.invoice_id)}
                  disabled={actionLoading === tr.invoice_id}
                  className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  {t("admin.rejectTransfer" as any)}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
