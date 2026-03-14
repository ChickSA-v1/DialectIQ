import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Secure token storage wrapper
class SecureStorage {
  static const _storage = FlutterSecureStorage();
  static const _tokenKey = 'dialectiq_token';
  static const _roleKey = 'dialectiq_role';

  static Future<void> setToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  static Future<String?> getToken() async {
    return _storage.read(key: _tokenKey);
  }

  static Future<void> setRole(String role) async {
    await _storage.write(key: _roleKey, value: role);
  }

  static Future<String?> getRole() async {
    return _storage.read(key: _roleKey);
  }

  static Future<void> clear() async {
    await _storage.deleteAll();
  }

  static Future<bool> hasToken() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }
}
