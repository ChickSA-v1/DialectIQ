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

class GlassCard extends StatefulWidget {
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

  @override
  State<GlassCard> createState() => _GlassCardState();
}

class _GlassCardState extends State<GlassCard> {
  bool _pressed = false;

  BoxDecoration _decoration() {
    switch (widget.variant) {
      case GlassVariant.standard:
        return BoxDecoration(
          color: Colors.white.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(widget.borderRadius),
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
          borderRadius: BorderRadius.circular(widget.borderRadius),
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
          borderRadius: BorderRadius.circular(widget.borderRadius),
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
          borderRadius: BorderRadius.circular(widget.borderRadius),
          border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final card = ClipRRect(
      borderRadius: BorderRadius.circular(widget.borderRadius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: widget.blur, sigmaY: widget.blur),
        child: GestureDetector(
          onTap: widget.onTap,
          onTapDown: widget.onTap != null
              ? (_) => setState(() => _pressed = true)
              : null,
          onTapUp: widget.onTap != null
              ? (_) => setState(() => _pressed = false)
              : null,
          onTapCancel: widget.onTap != null
              ? () => setState(() => _pressed = false)
              : null,
          child: Container(
            width: widget.width,
            height: widget.height,
            padding: widget.padding ?? const EdgeInsets.all(20),
            decoration: _decoration(),
            child: widget.child,
          ),
        ),
      ),
    );

    if (widget.onTap != null) {
      return AnimatedScale(
        scale: _pressed ? 0.98 : 1.0,
        duration: const Duration(milliseconds: 100),
        curve: Curves.easeOut,
        child: card,
      );
    }

    return card;
  }
}
