import 'package:flutter/material.dart';
import 'package:dialectiq/l10n/app_localizations.dart';
import '../../app/theme.dart';
import '../../core/constants.dart';

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
        color: AppColors.primary,
      ),
      _PackageInfo(
        key: 'advanced',
        name: l10n.packageAdvanced,
        price: packagePrices['advanced']!,
        maxBiz: packageLimits['advanced']!['max_businesses']!,
        maxReviews: packageLimits['advanced']!['max_reviews']!,
        icon: Icons.star_half,
        color: const Color(0xFF7C3AED),
      ),
      _PackageInfo(
        key: 'enterprise',
        name: l10n.packageEnterprise,
        price: packagePrices['enterprise']!,
        maxBiz: packageLimits['enterprise']!['max_businesses']!,
        maxReviews: packageLimits['enterprise']!['max_reviews']!,
        icon: Icons.star,
        color: const Color(0xFFF59E0B),
      ),
    ];

    return ListView.builder(
      padding: const EdgeInsets.all(24),
      itemCount: packages.length,
      itemBuilder: (context, index) {
        final pkg = packages[index];
        final isSelected = pkg.key == selectedPackage;

        return GestureDetector(
          onTap: () => onSelect(pkg.key),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isSelected ? pkg.color : AppColors.border,
                width: isSelected ? 2 : 1,
              ),
              boxShadow: isSelected
                  ? [
                      BoxShadow(
                        color: pkg.color.withValues(alpha: 0.15),
                        blurRadius: 16,
                        offset: const Offset(0, 4),
                      ),
                    ]
                  : null,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: pkg.color.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(pkg.icon, color: pkg.color),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        pkg.name,
                        style: TextStyle(
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
                _featureRow(Icons.business, l10n.maxBusinesses(pkg.maxBiz)),
                const SizedBox(height: 6),
                _featureRow(Icons.rate_review, l10n.maxReviews(pkg.maxReviews)),
              ],
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
          style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
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
