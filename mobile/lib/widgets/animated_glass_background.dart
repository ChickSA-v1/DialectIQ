import 'dart:math' as math;
import 'dart:ui';

import 'package:flutter/material.dart';

import '../app/theme.dart';

class AnimatedGlassBackground extends StatefulWidget {
  final Widget child;

  const AnimatedGlassBackground({super.key, required this.child});

  @override
  State<AnimatedGlassBackground> createState() =>
      _AnimatedGlassBackgroundState();
}

class _AnimatedGlassBackgroundState extends State<AnimatedGlassBackground>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 30),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(gradient: AppColors.bgGradient),
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return CustomPaint(
            painter: _OrbPainter(
              time: _controller.value,
              size: MediaQuery.of(context).size,
            ),
            child: child,
          );
        },
        child: widget.child,
      ),
    );
  }
}

class _Orb {
  final double centerXFraction;
  final double centerYFraction;
  final double radius;
  final Color color;
  final double phase;
  final double speedX;
  final double speedY;
  final double amplitudeX;
  final double amplitudeY;

  const _Orb({
    required this.centerXFraction,
    required this.centerYFraction,
    required this.radius,
    required this.color,
    required this.phase,
    required this.speedX,
    required this.speedY,
    required this.amplitudeX,
    required this.amplitudeY,
  });
}

class _OrbPainter extends CustomPainter {
  final double time;
  final Size size;

  static final List<_Orb> _orbs = [
    _Orb(
      centerXFraction: 0.2,
      centerYFraction: 0.3,
      radius: 200,
      color: AppColors.accentStart.withValues(alpha: 0.07),
      phase: 0,
      speedX: 1.0,
      speedY: 0.7,
      amplitudeX: 60,
      amplitudeY: 40,
    ),
    _Orb(
      centerXFraction: 0.8,
      centerYFraction: 0.2,
      radius: 180,
      color: AppColors.accentEnd.withValues(alpha: 0.06),
      phase: math.pi * 0.5,
      speedX: 0.8,
      speedY: 1.2,
      amplitudeX: 50,
      amplitudeY: 55,
    ),
    _Orb(
      centerXFraction: 0.5,
      centerYFraction: 0.7,
      radius: 220,
      color: const Color(0xFF2DD4BF).withValues(alpha: 0.05),
      phase: math.pi,
      speedX: 1.3,
      speedY: 0.6,
      amplitudeX: 70,
      amplitudeY: 35,
    ),
    _Orb(
      centerXFraction: 0.7,
      centerYFraction: 0.8,
      radius: 160,
      color: const Color(0xFF8B5CF6).withValues(alpha: 0.06),
      phase: math.pi * 1.5,
      speedX: 0.6,
      speedY: 1.0,
      amplitudeX: 45,
      amplitudeY: 50,
    ),
  ];

  _OrbPainter({required this.time, required this.size});

  @override
  void paint(Canvas canvas, Size canvasSize) {
    final t = time * 2 * math.pi;

    for (final orb in _orbs) {
      final cx = orb.centerXFraction * size.width +
          orb.amplitudeX * math.sin(t * orb.speedX + orb.phase);
      final cy = orb.centerYFraction * size.height +
          orb.amplitudeY * math.cos(t * orb.speedY + orb.phase);

      final paint = Paint()
        ..shader = RadialGradient(
          colors: [
            orb.color,
            orb.color.withValues(alpha: 0),
          ],
          stops: const [0.0, 1.0],
        ).createShader(
          Rect.fromCircle(center: Offset(cx, cy), radius: orb.radius),
        )
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 60);

      canvas.drawCircle(Offset(cx, cy), orb.radius, paint);
    }
  }

  @override
  bool shouldRepaint(_OrbPainter oldDelegate) => oldDelegate.time != time;
}
