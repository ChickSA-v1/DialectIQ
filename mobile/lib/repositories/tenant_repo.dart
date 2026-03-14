import 'package:dio/dio.dart';
import '../core/dio_client.dart';
import '../models/place.dart';
import '../models/dashboard.dart';

class TenantRepository {
  final Dio _dio = dioClient;

  /// Search Google Places by name or Google Maps URL
  Future<PlaceSearchResponse> searchPlaces(String query) async {
    final response = await _dio.post(
      '/api/v1/tenant/search-places',
      data: {'query': query},
    );
    return PlaceSearchResponse.fromJson(response.data as Map<String, dynamic>);
  }

  /// Confirm (add) a place ID to the tenant's account
  Future<Map<String, dynamic>> confirmPlaceId(String placeId) async {
    final response = await _dio.post(
      '/api/v1/tenant/confirm-place-id',
      data: {'place_id': placeId},
    );
    return response.data as Map<String, dynamic>;
  }

  /// Fetch reviews for all tenant place IDs
  Future<List<FetchReviewsResult>> fetchReviews() async {
    final response = await _dio.post(
      '/api/v1/tenant/fetch-reviews',
    );
    final list = response.data as List<dynamic>;
    return list
        .map((e) => FetchReviewsResult.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
