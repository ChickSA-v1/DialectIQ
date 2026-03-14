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
import '../../widgets/stat_card.dart';
import '../../widgets/review_card.dart';
import '../../widgets/chart_widgets.dart';
import '../../widgets/filter_bar.dart';
import '../../widgets/loading_shimmer.dart';
import '../../widgets/locale_switcher.dart';

class ActiveDashboard extends ConsumerStatefulWidget {
  const ActiveDashboard({super.key});

  @override
  ConsumerState<ActiveDashboard> createState() => _ActiveDashboardState();
}

class _ActiveDashboardState extends ConsumerState<ActiveDashboard> {
  final _tenantRepo = TenantRepository();
  bool _fetchingReviews = false;

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(dashboardProvider.notifier).load();
    });
  }

  Future<void> _fetchReviews(String placeId) async {
    setState(() => _fetchingReviews = true);
    try {
      final result = await _tenantRepo.fetchReviews(placeId);
      if (mounted) {
        final l10n = AppLocalizations.of(context)!;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(l10n.reviewsFetched(result.reviewsNew)),
            backgroundColor: AppColors.success,
          ),
        );
        ref.read(dashboardProvider.notifier).load();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString()),
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
    final tenant = ref.watch(tenantProvider);
    final dashboard = ref.watch(dashboardProvider);
    final stats = dashboard.data?.stats;
    final reviews = dashboard.data?.reviews ?? [];

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.dashboard),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 4),
            child: const LocaleSwitcher(),
          ),
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () => context.push('/settings'),
          ),
        ],
      ),
      body: RefreshIndicator(
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
              // Subscription info
              if (tenant != null)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    gradient: AppColors.gradient,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            l10n.subscription,
                            style: const TextStyle(
                              color: Colors.white70,
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
                              color: Colors.white.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(12),
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
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      // Progress bar
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: tenant.maxReviewsPerMonth > 0
                              ? tenant.reviewsUsedThisMonth /
                                  tenant.maxReviewsPerMonth
                              : 0,
                          backgroundColor: Colors.white.withValues(alpha: 0.2),
                          valueColor:
                              const AlwaysStoppedAnimation(Colors.white),
                          minHeight: 6,
                        ),
                      ),
                      // API Key
                      if (tenant.apiKey != null) ...[
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            const Icon(Icons.key, color: Colors.white70, size: 16),
                            const SizedBox(width: 6),
                            Text(
                              l10n.apiKey,
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 12,
                              ),
                            ),
                            const Spacer(),
                            GestureDetector(
                              onTap: () {
                                Clipboard.setData(
                                  ClipboardData(text: tenant.apiKey!),
                                );
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(l10n.apiKeyCopied),
                                    backgroundColor: AppColors.success,
                                    duration: const Duration(seconds: 2),
                                  ),
                                );
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      '${tenant.apiKey!.substring(0, 8)}...',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 11,
                                        fontFamily: 'monospace',
                                      ),
                                    ),
                                    const SizedBox(width: 4),
                                    const Icon(Icons.copy,
                                        color: Colors.white70, size: 14),
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

              // Place IDs + Fetch Reviews
              if (tenant != null && tenant.placeIds.isNotEmpty) ...[
                Text(
                  l10n.placeIds,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                ...tenant.placeIds.map((placeId) => Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.place,
                              size: 18, color: AppColors.primary),
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
                          SizedBox(
                            height: 30,
                            child: ElevatedButton.icon(
                              onPressed: _fetchingReviews
                                  ? null
                                  : () => _fetchReviews(placeId),
                              icon: _fetchingReviews
                                  ? const SizedBox(
                                      width: 14,
                                      height: 14,
                                      child: CircularProgressIndicator(
                                          strokeWidth: 2),
                                    )
                                  : const Icon(Icons.download, size: 14),
                              label: Text(
                                l10n.fetchReviews,
                                style: const TextStyle(fontSize: 11),
                              ),
                              style: ElevatedButton.styleFrom(
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 10),
                              ),
                            ),
                          ),
                        ],
                      ),
                    )),
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
                    StatCard(
                      label: l10n.totalReviews,
                      value: '${stats.totalReviews}',
                      icon: Icons.rate_review,
                      iconColor: AppColors.primary,
                    ),
                    StatCard(
                      label: l10n.avgSentiment,
                      value: stats.avgSentiment != null
                          ? '${(stats.avgSentiment! * 100).toInt()}%'
                          : 'N/A',
                      icon: Icons.sentiment_satisfied,
                      iconColor: AppColors.success,
                    ),
                    StatCard(
                      label: l10n.avgRating,
                      value: stats.avgRating?.toStringAsFixed(1) ?? 'N/A',
                      icon: Icons.star,
                      iconColor: AppColors.warning,
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
                  categories: stats.categoryBreakdown.keys.toList(),
                  urgencies: stats.urgencyBreakdown.keys.toList(),
                  dialects: stats.dialectBreakdown.keys.toList(),
                  onCategoryChanged: (v) {
                    ref.read(dashboardProvider.notifier).updateFilters(
                          dashboard.filters.copyWith(category: v),
                        );
                  },
                  onUrgencyChanged: (v) {
                    ref.read(dashboardProvider.notifier).updateFilters(
                          dashboard.filters.copyWith(urgencyLevel: v),
                        );
                  },
                  onDialectChanged: (v) {
                    ref.read(dashboardProvider.notifier).updateFilters(
                          dashboard.filters.copyWith(dialect: v),
                        );
                  },
                  onClear: () {
                    ref.read(dashboardProvider.notifier).clearFilters();
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
                      .map((r) => ReviewCard(review: r))
                      .toList(),
                ),

              // Pagination
              if (dashboard.data != null && dashboard.data!.totalPages > 1)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      IconButton(
                        onPressed: dashboard.currentPage > 1
                            ? () => ref
                                .read(dashboardProvider.notifier)
                                .prevPage()
                            : null,
                        icon: const Icon(Icons.chevron_left),
                      ),
                      Text(
                        l10n.page(
                          dashboard.currentPage,
                          dashboard.data!.totalPages,
                        ),
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      IconButton(
                        onPressed:
                            dashboard.currentPage < dashboard.data!.totalPages
                                ? () => ref
                                    .read(dashboardProvider.notifier)
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
                    color: AppColors.error.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Column(
                    children: [
                      Text(
                        dashboard.error!,
                        style: const TextStyle(
                            color: AppColors.error, fontSize: 13),
                      ),
                      const SizedBox(height: 8),
                      TextButton(
                        onPressed: () =>
                            ref.read(dashboardProvider.notifier).load(),
                        child: Text(l10n.retry),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
