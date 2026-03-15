import 'package:flutter/material.dart';

class BreathingGlow extends StatefulWidget {
  final Widget child;
  final Color glowColor;
  final double minBlur;
  final double maxBlur;
  final Duration duration;

  const BreathingGlow({
    super.key,
    required this.child,
    required this.glowColor,
    this.minBlur = 12.0,
    this.maxBlur = 32.0,
    this.duration = const Duration(seconds: 2),
  });

  @override
  State<BreathingGlow> createState() => _BreathingGlowState();
}

class _BreathingGlowState extends State<BreathingGlow>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _blurRadius;
  late Animation<double> _opacity;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: widget.duration,
    )..repeat(reverse: true);

    final curved = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    );
    _blurRadius = Tween<double>(
      begin: widget.minBlur,
      end: widget.maxBlur,
    ).animate(curved);
    _opacity = Tween<double>(begin: 0.3, end: 0.6).animate(curved);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) => Container(
        decoration: BoxDecoration(
          shape: BoxShape.rectangle,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: widget.glowColor.withValues(alpha: _opacity.value),
              blurRadius: _blurRadius.value,
              spreadRadius: 2,
            ),
          ],
        ),
        child: child,
      ),
      child: widget.child,
    );
  }
}
