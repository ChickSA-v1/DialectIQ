import 'dart:io';
import 'package:dio/dio.dart';
import '../core/dio_client.dart';
import '../models/user.dart';

class AuthRepository {
  final Dio _dio = dioClient;

  /// Login with email + password
  Future<LoginResponse> login(String email, String password) async {
    final response = await _dio.post(
      '/api/v1/auth/login',
      data: {'email': email, 'password': password},
    );
    return LoginResponse.fromJson(response.data as Map<String, dynamic>);
  }

  /// Register a new tenant (step 1)
  Future<Map<String, dynamic>> register({
    required String nameAr,
    String? nameEn,
    required String fullName,
    required String email,
    required String phone,
    required String password,
    required String package,
  }) async {
    final response = await _dio.post('/api/v1/auth/register', data: {
      'business_name_ar': nameAr,
      'business_name_en': nameEn,
      'full_name': fullName,
      'email': email,
      'phone': phone,
      'password': password,
      'package': package,
    });
    return response.data as Map<String, dynamic>;
  }

  /// Upload a document (commercial registration / national ID)
  Future<Map<String, dynamic>> uploadDocument({
    required String tenantId,
    required File file,
    required String docType,
  }) async {
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(file.path, filename: file.path.split('/').last),
      'doc_type': docType,
      'tenant_id': tenantId,
    });
    final response = await _dio.post(
      '/api/v1/auth/upload-document',
      data: formData,
    );
    return response.data as Map<String, dynamic>;
  }

  /// Get current user profile
  Future<UserProfile> getProfile() async {
    final response = await _dio.get('/api/v1/auth/me');
    return UserProfile.fromJson(response.data as Map<String, dynamic>);
  }

  /// Delete current user account
  Future<void> deleteAccount() async {
    await _dio.delete('/api/v1/auth/me');
  }
}
