import 'package:flutter/material.dart';
import '../app/theme.dart';
import '../widgets/animated_glass_background.dart';
import '../widgets/breathing_glow.dart';
import '../widgets/fade_slide_in.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgStart,
      body: AnimatedGlassBackground(
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Animated glass logo with breathing glow + scale entrance
              TweenAnimationBuilder<double>(
                tween: Tween(begin: 0.0, end: 1.0),
                duration: const Duration(milliseconds: 800),
                curve: Curves.elasticOut,
                builder: (context, value, child) {
                  return Opacity(
                    opacity: value.clamp(0.0, 1.0),
                    child: Transform.scale(
                      scale: 0.5 + (value * 0.5),
                      child: child,
                    ),
                  );
                },
                child: BreathingGlow(
                  glowColor: AppColors.vibrantCyan,
                  minBlur: 16,
                  maxBlur: 36,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(24),
                    child: Image.asset(
                      'assets/images/logo.png',
                      width: 88,
                      height: 88,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 28),

              // Title fades in after logo
              FadeSlideIn(
                delay: const Duration(milliseconds: 400),
                child: const Text(
                  'DialectIQ',
                  style: TextStyle(
                    fontSize: 34,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    letterSpacing: 2,
                  ),
                ),
              ),
              const SizedBox(height: 36),

              // Spinner fades in last
              FadeSlideIn(
                delay: const Duration(milliseconds: 800),
                child: SizedBox(
                  width: 28,
                  height: 28,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.5,
                    valueColor: AlwaysStoppedAnimation(
                      AppColors.accentStart.withValues(alpha: 0.7),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
