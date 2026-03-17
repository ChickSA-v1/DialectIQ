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
import '../screens/client/upgrade_screen.dart';
import '../screens/client/payment_view.dart';
import '../screens/forgot_password_screen.dart';

CustomTransitionPage<void> _fadeScalePage({
  required LocalKey key,
  required Widget child,
}) {
  return CustomTransitionPage<void>(
    key: key,
    child: child,
    transitionDuration: const Duration(milliseconds: 400),
    reverseTransitionDuration: const Duration(milliseconds: 300),
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      final curved = CurvedAnimation(
        parent: animation,
        curve: Curves.easeOutCubic,
      );
      return FadeTransition(
        opacity: curved,
        child: ScaleTransition(
          scale: Tween<double>(begin: 0.95, end: 1.0).animate(curved),
          child: child,
        ),
      );
    },
  );
}

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
      final authRoutes = ['/login', '/register', '/forgot-password'];
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
        pageBuilder: (context, state) => _fadeScalePage(
          key: state.pageKey,
          child: const SplashScreen(),
        ),
      ),
      GoRoute(
        path: '/login',
        pageBuilder: (context, state) => _fadeScalePage(
          key: state.pageKey,
          child: const LoginScreen(),
        ),
      ),
      GoRoute(
        path: '/forgot-password',
        pageBuilder: (context, state) => _fadeScalePage(
          key: state.pageKey,
          child: const ForgotPasswordScreen(),
        ),
      ),
      GoRoute(
        path: '/register',
        pageBuilder: (context, state) => _fadeScalePage(
          key: state.pageKey,
          child: const RegisterScreen(),
        ),
      ),
      GoRoute(
        path: '/client',
        pageBuilder: (context, state) => _fadeScalePage(
          key: state.pageKey,
          child: const ClientScreen(),
        ),
      ),
      GoRoute(
        path: '/settings',
        pageBuilder: (context, state) => _fadeScalePage(
          key: state.pageKey,
          child: const SettingsScreen(),
        ),
      ),
      GoRoute(
        path: '/payment-result',
        pageBuilder: (context, state) {
          final invoiceId = state.uri.queryParameters['invoice_id'] ?? '';
          return _fadeScalePage(
            key: state.pageKey,
            child: PaymentResultScreen(invoiceId: invoiceId),
          );
        },
      ),
      GoRoute(
        path: '/upgrade',
        pageBuilder: (context, state) => _fadeScalePage(
          key: state.pageKey,
          child: const UpgradeScreen(),
        ),
      ),
      GoRoute(
        path: '/upgrade-payment',
        pageBuilder: (context, state) {
          final invoiceId = state.uri.queryParameters['invoice_id'] ?? '';
          return _fadeScalePage(
            key: state.pageKey,
            child: PaymentView(invoiceId: invoiceId, isUpgrade: true),
          );
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
