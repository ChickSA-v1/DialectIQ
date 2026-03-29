import 'package:dio/dio.dart';
import '../core/dio_client.dart';
import '../models/place.dart';
import '../models/dashboard.dart';
import '../models/user.dart';

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

  // Team management
  Future<List<TeamMember>> getTeamMembers() async {
    final response = await _dio.get('/api/v1/tenant/team');
    final list = response.data as List<dynamic>;
    return list.map((e) => TeamMember.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<void> inviteTeamMember({
    required String email,
    required String fullName,
    required String password,
  }) async {
    await _dio.post('/api/v1/tenant/team/invite', data: {
      'email': email,
      'full_name': fullName,
      'password': password,
    });
  }

  Future<void> removeTeamMember(String memberId) async {
    await _dio.delete('/api/v1/tenant/team/$memberId');
  }

  // Competitor tracking
  Future<Map<String, dynamic>> addCompetitor(String placeId) async {
    final response = await _dio.post('/api/v1/tenant/add-competitor', data: {'place_id': placeId});
    return response.data as Map<String, dynamic>;
  }

  Future<void> removeCompetitor(String placeId) async {
    await _dio.delete('/api/v1/tenant/remove-competitor/$placeId');
  }

  // Invoice PDF download - returns bytes
  Future<List<int>> downloadInvoicePdf(String invoiceId) async {
    final response = await _dio.get(
      '/api/v1/payments/invoice/$invoiceId/pdf',
      options: Options(responseType: ResponseType.bytes),
    );
    return response.data as List<int>;
  }

  // Bank transfer receipt upload
  Future<void> uploadBankTransfer(String invoiceId, List<int> fileBytes, String fileName) async {
    final formData = FormData.fromMap({
      'invoice_id': invoiceId,
      'receipt': MultipartFile.fromBytes(fileBytes, filename: fileName),
    });
    await _dio.post('/api/v1/payments/bank-transfer', data: formData);
  }
}
