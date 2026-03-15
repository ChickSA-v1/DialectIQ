import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:dialectiq/l10n/app_localizations.dart';

import '../../app/theme.dart';
import '../../widgets/breathing_glow.dart';
import '../../widgets/fade_slide_in.dart';
import '../../widgets/gradient_button.dart';

class StepSuccess extends StatelessWidget {
  const StepSuccess({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Animated success icon with elastic scale + breathing glow
          TweenAnimationBuilder<double>(
            tween: Tween(begin: 0.0, end: 1.0),
            duration: const Duration(milliseconds: 800),
            curve: Curves.elasticOut,
            builder: (context, value, child) {
              return Opacity(
                opacity: value.clamp(0.0, 1.0),
                child: Transform.scale(
                  scale: value,
                  child: child,
                ),
              );
            },
            child: BreathingGlow(
              glowColor: AppColors.success,
              minBlur: 16,
              maxBlur: 36,
              child: Container(
                width: 88,
                height: 88,
                decoration: BoxDecoration(
                  color: AppColors.success.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_circle,
                  size: 52,
                  color: AppColors.success,
                ),
              ),
            ),
          ),
          const SizedBox(height: 28),

          FadeSlideIn(
            delay: const Duration(milliseconds: 300),
            child: Text(
              l10n.regSuccess,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 12),

          FadeSlideIn(
            delay: const Duration(milliseconds: 500),
            child: Text(
              l10n.regSuccessMsg,
              style: const TextStyle(
                fontSize: 15,
                color: AppColors.textSecondary,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 36),

          FadeSlideIn(
            delay: const Duration(milliseconds: 700),
            child: GradientButton(
              label: l10n.goToLogin,
              icon: Icons.login,
              onPressed: () => context.go('/login'),
            ),
          ),
        ],
      ),
    );
  }
}
