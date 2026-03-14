import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/dashboard.dart';
import '../repositories/dashboard_repo.dart';

/// Dashboard filters
class DashboardFilters {
  final String? businessName;
  final String? category;
  final String? urgencyLevel;
  final String? dialect;

  const DashboardFilters({
    this.businessName,
    this.category,
    this.urgencyLevel,
    this.dialect,
  });

  DashboardFilters copyWith({
    String? businessName,
    String? category,
    String? urgencyLevel,
    String? dialect,
  }) =>
      DashboardFilters(
        businessName: businessName ?? this.businessName,
        category: category ?? this.category,
        urgencyLevel: urgencyLevel ?? this.urgencyLevel,
        dialect: dialect ?? this.dialect,
      );

  /// Clear all filters
  DashboardFilters clear() => const DashboardFilters();
}

/// Dashboard state
class DashboardState {
  final bool isLoading;
  final DashboardResponse? data;
  final String? error;
  final int currentPage;
  final DashboardFilters filters;

  const DashboardState({
    this.isLoading = false,
    this.data,
    this.error,
    this.currentPage = 1,
    this.filters = const DashboardFilters(),
  });

  DashboardState copyWith({
    bool? isLoading,
    DashboardResponse? data,
    String? error,
    int? currentPage,
    DashboardFilters? filters,
  }) =>
      DashboardState(
        isLoading: isLoading ?? this.isLoading,
        data: data ?? this.data,
        error: error,
        currentPage: currentPage ?? this.currentPage,
        filters: filters ?? this.filters,
      );
}

/// Dashboard notifier
class DashboardNotifier extends StateNotifier<DashboardState> {
  final DashboardRepository _repo = DashboardRepository();

  DashboardNotifier() : super(const DashboardState());

  Future<void> load({int page = 1}) async {
    state = state.copyWith(isLoading: true, error: null, currentPage: page);
    try {
      final data = await _repo.fetchDashboard(
        page: page,
        businessName: state.filters.businessName,
        category: state.filters.category,
        urgencyLevel: state.filters.urgencyLevel,
        dialect: state.filters.dialect,
      );
      state = state.copyWith(isLoading: false, data: data);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void updateFilters(DashboardFilters filters) {
    state = state.copyWith(filters: filters);
    load(); // reload with new filters
  }

  void clearFilters() {
    state = state.copyWith(filters: const DashboardFilters());
    load();
  }

  void nextPage() {
    final total = state.data?.totalPages ?? 1;
    if (state.currentPage < total) {
      load(page: state.currentPage + 1);
    }
  }

  void prevPage() {
    if (state.currentPage > 1) {
      load(page: state.currentPage - 1);
    }
  }
}

final dashboardProvider =
    StateNotifierProvider<DashboardNotifier, DashboardState>(
  (ref) => DashboardNotifier(),
);
