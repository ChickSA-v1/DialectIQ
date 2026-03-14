import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user.dart';
import 'auth_provider.dart';

/// Derived provider that exposes the current user's profile
final profileProvider = Provider<UserProfile?>((ref) {
  return ref.watch(authProvider).profile;
});

/// Derived provider for tenant info
final tenantProvider = Provider<TenantInfo?>((ref) {
  return ref.watch(authProvider).profile?.tenant;
});

/// Derived provider for tenant status string
final tenantStatusProvider = Provider<String?>((ref) {
  return ref.watch(authProvider).profile?.tenant?.status;
});
