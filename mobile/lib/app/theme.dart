import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../widgets/animated_glass_background.dart';

/// DialectIQ Design System — Brand Identity
class AppColors {
  // ── Primary Colors ──
  static const deepNavy = Color(0xFF0B1B3D);       // Deep Navy
  static const vibrantCyan = Color(0xFF00D2DF);     // Vibrant Cyan

  // ── Secondary / Accent Colors ──
  static const goldenYellow = Color(0xFFFBBF24);    // Golden Yellow
  static const emeraldGreen = Color(0xFF10B981);     // Emerald Green
  static const coralRed = Color(0xFFF43F5E);         // Coral Red

  // ── Neutral Colors ──
  static const slateText = Color(0xFF334155);        // Slate Text
  static const lightBg = Color(0xFFF8FAFC);          // Light Background
  static const pureWhite = Color(0xFFFFFFFF);        // Pure White

  // ── Background gradient ──
  static const bgStart = Color(0xFF0B1B3D);          // Deep Navy
  static const bgEnd = Color(0xFF091530);            // Deeper Navy
  static const bgGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [bgStart, bgEnd],
  );

  // ── Accent gradient (Cyan → Golden) ──
  static const accentStart = Color(0xFF00D2DF);      // Vibrant Cyan
  static const accentEnd = Color(0xFFFBBF24);        // Golden Yellow
  static const gradient = LinearGradient(
    colors: [accentStart, accentEnd],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // ── Legacy aliases ──
  static const primary = vibrantCyan;
  static const primaryStart = vibrantCyan;
  static const primaryEnd = goldenYellow;
  static const primaryLight = Color(0xFF0E2247);     // Dark navy for subtle bg

  // ── Glass tokens ──
  static final glassWhite = Colors.white.withValues(alpha: 0.08);
  static final glassMedium = Colors.white.withValues(alpha: 0.12);
  static final glassBorder = Colors.white.withValues(alpha: 0.15);
  static final glassHighlight = Colors.white.withValues(alpha: 0.20);

  // ── Semantic colors ──
  static const success = Color(0xFF10B981);           // Emerald Green
  static const error = Color(0xFFF43F5E);             // Coral Red
  static const warning = Color(0xFFFBBF24);           // Golden Yellow

  // ── Text on dark background ──
  static const textPrimary = Color(0xFFF1F5F9);
  static const textSecondary = Color(0xFF94A3B8);
  static const textMuted = Color(0xFF64748B);

  // ── Surface & borders (glass-aware) ──
  static const surface = Color(0xFF0B1B3D);
  static final cardBg = Colors.white.withValues(alpha: 0.08);
  static final border = Colors.white.withValues(alpha: 0.15);

  // ── Preset decorations ──

  /// Standard glass card decoration
  static BoxDecoration glassDecoration({
    double radius = 20,
    bool withShadow = false,
  }) =>
      BoxDecoration(
        color: glassWhite,
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: glassBorder),
        boxShadow: withShadow
            ? [
                BoxShadow(
                  color: accentStart.withValues(alpha: 0.08),
                  blurRadius: 24,
                  offset: const Offset(0, 8),
                ),
              ]
            : null,
      );

  /// Medium-elevated glass decoration
  static BoxDecoration glassMediumDecoration({double radius = 20}) =>
      BoxDecoration(
        color: glassMedium,
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: glassHighlight),
      );

  /// Accent glass decoration (for selected/active items)
  static BoxDecoration accentGlassDecoration({double radius = 20}) =>
      BoxDecoration(
        gradient: LinearGradient(
          colors: [
            accentStart.withValues(alpha: 0.20),
            accentEnd.withValues(alpha: 0.10),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: accentStart.withValues(alpha: 0.30)),
      );
}

/// Reusable dark gradient scaffold background
class GlassScaffold extends StatelessWidget {
  final Widget child;
  final PreferredSizeWidget? appBar;
  final Widget? floatingActionButton;

  const GlassScaffold({
    super.key,
    required this.child,
    this.appBar,
    this.floatingActionButton,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: AppColors.bgStart,
      appBar: appBar,
      floatingActionButton: floatingActionButton,
      body: AnimatedGlassBackground(child: child),
    );
  }
}

/// App theme — dark glassmorphism
ThemeData appTheme() {
  final base = ThemeData.dark(useMaterial3: true);
  final textTheme = GoogleFonts.zainTextTheme(base.textTheme).apply(
    bodyColor: AppColors.textPrimary,
    displayColor: AppColors.textPrimary,
  );

  return base.copyWith(
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      brightness: Brightness.dark,
      surface: AppColors.bgStart,
    ),
    scaffoldBackgroundColor: AppColors.bgStart,
    textTheme: textTheme,
    appBarTheme: AppBarTheme(
      backgroundColor: Colors.transparent,
      foregroundColor: AppColors.textPrimary,
      elevation: 0,
      scrolledUnderElevation: 0,
      titleTextStyle: textTheme.titleLarge?.copyWith(
        fontWeight: FontWeight.bold,
        color: AppColors.textPrimary,
      ),
    ),
    cardTheme: CardThemeData(
      color: AppColors.cardBg,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(color: AppColors.border),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        textStyle: textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w600),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.textPrimary,
        side: BorderSide(color: AppColors.border),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.glassWhite,
      hintStyle: const TextStyle(color: AppColors.textMuted),
      labelStyle: const TextStyle(color: AppColors.textSecondary),
      prefixIconColor: AppColors.textSecondary,
      suffixIconColor: AppColors.textSecondary,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: AppColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: AppColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.accentStart, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.error),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.error, width: 2),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    ),
    dialogTheme: DialogThemeData(
      backgroundColor: AppColors.bgEnd,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(color: AppColors.border),
      ),
    ),
    snackBarTheme: SnackBarThemeData(
      backgroundColor: AppColors.glassMedium,
      contentTextStyle: const TextStyle(color: AppColors.textPrimary),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      behavior: SnackBarBehavior.floating,
    ),
    dividerColor: AppColors.border,
    iconTheme: const IconThemeData(color: AppColors.textSecondary),
  );
}
