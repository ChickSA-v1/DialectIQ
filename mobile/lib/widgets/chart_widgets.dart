import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../app/theme.dart';

class BreakdownPieChart extends StatelessWidget {
  final String title;
  final Map<String, int> data;
  final List<Color>? colors;

  const BreakdownPieChart({
    super.key,
    required this.title,
    required this.data,
    this.colors,
  });

  static const _defaultColors = [
    Color(0xFF4F46E5),
    Color(0xFF7C3AED),
    Color(0xFF10B981),
    Color(0xFFF59E0B),
    Color(0xFFEF4444),
    Color(0xFF3B82F6),
    Color(0xFFEC4899),
    Color(0xFF8B5CF6),
    Color(0xFF14B8A6),
    Color(0xFFF97316),
  ];

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) {
      return const SizedBox.shrink();
    }

    final total = data.values.fold(0, (a, b) => a + b);
    final colorList = colors ?? _defaultColors;
    int colorIndex = 0;

    final sections = data.entries.map((e) {
      final color = colorList[colorIndex % colorList.length];
      colorIndex++;
      final pct = total > 0 ? (e.value / total * 100) : 0.0;
      return PieChartSectionData(
        value: e.value.toDouble(),
        color: color,
        radius: 50,
        title: '${pct.toInt()}%',
        titleStyle: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      );
    }).toList();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 15,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 160,
            child: PieChart(
              PieChartData(
                sections: sections,
                centerSpaceRadius: 30,
                sectionsSpace: 2,
              ),
            ),
          ),
          const SizedBox(height: 12),
          // Legend
          Wrap(
            spacing: 12,
            runSpacing: 6,
            children: () {
              int legendIndex = 0;
              return data.entries.map((e) {
                final color = colorList[legendIndex % colorList.length];
                legendIndex++;
                return Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                        color: color,
                        borderRadius: BorderRadius.circular(3),
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${e.key} (${e.value})',
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                );
              }).toList();
            }(),
          ),
        ],
      ),
    );
  }
}
