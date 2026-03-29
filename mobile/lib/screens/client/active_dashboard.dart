import 'dart:ui';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dialectiq/l10n/app_localizations.dart';

import '../../app/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/profile_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../repositories/tenant_repo.dart';
import '../../widgets/animated_glass_background.dart';
import '../../widgets/fade_slide_in.dart';
import '../../widgets/stat_card.dart';
import '../../widgets/review_card.dart';
import '../../widgets/chart_widgets.dart';
import '../../widgets/filter_bar.dart';
import '../../widgets/loading_shimmer.dart';
import '../../widgets/locale_switcher.dart';
import '../../widgets/competitor_widget.dart';
import '../../widgets/team_management_widget.dart';
import '../../widgets/invoices_widget.dart';

class ActiveDashboard extends ConsumerStatefulWidget {
  const ActiveDashboard({super.key});

  @override
  ConsumerState<ActiveDashboard> createState() => _ActiveDashboardState();
}

class _ActiveDashboardState extends ConsumerState<ActiveDashboard> {
  final _tenantRepo = TenantRepository();
  bool _fetchingReviews = false;
  bool _searchingPlaces = false;
  final _searchController = TextEditingController();
  List<dynamic>? _searchResults;

  /// Extract a user-friendly error message from exceptions
  String _friendlyError(Object e) {
    if (e is DioException && e.response?.data != null) {
      final data = e.response!.data;
      if (data is Map<String, dynamic> && data.containsKey('detail')) {
        return data['detail'].toString();
      }
    }
    return e.toString();
  }

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(dashboardProvider.notifier).load();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _showAddBusinessDialog() {
    _searchController.clear();
    _searchResults = null;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.bgEnd,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            final l10n = AppLocalizations.of(context)!;
            return Container(
              decoration: BoxDecoration(
                color: AppColors.bgEnd,
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(24)),
                border: Border(
                  top: BorderSide(
                      color: Colors.white.withValues(alpha: 0.10)),
                ),
              ),
              child: Padding(
                padding: EdgeInsets.only(
                  left: 20,
                  right: 20,
                  top: 20,
                  bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Handle bar
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.20),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      l10n.addBusiness,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _searchController,
                      style: const TextStyle(color: AppColors.textPrimary),
                      decoration: InputDecoration(
                        hintText: l10n.searchPlaces,
                        prefixIcon: const Icon(Icons.search),
                        suffixIcon: _searchingPlaces
                            ? Padding(
                                padding: const EdgeInsets.all(12),
                                child: SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation(
                                      AppColors.accentStart
                                          .withValues(alpha: 0.7),
                                    ),
                                  ),
                                ),
                              )
                            : IconButton(
                                icon: const Icon(Icons.send),
                                onPressed: () async {
                                  if (_searchController.text.trim().isEmpty)
                                    return;
                                  setModalState(
                                      () => _searchingPlaces = true);
                                  try {
                                    final result =
                                        await _tenantRepo.searchPlaces(
                                            _searchController.text.trim());
                                    setModalState(() {
                                      _searchResults = result.results;
                                      _searchingPlaces = false;
                                    });
                                  } catch (e) {
                                    setModalState(
                                        () => _searchingPlaces = false);
                                    if (mounted) {
                                      ScaffoldMessenger.of(context)
                                          .showSnackBar(
                                        SnackBar(
                                          content: Text(_friendlyError(e)),
                                          backgroundColor: AppColors.error,
                                        ),
                                      );
                                    }
                                  }
                                },
                              ),
                      ),
                      onSubmitted: (value) async {
                        if (value.trim().isEmpty) return;
                        setModalState(() => _searchingPlaces = true);
                        try {
                          final result =
                              await _tenantRepo.searchPlaces(value.trim());
                          setModalState(() {
                            _searchResults = result.results;
                            _searchingPlaces = false;
                          });
                        } catch (e) {
                          setModalState(() => _searchingPlaces = false);
                        }
                      },
                    ),
                    if (_searchResults != null) ...[
                      const SizedBox(height: 12),
                      if (_searchResults!.isEmpty)
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: Center(
                            child: Text(
                              l10n.noPlaces,
                              style: const TextStyle(
                                  color: AppColors.textMuted),
                            ),
                          ),
                        )
                      else
                        ConstrainedBox(
                          constraints: const BoxConstraints(maxHeight: 300),
                          child: ListView.builder(
                            shrinkWrap: true,
                            itemCount: _searchResults!.length,
                            itemBuilder: (ctx, i) {
                              final place = _searchResults![i];
                              return Container(
                                margin: const EdgeInsets.only(bottom: 6),
                                decoration: AppColors.glassDecoration(
                                    radius: 14),
                                child: ListTile(
                                  leading: Icon(Icons.place,
                                      color: AppColors.accentStart),
                                  title: Text(
                                    place.name,
                                    style: const TextStyle(
                                      fontSize: 14,
                                      color: AppColors.textPrimary,
                                    ),
                                  ),
                                  subtitle: Text(
                                    place.address ?? place.placeId,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: AppColors.textSecondary,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  trailing: Icon(Icons.add_circle_outline,
                                      color: AppColors.success),
                                  onTap: () async {
                                    Navigator.pop(ctx);
                                    try {
                                      await _tenantRepo
                                          .confirmPlaceId(place.placeId);
                                      if (mounted) {
                                        await ref
                                            .read(authProvider.notifier)
                                            .refreshProfile();
                                        ScaffoldMessenger.of(context)
                                            .showSnackBar(
                                          SnackBar(
                                            content: Text(
                                                '${place.name} — ${l10n.businessPendingMsg}'),
                                            backgroundColor:
                                                AppColors.warning,
                                          ),
                                        );
                                      }
                                    } catch (e) {
                                      if (mounted) {
                                        ScaffoldMessenger.of(context)
                                            .showSnackBar(
                                          SnackBar(
                                            content:
                                                Text(_friendlyError(e)),
                                            backgroundColor:
                                                AppColors.error,
                                          ),
                                        );
                                      }
                                    }
                                  },
                                ),
                              );
                            },
                          ),
                        ),
                    ],
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _fetchReviews() async {
    setState(() => _fetchingReviews = true);
    try {
      final results = await _tenantRepo.fetchReviews();
      if (mounted) {
        final l10n = AppLocalizations.of(context)!;
        final totalNew =
            results.fold<int>(0, (sum, r) => sum + r.reviewsNew);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(l10n.reviewsFetched(totalNew)),
            backgroundColor: AppColors.success,
          ),
        );
        await ref.read(authProvider.notifier).refreshProfile();
        ref.read(dashboardProvider.notifier).load();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_friendlyError(e)),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _fetchingReviews = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final profile = ref.watch(profileProvider);
    final tenant = ref.watch(tenantProvider);
    final dashboard = ref.watch(dashboardProvider);
    final stats = dashboard.data?.stats;
    final reviews = dashboard.data?.reviews ?? [];

    return Scaffold(
      backgroundColor: AppColors.bgStart,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        title: Text(l10n.dashboard),
        actions: [
          const Padding(
            padding: EdgeInsets.only(right: 4),
            child: LocaleSwitcher(),
          ),
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () => context.push('/settings'),
          ),
        ],
      ),
      body: AnimatedGlassBackground(
        child: RefreshIndicator(
          color: AppColors.accentStart,
          backgroundColor: AppColors.bgEnd,
          onRefresh: () async {
            await ref.read(authProvider.notifier).refreshProfile();
            await ref.read(dashboardProvider.notifier).load();
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Subscription info — glass card with accent gradient
                if (tenant != null)
                  FadeSlideIn(
                    child: ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: BackdropFilter(
                      filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(18),
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: AppColors.accentGlassDecoration(
                            radius: 20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  l10n.subscription,
                                  style: const TextStyle(
                                    color: AppColors.textSecondary,
                                    fontSize: 13,
                                  ),
                                ),
                                const Spacer(),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.white
                                        .withValues(alpha: 0.15),
                                    borderRadius:
                                        BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    tenant.package.toUpperCase(),
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              l10n.reviewsUsed(
                                tenant.reviewsUsedThisMonth,
                                tenant.maxReviewsPerMonth,
                              ),
                              style: const TextStyle(
                                color: AppColors.textPrimary,
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 8),
                            // Days remaining bar
                            if (tenant.subscriptionStartsAt != null &&
                                tenant.subscriptionExpiresAt != null) ...[
                              const SizedBox(height: 4),
                              Builder(builder: (context) {
                                final start = DateTime.parse(
                                    tenant.subscriptionStartsAt!);
                                final end = DateTime.parse(
                                    tenant.subscriptionExpiresAt!);
                                final now = DateTime.now();
                                final totalDays =
                                    end.difference(start).inDays.clamp(1, 9999);
                                final daysLeft =
                                    end.difference(now).inDays.clamp(0, totalDays);
                                final daysPct = daysLeft / totalDays;
                                final daysColor = daysLeft <= 5
                                    ? AppColors.error
                                    : daysLeft <= 10
                                        ? AppColors.warning
                                        : AppColors.accentStart;
                                return Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        const Icon(Icons.calendar_today,
                                            size: 13, color: Colors.white70),
                                        const SizedBox(width: 6),
                                        Text(
                                          l10n.daysRemainingOf(
                                              daysLeft, totalDays),
                                          style: const TextStyle(
                                            color: Colors.white70,
                                            fontSize: 12,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(4),
                                      child: LinearProgressIndicator(
                                        value: daysPct,
                                        backgroundColor: Colors.white
                                            .withValues(alpha: 0.12),
                                        valueColor:
                                            AlwaysStoppedAnimation(daysColor),
                                        minHeight: 6,
                                      ),
                                    ),
                                  ],
                                );
                              }),
                            ],
                            const SizedBox(height: 10),
                            // Reviews remaining bar
                            Builder(builder: (context) {
                              final used = tenant.reviewsUsedThisMonth;
                              final max = tenant.maxReviewsPerMonth;
                              final remaining = (max - used).clamp(0, max);
                              final pct = max > 0 ? remaining / max : 0.0;
                              final revColor = remaining <= 50
                                  ? AppColors.error
                                  : remaining <= 150
                                      ? AppColors.warning
                                      : AppColors.success;
                              return Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(Icons.rate_review,
                                          size: 13, color: Colors.white70),
                                      const SizedBox(width: 6),
                                      Text(
                                        l10n.reviewsRemainingOf(
                                            remaining, max),
                                        style: const TextStyle(
                                          color: Colors.white70,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(4),
                                    child: LinearProgressIndicator(
                                      value: pct,
                                      backgroundColor:
                                          Colors.white.withValues(alpha: 0.12),
                                      valueColor:
                                          AlwaysStoppedAnimation(revColor),
                                      minHeight: 6,
                                    ),
                                  ),
                                ],
                              );
                            }),
                            // Upgrade button
                            if (tenant.package != 'enterprise') ...[
                              const SizedBox(height: 10),
                              GestureDetector(
                                onTap: () => context.push('/upgrade'),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color:
                                        Colors.white.withValues(alpha: 0.12),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                      color: Colors.white
                                          .withValues(alpha: 0.20),
                                    ),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.upgrade,
                                          size: 14, color: Colors.white),
                                      const SizedBox(width: 4),
                                      Text(
                                        l10n.upgradePackage,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 11,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                            // API Key
                            if (tenant.apiKey != null) ...[
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  Icon(Icons.key,
                                      color: AppColors.textSecondary,
                                      size: 16),
                                  const SizedBox(width: 6),
                                  Text(
                                    l10n.apiKey,
                                    style: const TextStyle(
                                      color: AppColors.textSecondary,
                                      fontSize: 12,
                                    ),
                                  ),
                                  const Spacer(),
                                  GestureDetector(
                                    onTap: () {
                                      Clipboard.setData(
                                        ClipboardData(
                                            text: tenant.apiKey!),
                                      );
                                      ScaffoldMessenger.of(context)
                                          .showSnackBar(
                                        SnackBar(
                                          content:
                                              Text(l10n.apiKeyCopied),
                                          backgroundColor:
                                              AppColors.success,
                                          duration: const Duration(
                                              seconds: 2),
                                        ),
                                      );
                                    },
                                    child: Container(
                                      padding:
                                          const EdgeInsets.symmetric(
                                        horizontal: 8,
                                        vertical: 4,
                                      ),
                                      decoration: BoxDecoration(
                                        color: Colors.white
                                            .withValues(alpha: 0.12),
                                        borderRadius:
                                            BorderRadius.circular(8),
                                        border: Border.all(
                                          color: Colors.white
                                              .withValues(alpha: 0.15),
                                        ),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Text(
                                            '${tenant.apiKey!.substring(0, 8)}...',
                                            style: const TextStyle(
                                              color:
                                                  AppColors.textPrimary,
                                              fontSize: 11,
                                              fontFamily: 'monospace',
                                            ),
                                          ),
                                          const SizedBox(width: 4),
                                          Icon(Icons.copy,
                                              color: AppColors
                                                  .textSecondary,
                                              size: 14),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ),
                  ),

                // Place IDs + Fetch Reviews + Add Business
                if (tenant != null) ...[
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          l10n.placeIds,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ),
                      SizedBox(
                        height: 32,
                        child: ElevatedButton.icon(
                          onPressed: _showAddBusinessDialog,
                          icon: const Icon(Icons.add, size: 16),
                          label: Text(l10n.addBusiness,
                              style: const TextStyle(fontSize: 12)),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12),
                            backgroundColor: AppColors.accentStart,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  if (tenant.placeIds.isEmpty &&
                      tenant.pendingPlaceIds.isEmpty)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: AppColors.glassDecoration(radius: 16),
                      child: Column(
                        children: [
                          Icon(Icons.storefront,
                              size: 40, color: AppColors.textMuted),
                          const SizedBox(height: 8),
                          Text(
                            l10n.noPlaces,
                            style: const TextStyle(
                              color: AppColors.textMuted,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                  // Confirmed place IDs
                  ...tenant.placeIds.map((placeId) => Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 10),
                        decoration:
                            AppColors.glassDecoration(radius: 12),
                        child: Row(
                          children: [
                            Icon(Icons.place,
                                size: 18,
                                color: AppColors.accentStart),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                placeId,
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontFamily: 'monospace',
                                  color: AppColors.textPrimary,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const Icon(Icons.check_circle,
                                size: 18, color: AppColors.success),
                          ],
                        ),
                      )),
                  // Pending place IDs
                  ...tenant.pendingPlaceIds.map((placeId) => Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: AppColors.warning
                              .withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: AppColors.warning
                                .withValues(alpha: 0.25),
                          ),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.place,
                                size: 18, color: AppColors.warning),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Column(
                                crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    placeId,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      fontFamily: 'monospace',
                                      color: AppColors.textPrimary,
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    l10n.pendingApproval,
                                    style: const TextStyle(
                                      fontSize: 10,
                                      color: AppColors.warning,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const Icon(Icons.hourglass_top,
                                size: 18, color: AppColors.warning),
                          ],
                        ),
                      )),
                  if (tenant.placeIds.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed:
                              _fetchingReviews ? null : _fetchReviews,
                          icon: _fetchingReviews
                              ? const SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white),
                                )
                              : const Icon(Icons.download_rounded),
                          label: Text(_fetchingReviews
                              ? l10n.fetchingReviews
                              : l10n.fetchReviews),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.accentStart,
                          ),
                        ),
                      ),
                    ),
                  const SizedBox(height: 16),

                  // Competitors section
                  CompetitorWidget(
                    competitorPlaceIds: tenant.competitorPlaceIds,
                    onChanged: () => ref.read(authProvider.notifier).refreshProfile(),
                  ),
                  const SizedBox(height: 16),

                  // Team management section
                  TeamManagementWidget(
                    currentUserRole: profile?.role ?? 'member',
                  ),
                  const SizedBox(height: 16),

                  // Invoices section
                  if (profile?.invoices != null && profile!.invoices!.isNotEmpty)
                    InvoicesWidget(invoices: profile.invoices!),
                  if (profile?.invoices != null && profile!.invoices!.isNotEmpty)
                    const SizedBox(height: 16),
                ],

                // Stats cards
                if (dashboard.isLoading && stats == null)
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 1.1,
                    children: const [
                      StatCardShimmer(),
                      StatCardShimmer(),
                      StatCardShimmer(),
                    ],
                  )
                else if (stats != null)
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 1.1,
                    children: [
                      FadeSlideIn(
                        delay: const Duration(milliseconds: 0),
                        child: StatCard(
                          label: l10n.totalReviews,
                          value: '${stats.totalReviews}',
                          icon: Icons.rate_review,
                          iconColor: AppColors.accentStart,
                        ),
                      ),
                      FadeSlideIn(
                        delay: const Duration(milliseconds: 100),
                        child: StatCard(
                          label: l10n.avgSentiment,
                          value: stats.avgSentiment != null
                              ? '${stats.avgSentiment!.toStringAsFixed(1)}/10'
                              : 'N/A',
                          icon: Icons.sentiment_satisfied,
                          iconColor: AppColors.success,
                        ),
                      ),
                      FadeSlideIn(
                        delay: const Duration(milliseconds: 200),
                        child: StatCard(
                          label: l10n.avgRating,
                          value: stats.avgRating?.toStringAsFixed(1) ??
                              'N/A',
                          icon: Icons.star,
                          iconColor: AppColors.warning,
                        ),
                      ),
                    ],
                  ),

                const SizedBox(height: 20),

                // Charts
                if (stats != null) ...[
                  BreakdownPieChart(
                    title: l10n.urgencyBreakdown,
                    data: stats.urgencyBreakdown,
                    colors: const [
                      AppColors.error,
                      AppColors.warning,
                      AppColors.success,
                    ],
                  ),
                  const SizedBox(height: 16),
                  BreakdownPieChart(
                    title: l10n.categoryBreakdown,
                    data: stats.categoryBreakdown,
                  ),
                  const SizedBox(height: 16),
                  BreakdownPieChart(
                    title: l10n.dialectBreakdown,
                    data: stats.dialectBreakdown,
                  ),
                  const SizedBox(height: 20),
                ],

                // Filter bar
                if (stats != null) ...[
                  FilterBar(
                    selectedCategory: dashboard.filters.category,
                    selectedUrgency: dashboard.filters.urgencyLevel,
                    selectedDialect: dashboard.filters.dialect,
                    categories:
                        stats.categoryBreakdown.keys.toList(),
                    urgencies:
                        stats.urgencyBreakdown.keys.toList(),
                    dialects:
                        stats.dialectBreakdown.keys.toList(),
                    onCategoryChanged: (v) {
                      ref
                          .read(dashboardProvider.notifier)
                          .updateFilters(
                            dashboard.filters
                                .copyWith(category: v),
                          );
                    },
                    onUrgencyChanged: (v) {
                      ref
                          .read(dashboardProvider.notifier)
                          .updateFilters(
                            dashboard.filters
                                .copyWith(urgencyLevel: v),
                          );
                    },
                    onDialectChanged: (v) {
                      ref
                          .read(dashboardProvider.notifier)
                          .updateFilters(
                            dashboard.filters
                                .copyWith(dialect: v),
                          );
                    },
                    onClear: () {
                      ref
                          .read(dashboardProvider.notifier)
                          .clearFilters();
                    },
                  ),
                  const SizedBox(height: 16),
                ],

                // Reviews header
                Text(
                  l10n.reviews,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),

                // Reviews list
                if (dashboard.isLoading && reviews.isEmpty)
                  Column(
                    children: List.generate(
                      3,
                      (_) => const ReviewCardShimmer(),
                    ),
                  )
                else if (reviews.isEmpty)
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Text(
                        l10n.noReviews,
                        style: const TextStyle(
                          color: AppColors.textMuted,
                          fontSize: 15,
                        ),
                      ),
                    ),
                  )
                else
                  Column(
                    children: reviews
                        .asMap()
                        .entries
                        .map((entry) => FadeSlideIn(
                              delay: Duration(
                                  milliseconds: entry.key * 80),
                              child: ReviewCard(
                                  review: entry.value),
                            ))
                        .toList(),
                  ),

                // Pagination
                if (dashboard.data != null &&
                    dashboard.data!.totalPages > 1)
                  Padding(
                    padding:
                        const EdgeInsets.symmetric(vertical: 16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        IconButton(
                          onPressed: dashboard.currentPage > 1
                              ? () => ref
                                  .read(
                                      dashboardProvider.notifier)
                                  .prevPage()
                              : null,
                          icon: const Icon(Icons.chevron_left),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 6),
                          decoration: AppColors.glassDecoration(
                              radius: 10),
                          child: Text(
                            l10n.page(
                              dashboard.currentPage,
                              dashboard.data!.totalPages,
                            ),
                            style: const TextStyle(
                              fontSize: 13,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ),
                        IconButton(
                          onPressed: dashboard.currentPage <
                                  dashboard.data!.totalPages
                              ? () => ref
                                  .read(
                                      dashboardProvider.notifier)
                                  .nextPage()
                              : null,
                          icon: const Icon(Icons.chevron_right),
                        ),
                      ],
                    ),
                  ),

                // Error
                if (dashboard.error != null)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(top: 12),
                    decoration: BoxDecoration(
                      color:
                          AppColors.error.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: AppColors.error
                            .withValues(alpha: 0.30),
                      ),
                    ),
                    child: Column(
                      children: [
                        Text(
                          dashboard.error!,
                          style: const TextStyle(
                              color: AppColors.error,
                              fontSize: 13),
                        ),
                        const SizedBox(height: 8),
                        TextButton(
                          onPressed: () => ref
                              .read(dashboardProvider.notifier)
                              .load(),
                          child: Text(l10n.retry),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
