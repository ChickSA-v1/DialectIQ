import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dialectiq/l10n/app_localizations.dart';

import '../app/theme.dart';
import '../providers/auth_provider.dart';
import '../widgets/animated_glass_background.dart';
import '../widgets/breathing_glow.dart';
import '../widgets/fade_slide_in.dart';
import '../widgets/gradient_button.dart';
import '../widgets/locale_switcher.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscure = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final success = await ref.read(authProvider.notifier).login(
          _emailController.text.trim(),
          _passwordController.text,
        );
    if (success && mounted) {
      context.go('/client');
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      backgroundColor: AppColors.bgStart,
      body: AnimatedGlassBackground(
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  const SizedBox(height: 16),

                  // Glass logo with breathing glow
                  FadeSlideIn(
                    child: BreathingGlow(
                      glowColor: AppColors.accentStart,
                      minBlur: 12,
                      maxBlur: 28,
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(20),
                        child: BackdropFilter(
                          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                          child: Container(
                            width: 68,
                            height: 68,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  AppColors.accentStart
                                      .withValues(alpha: 0.25),
                                  AppColors.accentEnd
                                      .withValues(alpha: 0.15),
                                ],
                              ),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: Colors.white.withValues(alpha: 0.20),
                              ),
                            ),
                            child: const Icon(
                              Icons.analytics_rounded,
                              size: 38,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  FadeSlideIn(
                    delay: const Duration(milliseconds: 80),
                    child: const Text(
                      'DialectIQ',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                        letterSpacing: 1,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),

                  FadeSlideIn(
                    delay: const Duration(milliseconds: 150),
                    child: Text(
                      l10n.login,
                      style: const TextStyle(
                        fontSize: 16,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Form
                  Form(
                    key: _formKey,
                    child: Column(
                      children: [
                        FadeSlideIn(
                          delay: const Duration(milliseconds: 220),
                          child: TextFormField(
                            controller: _emailController,
                            keyboardType: TextInputType.emailAddress,
                            textInputAction: TextInputAction.next,
                            style: const TextStyle(
                                color: AppColors.textPrimary),
                            decoration: InputDecoration(
                              labelText: l10n.email,
                              prefixIcon:
                                  const Icon(Icons.email_outlined),
                            ),
                            validator: (v) {
                              if (v == null || v.trim().isEmpty) {
                                return l10n.requiredField;
                              }
                              if (!v.contains('@')) {
                                return l10n.invalidEmail;
                              }
                              return null;
                            },
                          ),
                        ),
                        const SizedBox(height: 16),
                        FadeSlideIn(
                          delay: const Duration(milliseconds: 300),
                          child: TextFormField(
                            controller: _passwordController,
                            obscureText: _obscure,
                            textInputAction: TextInputAction.done,
                            onFieldSubmitted: (_) => _submit(),
                            style: const TextStyle(
                                color: AppColors.textPrimary),
                            decoration: InputDecoration(
                              labelText: l10n.password,
                              prefixIcon:
                                  const Icon(Icons.lock_outlined),
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _obscure
                                      ? Icons.visibility_off
                                      : Icons.visibility,
                                ),
                                onPressed: () => setState(
                                    () => _obscure = !_obscure),
                              ),
                            ),
                            validator: (v) {
                              if (v == null || v.isEmpty) {
                                return l10n.requiredField;
                              }
                              return null;
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Error
                  if (auth.error != null)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.error.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: AppColors.error.withValues(alpha: 0.30),
                        ),
                      ),
                      child: Text(
                        auth.error!,
                        style: const TextStyle(
                            color: AppColors.error, fontSize: 13),
                        textAlign: TextAlign.center,
                      ),
                    ),

                  const SizedBox(height: 20),

                  // Submit
                  FadeSlideIn(
                    delay: const Duration(milliseconds: 400),
                    child: GradientButton(
                      label: l10n.loginButton,
                      isLoading: auth.isLoading,
                      onPressed: _submit,
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Register link
                  FadeSlideIn(
                    delay: const Duration(milliseconds: 500),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(l10n.noAccount,
                            style: const TextStyle(
                                color: AppColors.textSecondary)),
                        TextButton(
                          onPressed: () => context.go('/register'),
                          child: Text(
                            l10n.registerNow,
                            style: const TextStyle(
                                color: AppColors.accentStart),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Language switcher at bottom
                  FadeSlideIn(
                    delay: const Duration(milliseconds: 600),
                    child: const LocaleSwitcher(),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
