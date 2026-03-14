import 'package:flutter/material.dart';
import 'package:dialectiq/l10n/app_localizations.dart';
import '../app/theme.dart';
import '../models/dashboard.dart';

class ReviewCard extends StatefulWidget {
  final ReviewDetail review;

  const ReviewCard({super.key, required this.review});

  @override
  State<ReviewCard> createState() => _ReviewCardState();
}

class _ReviewCardState extends State<ReviewCard> {
  bool _expanded = false;

  Color _sentimentColor(double? score) {
    if (score == null) return AppColors.textMuted;
    if (score >= 0.6) return AppColors.success;
    if (score >= 0.4) return AppColors.warning;
    return AppColors.error;
  }

  Color _urgencyColor(String? urgency) {
    switch (urgency?.toLowerCase()) {
      case 'high':
        return AppColors.error;
      case 'medium':
        return AppColors.warning;
      case 'low':
        return AppColors.success;
      default:
        return AppColors.textMuted;
    }
  }

  @override
  Widget build(BuildContext context) {
    final r = widget.review;
    final l10n = AppLocalizations.of(context)!;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: InkWell(
        onTap: () => setState(() => _expanded = !_expanded),
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header row
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          r.author ?? 'Anonymous',
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 15,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          r.businessName,
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (r.rating != null) ...[
                    Row(
                      children: List.generate(
                        5,
                        (i) => Icon(
                          i < r.rating! ? Icons.star : Icons.star_border,
                          size: 16,
                          color: Colors.amber,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 10),

              // Review text
              Text(
                r.rawText,
                maxLines: _expanded ? null : 2,
                overflow: _expanded ? null : TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 14,
                  color: AppColors.textPrimary,
                  height: 1.5,
                ),
              ),

              const SizedBox(height: 10),

              // Tags row
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: [
                  if (r.sentimentScore != null)
                    _buildTag(
                      '${(r.sentimentScore! * 100).toInt()}%',
                      _sentimentColor(r.sentimentScore),
                    ),
                  if (r.urgencyLevel != null)
                    _buildTag(r.urgencyLevel!, _urgencyColor(r.urgencyLevel)),
                  if (r.category != null)
                    _buildTag(r.category!, AppColors.primary),
                  if (r.dialectDetected != null)
                    _buildTag(r.dialectDetected!, AppColors.textSecondary),
                ],
              ),

              // Expanded details
              if (_expanded) ...[
                const SizedBox(height: 14),
                const Divider(),
                const SizedBox(height: 10),
                if (r.translatedIntent != null) ...[
                  _detailRow(l10n.translatedIntent, r.translatedIntent!),
                  const SizedBox(height: 8),
                ],
                if (r.suggestedReply != null) ...[
                  _detailRow(l10n.suggestedReply, r.suggestedReply!),
                ],
              ],

              // Expand indicator
              Center(
                child: Icon(
                  _expanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                  color: AppColors.textMuted,
                  size: 20,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTag(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        text,
        style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w600),
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(fontSize: 13, color: AppColors.textPrimary, height: 1.4),
        ),
      ],
    );
  }
}
