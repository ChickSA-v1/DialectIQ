import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/storage.dart';
import '../models/user.dart';
import '../repositories/auth_repo.dart';

/// Auth state that also acts as a ChangeNotifier for GoRouter refreshListenable
class AuthState extends ChangeNotifier {
  final AuthRepository _repo = AuthRepository();

  bool _isLoading = true;
  bool _isLoggedIn = false;
  String? _token;
  String? _role;
  UserProfile? _profile;
  String? _error;

  bool get isLoading => _isLoading;
  bool get isLoggedIn => _isLoggedIn;
  String? get token => _token;
  String? get role => _role;
  UserProfile? get profile => _profile;
  String? get error => _error;

  AuthState() {
    _init();
  }

  /// Check stored token on startup
  Future<void> _init() async {
    _isLoading = true;
    notifyListeners();

    try {
      _token = await SecureStorage.getToken();
      _role = await SecureStorage.getRole();
      if (_token != null) {
        _isLoggedIn = true;
        // Try to fetch profile; if 401, token expired → auto-logout
        try {
          _profile = await _repo.getProfile();
        } catch (_) {
          await _logout();
        }
      }
    } catch (_) {
      // storage read failure; stay logged out
    }
    _isLoading = false;
    notifyListeners();
  }

  /// Login with email + password
  Future<bool> login(String email, String password) async {
    _error = null;
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _repo.login(email, password);
      _token = response.accessToken;
      _role = response.role;
      await SecureStorage.setToken(response.accessToken);
      await SecureStorage.setRole(response.role);

      // Fetch full profile
      _profile = await _repo.getProfile();
      _isLoggedIn = true;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = _extractError(e);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Refresh user profile
  Future<void> refreshProfile() async {
    try {
      _profile = await _repo.getProfile();
      notifyListeners();
    } catch (_) {}
  }

  /// Logout
  Future<void> logout() async {
    await _logout();
    notifyListeners();
  }

  Future<void> _logout() async {
    _token = null;
    _role = null;
    _profile = null;
    _isLoggedIn = false;
    await SecureStorage.clear();
  }

  String _extractError(dynamic e) {
    if (e is Exception) {
      final str = e.toString();
      // Dio error detail
      if (str.contains('detail')) {
        final match = RegExp(r'"detail"\s*:\s*"([^"]+)"').firstMatch(str);
        if (match != null) return match.group(1)!;
      }
      return str.replaceAll('Exception: ', '');
    }
    return 'An unexpected error occurred';
  }
}

final authProvider = ChangeNotifierProvider<AuthState>((ref) => AuthState());
