import 'package:dio/dio.dart';
import '../core/dio_client.dart';
import '../models/place.dart';
import '../models/dashboard.dart';

class TenantRepository {
  final Dio _dio = dioClient;

  /// Search Google Places by name
  Future<PlaceSearchResponse> searchPlaces(String query) async {
    final response = await _dio.get(
      '/api/v1/tenant/places/search',
      queryParameters: {'query': query},
    );
    return PlaceSearchResponse.fromJson(response.data as Map<String, dynamic>);
  }

  /// Confirm (add) a place ID to the tenant's account
  Future<Map<String, dynamic>> confirmPlaceId(String placeId) async {
    final response = await _dio.post(
      '/api/v1/tenant/places/confirm',
      data: {'place_id': placeId},
    );
    return response.data as Map<String, dynamic>;
  }

  /// Fetch reviews for a specific place
  Future<FetchReviewsResult> fetchReviews(String placeId) async {
    final response = await _dio.post(
      '/api/v1/tenant/places/$placeId/fetch-reviews',
    );
    return FetchReviewsResult.fromJson(response.data as Map<String, dynamic>);
  }

  /// Remove a place ID from the tenant's account
  Future<void> removePlaceId(String placeId) async {
    await _dio.delete('/api/v1/tenant/places/$placeId');
  }
}
