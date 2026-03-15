import 'package:flutter/material.dart';

class AnimatedCounter extends StatelessWidget {
  final String value;
  final TextStyle? style;
  final Duration duration;

  const AnimatedCounter({
    super.key,
    required this.value,
    this.style,
    this.duration = const Duration(milliseconds: 1200),
  });

  @override
  Widget build(BuildContext context) {
    final parsed = _parseValue(value);
    if (parsed == null) {
      return Text(value, style: style);
    }

    return TweenAnimationBuilder<double>(
      tween: Tween<double>(begin: 0.0, end: parsed.number),
      duration: duration,
      curve: Curves.easeOutCubic,
      builder: (context, animValue, child) {
        final formatted = _formatValue(animValue, parsed);
        return Text(formatted, style: style);
      },
    );
  }

  _ParsedValue? _parseValue(String input) {
    final trimmed = input.trim();

    // Try "X/Y" pattern (e.g., "4.5/10")
    final slashIndex = trimmed.indexOf('/');
    if (slashIndex > 0) {
      final num = double.tryParse(trimmed.substring(0, slashIndex));
      if (num != null) {
        return _ParsedValue(
          number: num,
          suffix: trimmed.substring(slashIndex),
          isDecimal: trimmed.substring(0, slashIndex).contains('.'),
          decimalPlaces: _getDecimalPlaces(trimmed.substring(0, slashIndex)),
        );
      }
    }

    // Try pure number with optional suffix (e.g., "127", "4.5", "89%")
    final match = RegExp(r'^([\d.]+)(.*)$').firstMatch(trimmed);
    if (match != null) {
      final numStr = match.group(1)!;
      final suffix = match.group(2) ?? '';
      final num = double.tryParse(numStr);
      if (num != null) {
        return _ParsedValue(
          number: num,
          suffix: suffix,
          isDecimal: numStr.contains('.'),
          decimalPlaces: _getDecimalPlaces(numStr),
        );
      }
    }

    return null;
  }

  int _getDecimalPlaces(String numStr) {
    final dotIndex = numStr.indexOf('.');
    if (dotIndex < 0) return 0;
    return numStr.length - dotIndex - 1;
  }

  String _formatValue(double animValue, _ParsedValue parsed) {
    final String formatted;
    if (parsed.isDecimal) {
      formatted = animValue.toStringAsFixed(parsed.decimalPlaces);
    } else {
      formatted = animValue.toInt().toString();
    }
    return '$formatted${parsed.suffix}';
  }
}

class _ParsedValue {
  final double number;
  final String suffix;
  final bool isDecimal;
  final int decimalPlaces;

  const _ParsedValue({
    required this.number,
    required this.suffix,
    required this.isDecimal,
    required this.decimalPlaces,
  });
}
