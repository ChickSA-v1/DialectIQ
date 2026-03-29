import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import '../app/theme.dart';
import '../models/user.dart';
import '../repositories/tenant_repo.dart';

class InvoicesWidget extends StatefulWidget {
  final List<InvoiceInfo> invoices;

  const InvoicesWidget({super.key, required this.invoices});

  @override
  State<InvoicesWidget> createState() => _InvoicesWidgetState();
}

class _InvoicesWidgetState extends State<InvoicesWidget> {
  final _tenantRepo = TenantRepository();
  final Set<String> _loadingPdf = {};
  final Set<String> _uploadingReceipt = {};

  Future<void> _downloadPdf(String invoiceId) async {
    setState(() => _loadingPdf.add(invoiceId));
    try {
      await _tenantRepo.downloadInvoicePdf(invoiceId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تم تحميل الفاتورة')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('خطأ في التحميل: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) setState(() => _loadingPdf.remove(invoiceId));
    }
  }

  Future<void> _uploadReceipt(String invoiceId) async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf'],
      withData: true,
    );
    if (result == null || result.files.isEmpty) return;
    final file = result.files.first;
    if (file.bytes == null) return;

    setState(() => _uploadingReceipt.add(invoiceId));
    try {
      await _tenantRepo.uploadBankTransfer(
        invoiceId,
        file.bytes!,
        file.name,
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تم رفع الإيصال بنجاح')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('خطأ في الرفع: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) setState(() => _uploadingReceipt.remove(invoiceId));
    }
  }

  Color _statusColor(String status) {
    switch (status.toLowerCase()) {
      case 'paid':
        return AppColors.emeraldGreen;
      case 'pending':
        return AppColors.goldenYellow;
      case 'failed':
        return AppColors.error;
      default:
        return AppColors.textMuted;
    }
  }

  String _statusLabel(String status) {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'مدفوعة';
      case 'pending':
        return 'معلقة';
      case 'failed':
        return 'فاشلة';
      default:
        return status;
    }
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return '';
    try {
      final dt = DateTime.parse(dateStr);
      return '${dt.year}/${dt.month.toString().padLeft(2, '0')}/${dt.day.toString().padLeft(2, '0')}';
    } catch (_) {
      return dateStr;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: AppColors.glassDecoration(radius: 16),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.receipt_long_rounded, color: AppColors.vibrantCyan, size: 20),
              SizedBox(width: 8),
              Text(
                'الفواتير',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...widget.invoices.map((invoice) {
            final statusColor = _statusColor(invoice.status);
            final isPendingBankTransfer =
                invoice.status.toLowerCase() == 'pending' &&
                invoice.paymentMethod == 'bank_transfer';
            final isPdfLoading = _loadingPdf.contains(invoice.id);
            final isReceiptUploading = _uploadingReceipt.contains(invoice.id);

            return Container(
              margin: const EdgeInsets.only(bottom: 10),
              decoration: AppColors.glassDecoration(radius: 12),
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${invoice.amountSar.toStringAsFixed(2)} ر.س',
                              style: const TextStyle(
                                color: AppColors.textPrimary,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            if (invoice.createdAt != null)
                              Text(
                                _formatDate(invoice.createdAt),
                                style: const TextStyle(
                                  color: AppColors.textSecondary,
                                  fontSize: 12,
                                ),
                              ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: statusColor.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: statusColor.withValues(alpha: 0.30)),
                        ),
                        child: Text(
                          _statusLabel(invoice.status),
                          style: TextStyle(
                            color: statusColor,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      if (isPendingBankTransfer)
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: isReceiptUploading ? null : () => _uploadReceipt(invoice.id),
                            icon: isReceiptUploading
                                ? const SizedBox(
                                    width: 14,
                                    height: 14,
                                    child: CircularProgressIndicator(strokeWidth: 2),
                                  )
                                : const Icon(Icons.upload_file_rounded, size: 16),
                            label: const Text('رفع الإيصال', style: TextStyle(fontSize: 12)),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppColors.goldenYellow,
                              side: const BorderSide(color: AppColors.goldenYellow),
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            ),
                          ),
                        ),
                      if (isPendingBankTransfer) const SizedBox(width: 8),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: isPdfLoading ? null : () => _downloadPdf(invoice.id),
                          icon: isPdfLoading
                              ? const SizedBox(
                                  width: 14,
                                  height: 14,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                )
                              : const Icon(Icons.picture_as_pdf_rounded, size: 16),
                          label: const Text('تحميل PDF', style: TextStyle(fontSize: 12)),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.vibrantCyan,
                            side: const BorderSide(color: AppColors.vibrantCyan),
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}
