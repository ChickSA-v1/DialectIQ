import 'package:flutter/material.dart';
import 'package:dialectiq/l10n/app_localizations.dart';
import '../app/theme.dart';

class FilterBar extends StatelessWidget {
  final String? selectedCategory;
  final String? selectedUrgency;
  final String? selectedDialect;
  final List<String> categories;
  final List<String> urgencies;
  final List<String> dialects;
  final ValueChanged<String?> onCategoryChanged;
  final ValueChanged<String?> onUrgencyChanged;
  final ValueChanged<String?> onDialectChanged;
  final VoidCallback onClear;

  const FilterBar({
    super.key,
    this.selectedCategory,
    this.selectedUrgency,
    this.selectedDialect,
    required this.categories,
    required this.urgencies,
    required this.dialects,
    required this.onCategoryChanged,
    required this.onUrgencyChanged,
    required this.onDialectChanged,
    required this.onClear,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: Row(
        children: [
          _buildDropdown(
            label: l10n.category,
            value: selectedCategory,
            items: categories,
            onChanged: onCategoryChanged,
          ),
          const SizedBox(width: 8),
          _buildDropdown(
            label: l10n.urgency,
            value: selectedUrgency,
            items: urgencies,
            onChanged: onUrgencyChanged,
          ),
          const SizedBox(width: 8),
          _buildDropdown(
            label: l10n.dialect,
            value: selectedDialect,
            items: dialects,
            onChanged: onDialectChanged,
          ),
          const SizedBox(width: 8),
          TextButton.icon(
            onPressed: onClear,
            icon: const Icon(Icons.clear_all, size: 18),
            label:
                Text(l10n.clearFilters, style: const TextStyle(fontSize: 12)),
            style: TextButton.styleFrom(
              foregroundColor: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDropdown({
    required String label,
    required String? value,
    required List<String> items,
    required ValueChanged<String?> onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
      decoration: AppColors.glassDecoration(radius: 12),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          hint: Text(label,
              style: const TextStyle(
                  fontSize: 13, color: AppColors.textSecondary)),
          value: value,
          isDense: true,
          dropdownColor: AppColors.bgEnd,
          icon: const Icon(Icons.arrow_drop_down,
              size: 18, color: AppColors.textSecondary),
          style: const TextStyle(fontSize: 13, color: AppColors.textPrimary),
          items: [
            DropdownMenuItem<String>(
              value: null,
              child: Text('All $label',
                  style: const TextStyle(
                      fontSize: 13, color: AppColors.textPrimary)),
            ),
            ...items.map(
              (e) => DropdownMenuItem(
                value: e,
                child: Text(e,
                    style: const TextStyle(
                        fontSize: 13, color: AppColors.textPrimary)),
              ),
            ),
          ],
          onChanged: onChanged,
        ),
      ),
    );
  }
}
