import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/auth_provider.dart';
import '../screens/splash_screen.dart';
import '../screens/login_screen.dart';
import '../screens/register/register_screen.dart';
import '../screens/client/client_screen.dart';
import '../screens/settings_screen.dart';
import '../screens/payment_result_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  // Use ref.read so the GoRouter is created ONCE.
  // GoRouter reacts to changes via its own refreshListenable.
  final authState = ref.read(authProvider);

  return GoRouter(
    initialLocation: '/',
    refreshListenable: authState,
    redirect: (context, state) {
      final isLoggedIn = authState.isLoggedIn;
      final isLoading = authState.isLoading;
      final path = state.uri.path;

      // While checking stored token, stay on splash
      if (isLoading) {
        return path == '/' ? null : '/';
      }

      // Not loading & not logged in → go to login
      // (splash '/' is also redirected to /login once loading is done)
      final authRoutes = ['/login', '/register'];
      final isAuthRoute = authRoutes.contains(path);

      if (!isLoggedIn && !isAuthRoute && path != '/') {
        return '/login';
      }
      if (!isLoggedIn && path == '/') {
        return '/login';
      }
      if (isLoggedIn && (isAuthRoute || path == '/')) {
        return '/client';
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/client',
        builder: (context, state) => const ClientScreen(),
      ),
      GoRoute(
        path: '/settings',
        builder: (context, state) => const SettingsScreen(),
      ),
      GoRoute(
        path: '/payment-result',
        builder: (context, state) {
          final invoiceId = state.uri.queryParameters['invoice_id'] ?? '';
          return PaymentResultScreen(invoiceId: invoiceId);
        },
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Page not found: ${state.uri.path}'),
      ),
    ),
  );
});
