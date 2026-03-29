import 'package:flutter/material.dart';
import '../app/theme.dart';
import '../models/place.dart';
import '../repositories/tenant_repo.dart';

class CompetitorWidget extends StatefulWidget {
  final List<String> competitorPlaceIds;
  final VoidCallback onChanged;

  const CompetitorWidget({
    super.key,
    required this.competitorPlaceIds,
    required this.onChanged,
  });

  @override
  State<CompetitorWidget> createState() => _CompetitorWidgetState();
}

class _CompetitorWidgetState extends State<CompetitorWidget> {
  final _tenantRepo = TenantRepository();
  bool _removing = false;

  Future<void> _removeCompetitor(String placeId) async {
    setState(() => _removing = true);
    try {
      await _tenantRepo.removeCompetitor(placeId);
      widget.onChanged();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('خطأ في الحذف: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) setState(() => _removing = false);
    }
  }

  void _showAddCompetitorSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.bgEnd,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => _AddCompetitorSheet(
        tenantRepo: _tenantRepo,
        onAdded: () {
          Navigator.pop(ctx);
          widget.onChanged();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final canAdd = widget.competitorPlaceIds.length < 3;

    return Container(
      decoration: AppColors.glassDecoration(radius: 16),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.business_center_rounded, color: AppColors.goldenYellow, size: 20),
              const SizedBox(width: 8),
              const Text(
                'المنافسون',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const Spacer(),
              if (canAdd)
                TextButton.icon(
                  onPressed: _showAddCompetitorSheet,
                  icon: const Icon(Icons.add, size: 18, color: AppColors.goldenYellow),
                  label: const Text(
                    'أضف منافساً',
                    style: TextStyle(color: AppColors.goldenYellow, fontSize: 13),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          if (widget.competitorPlaceIds.isEmpty)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(12),
                child: Text(
                  'لا يوجد منافسون مضافون',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 13),
                ),
              ),
            )
          else
            ...widget.competitorPlaceIds.asMap().entries.map((entry) {
              final placeId = entry.value;
              return Dismissible(
                key: Key(placeId),
                direction: DismissDirection.endToStart,
                background: Container(
                  alignment: Alignment.centerRight,
                  padding: const EdgeInsets.only(right: 16),
                  decoration: BoxDecoration(
                    color: AppColors.error.withValues(alpha: 0.20),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.delete_outline, color: AppColors.error),
                ),
                confirmDismiss: (_) async {
                  await _removeCompetitor(placeId);
                  return false;
                },
                child: Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  decoration: AppColors.glassDecoration(radius: 12),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  child: Row(
                    children: [
                      const Icon(Icons.storefront_rounded, color: AppColors.textSecondary, size: 18),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          placeId,
                          style: const TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 12,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (_removing)
                        const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.error),
                        )
                      else
                        IconButton(
                          onPressed: () => _removeCompetitor(placeId),
                          icon: const Icon(Icons.close, color: AppColors.error, size: 16),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                        ),
                    ],
                  ),
                ),
              );
            }),
          if (!canAdd)
            const Padding(
              padding: EdgeInsets.only(top: 4),
              child: Text(
                'الحد الأقصى 3 منافسين',
                style: TextStyle(color: AppColors.textMuted, fontSize: 12),
              ),
            ),
        ],
      ),
    );
  }
}

class _AddCompetitorSheet extends StatefulWidget {
  final TenantRepository tenantRepo;
  final VoidCallback onAdded;

  const _AddCompetitorSheet({
    required this.tenantRepo,
    required this.onAdded,
  });

  @override
  State<_AddCompetitorSheet> createState() => _AddCompetitorSheetState();
}

class _AddCompetitorSheetState extends State<_AddCompetitorSheet> {
  final _searchCtrl = TextEditingController();
  List<PlaceSearchResult>? _results;
  bool _searching = false;
  bool _adding = false;

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _search() async {
    final q = _searchCtrl.text.trim();
    if (q.isEmpty) return;
    setState(() {
      _searching = true;
      _results = null;
    });
    try {
      final response = await widget.tenantRepo.searchPlaces(q);
      if (mounted) {
        setState(() {
          _results = response.results;
          _searching = false;
        });
      }

    } catch (e) {
      if (mounted) {
        setState(() => _searching = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('خطأ في البحث: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _add(String placeId) async {
    setState(() => _adding = true);
    try {
      await widget.tenantRepo.addCompetitor(placeId);
      widget.onAdded();
    } catch (e) {
      if (mounted) {
        setState(() => _adding = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('خطأ في الإضافة: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'إضافة منافس',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _searchCtrl,
                  style: const TextStyle(color: AppColors.textPrimary),
                  decoration: const InputDecoration(
                    hintText: 'ابحث عن المنافس...',
                    prefixIcon: Icon(Icons.search),
                  ),
                  onSubmitted: (_) => _search(),
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                onPressed: _searching ? null : _search,
                child: _searching
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('بحث'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (_results != null && _results!.isEmpty)
            const Center(
              child: Text('لا توجد نتائج', style: TextStyle(color: AppColors.textMuted)),
            ),
          if (_results != null && _results!.isNotEmpty)
            ConstrainedBox(
              constraints: const BoxConstraints(maxHeight: 300),
              child: ListView.builder(
                shrinkWrap: true,
                itemCount: _results!.length,
                itemBuilder: (ctx, i) {
                  final item = _results![i];
                  final name = item.name;
                  final address = item.address ?? '';
                  final placeId = item.placeId;
                  return Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    decoration: AppColors.glassDecoration(radius: 12),
                    child: ListTile(
                      title: Text(name, style: const TextStyle(color: AppColors.textPrimary, fontSize: 14)),
                      subtitle: Text(address, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                      trailing: _adding
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.vibrantCyan),
                            )
                          : IconButton(
                              onPressed: () => _add(placeId),
                              icon: const Icon(Icons.add_circle_outline, color: AppColors.vibrantCyan),
                            ),
                    ),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }
}
