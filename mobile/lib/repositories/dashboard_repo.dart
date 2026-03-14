import 'package:dio/dio.dart';
import '../core/dio_client.dart';
import '../models/dashboard.dart';

class DashboardRepository {
  final Dio _dio = dioClient;

  /// Fetch dashboard data with optional filters
  Future<DashboardResponse> fetchDashboard({
    int page = 1,
    int pageSize = 10,
    String? businessName,
    String? category,
    String? urgencyLevel,
    String? dialect,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'page_size': pageSize,
    };
    if (businessName != null && businessName.isNotEmpty) {
      queryParams['business_name'] = businessName;
    }
    if (category != null && category.isNotEmpty) {
      queryParams['category'] = category;
    }
    if (urgencyLevel != null && urgencyLevel.isNotEmpty) {
      queryParams['urgency_level'] = urgencyLevel;
    }
    if (dialect != null && dialect.isNotEmpty) {
      queryParams['dialect'] = dialect;
    }

    final response = await _dio.get(
      '/api/v1/dashboard',
      queryParameters: queryParams,
    );
    return DashboardResponse.fromJson(response.data as Map<String, dynamic>);
  }
}
