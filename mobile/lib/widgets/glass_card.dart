import 'dart:ui';
import 'package:flutter/material.dart';
import '../app/theme.dart';

/// Variants for glass card styling
enum GlassVariant {
  /// Default: subtle white 8% fill
  standard,

  /// Elevated: white 12% fill, brighter border
  medium,

  /// Accent: indigo→purple gradient tint
  accent,

  /// Dark: very subtle, almost transparent
  dark,
}

class GlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final double? width;
  final double? height;
  final double borderRadius;
  final double blur;
  final GlassVariant variant;
  final VoidCallback? onTap;

  const GlassCard({
    super.key,
    required this.child,
    this.padding,
    this.width,
    this.height,
    this.borderRadius = 20,
    this.blur = 12,
    this.variant = GlassVariant.standard,
    this.onTap,
  });

  BoxDecoration _decoration() {
    switch (variant) {
      case GlassVariant.standard:
        return BoxDecoration(
          color: Colors.white.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(borderRadius),
          border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
          boxShadow: [
            BoxShadow(
              color: AppColors.accentStart.withValues(alpha: 0.05),
              blurRadius: 20,
              offset: const Offset(0, 8),
            ),
          ],
        );
      case GlassVariant.medium:
        return BoxDecoration(
          color: Colors.white.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(borderRadius),
          border: Border.all(color: Colors.white.withValues(alpha: 0.20)),
          boxShadow: [
            BoxShadow(
              color: AppColors.accentStart.withValues(alpha: 0.08),
              blurRadius: 24,
              offset: const Offset(0, 8),
            ),
          ],
        );
      case GlassVariant.accent:
        return BoxDecoration(
          gradient: LinearGradient(
            colors: [
              AppColors.accentStart.withValues(alpha: 0.20),
              AppColors.accentEnd.withValues(alpha: 0.10),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(borderRadius),
          border:
              Border.all(color: AppColors.accentStart.withValues(alpha: 0.30)),
          boxShadow: [
            BoxShadow(
              color: AppColors.accentStart.withValues(alpha: 0.15),
              blurRadius: 24,
              offset: const Offset(0, 8),
            ),
          ],
        );
      case GlassVariant.dark:
        return BoxDecoration(
          color: Colors.white.withValues(alpha: 0.04),
          borderRadius: BorderRadius.circular(borderRadius),
          border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
        child: GestureDetector(
          onTap: onTap,
          child: Container(
            width: width,
            height: height,
            padding: padding ?? const EdgeInsets.all(20),
            decoration: _decoration(),
            child: child,
          ),
        ),
      ),
    );
  }
}
