import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:dialectiq/l10n/app_localizations.dart';
import '../../app/theme.dart';
import '../../core/constants.dart';
import '../../widgets/fade_slide_in.dart';

class StepPackage extends StatelessWidget {
  final String selectedPackage;
  final ValueChanged<String> onSelect;

  const StepPackage({
    super.key,
    required this.selectedPackage,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    final packages = [
      _PackageInfo(
        key: 'basic',
        name: l10n.packageBasic,
        price: packagePrices['basic']!,
        maxBiz: packageLimits['basic']!['max_businesses']!,
        maxReviews: packageLimits['basic']!['max_reviews']!,
        icon: Icons.star_outline,
        color: AppColors.accentStart,
      ),
      _PackageInfo(
        key: 'advanced',
        name: l10n.packageAdvanced,
        price: packagePrices['advanced']!,
        maxBiz: packageLimits['advanced']!['max_businesses']!,
        maxReviews: packageLimits['advanced']!['max_reviews']!,
        icon: Icons.star_half,
        color: AppColors.accentEnd,
      ),
      _PackageInfo(
        key: 'enterprise',
        name: l10n.packageEnterprise,
        price: packagePrices['enterprise']!,
        maxBiz: packageLimits['enterprise']!['max_businesses']!,
        maxReviews: packageLimits['enterprise']!['max_reviews']!,
        icon: Icons.star,
        color: AppColors.warning,
      ),
    ];

    return ListView.builder(
      padding: const EdgeInsets.all(24),
      itemCount: packages.length,
      itemBuilder: (context, index) {
        final pkg = packages[index];
        final isSelected = pkg.key == selectedPackage;

        return FadeSlideIn(
          delay: Duration(milliseconds: index * 150),
          child: GestureDetector(
          onTap: () => onSelect(pkg.key),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            margin: const EdgeInsets.only(bottom: 16),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: isSelected
                      ? BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              pkg.color.withValues(alpha: 0.20),
                              pkg.color.withValues(alpha: 0.08),
                            ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: pkg.color.withValues(alpha: 0.40),
                            width: 2,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: pkg.color.withValues(alpha: 0.20),
                              blurRadius: 20,
                              offset: const Offset(0, 6),
                            ),
                          ],
                        )
                      : AppColors.glassDecoration(radius: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  pkg.color.withValues(alpha: 0.25),
                                  pkg.color.withValues(alpha: 0.10),
                                ],
                              ),
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: [
                                BoxShadow(
                                  color: pkg.color.withValues(alpha: 0.20),
                                  blurRadius: 10,
                                ),
                              ],
                            ),
                            child: Icon(pkg.icon, color: pkg.color),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              pkg.name,
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textPrimary,
                              ),
                            ),
                          ),
                          if (isSelected)
                            Icon(Icons.check_circle, color: pkg.color),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Text(
                        '${pkg.price.toInt()} ${l10n.sarMonth}',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: pkg.color,
                        ),
                      ),
                      const SizedBox(height: 10),
                      _featureRow(
                          Icons.business, l10n.maxBusinesses(pkg.maxBiz)),
                      const SizedBox(height: 6),
                      _featureRow(
                          Icons.rate_review, l10n.maxReviews(pkg.maxReviews)),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
        );
      },
    );
  }

  Widget _featureRow(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppColors.textSecondary),
        const SizedBox(width: 8),
        Text(
          text,
          style:
              const TextStyle(fontSize: 13, color: AppColors.textSecondary),
        ),
      ],
    );
  }
}

class _PackageInfo {
  final String key;
  final String name;
  final double price;
  final int maxBiz;
  final int maxReviews;
  final IconData icon;
  final Color color;

  _PackageInfo({
    required this.key,
    required this.name,
    required this.price,
    required this.maxBiz,
    required this.maxReviews,
    required this.icon,
    required this.color,
  });
}
