import 'dart:ui';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:dialectiq/l10n/app_localizations.dart';

import '../app/theme.dart';
import '../repositories/auth_repo.dart';
import '../widgets/animated_glass_background.dart';
import '../widgets/fade_slide_in.dart';
import '../widgets/gradient_button.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _repo = AuthRepository();
  final _emailController = TextEditingController();
  final _codeController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  int _step = 0; // 0=email, 1=code, 2=new password
  bool _isLoading = false;
  String? _error;
  String? _successMessage;
  bool _obscurePassword = true;
  bool _obscureConfirm = true;

  @override
  void dispose() {
    _emailController.dispose();
    _codeController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  String _extractError(dynamic e) {
    if (e is DioException && e.response?.data != null) {
      final data = e.response!.data;
      if (data is Map && data.containsKey('detail')) {
        return data['detail'].toString();
      }
    }
    if (e is DioException) {
      switch (e.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.sendTimeout:
        case DioExceptionType.receiveTimeout:
          return 'Connection timed out. Please try again.';
        case DioExceptionType.connectionError:
          return 'No internet connection.';
        default:
          break;
      }
    }
    return 'An unexpected error occurred';
  }

  Future<void> _sendCode() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      await _repo.forgotPassword(_emailController.text.trim());
      setState(() {
        _step = 1;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = _extractError(e);
        _isLoading = false;
      });
    }
  }

  Future<void> _verifyCode() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      await _repo.verifyResetCode(
        _emailController.text.trim(),
        _codeController.text.trim(),
      );
      setState(() {
        _step = 2;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = _extractError(e);
        _isLoading = false;
      });
    }
  }

  Future<void> _resetPassword() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      await _repo.resetPassword(
        _emailController.text.trim(),
        _codeController.text.trim(),
        _passwordController.text,
      );
      setState(() {
        _isLoading = false;
        _successMessage = '';
      });
    } catch (e) {
      setState(() {
        _error = _extractError(e);
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    // Success state
    if (_successMessage != null) {
      return Scaffold(
        backgroundColor: AppColors.bgStart,
        body: AnimatedGlassBackground(
          child: SafeArea(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        color: Colors.green.withValues(alpha: 0.15),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.check_rounded,
                          size: 40, color: Colors.green),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      l10n.resetPasswordSuccess,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      l10n.resetPasswordSuccessMsg,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                          color: AppColors.textSecondary, fontSize: 14),
                    ),
                    const SizedBox(height: 28),
                    GradientButton(
                      label: l10n.goToLogin,
                      onPressed: () => context.go('/login'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.bgStart,
      body: AnimatedGlassBackground(
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    // Back button
                    Align(
                      alignment: AlignmentDirectional.centerStart,
                      child: IconButton(
                        onPressed: () {
                          if (_step > 0) {
                            setState(() {
                              _step--;
                              _error = null;
                            });
                          } else {
                            context.go('/login');
                          }
                        },
                        icon: const Icon(Icons.arrow_back_ios_rounded,
                            color: AppColors.textSecondary),
                      ),
                    ),
                    const SizedBox(height: 8),

                    // Icon
                    FadeSlideIn(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(20),
                        child: BackdropFilter(
                          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                          child: Container(
                            width: 68,
                            height: 68,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(colors: [
                                AppColors.accentStart
                                    .withValues(alpha: 0.25),
                                AppColors.accentEnd
                                    .withValues(alpha: 0.15),
                              ]),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                  color:
                                      Colors.white.withValues(alpha: 0.20)),
                            ),
                            child: Icon(
                              _step == 0
                                  ? Icons.email_outlined
                                  : _step == 1
                                      ? Icons.pin_outlined
                                      : Icons.lock_reset_rounded,
                              size: 34,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Title
                    FadeSlideIn(
                      delay: const Duration(milliseconds: 80),
                      child: Text(
                        _step == 0
                            ? l10n.forgotPassword
                            : _step == 1
                                ? l10n.enterResetCode
                                : l10n.newPassword,
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    FadeSlideIn(
                      delay: const Duration(milliseconds: 150),
                      child: Text(
                        _step == 0
                            ? l10n.forgotPasswordMsg
                            : _step == 1
                                ? l10n.enterResetCodeMsg
                                : l10n.newPasswordMsg,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 14,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                    const SizedBox(height: 28),

                    // Step 0: Email
                    if (_step == 0)
                      FadeSlideIn(
                        delay: const Duration(milliseconds: 220),
                        child: TextFormField(
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          textInputAction: TextInputAction.done,
                          onFieldSubmitted: (_) => _sendCode(),
                          style:
                              const TextStyle(color: AppColors.textPrimary),
                          decoration: InputDecoration(
                            labelText: l10n.email,
                            prefixIcon: const Icon(Icons.email_outlined),
                          ),
                          validator: (v) {
                            if (v == null || v.trim().isEmpty) {
                              return l10n.requiredField;
                            }
                            if (!v.contains('@')) return l10n.invalidEmail;
                            return null;
                          },
                        ),
                      ),

                    // Step 1: OTP Code
                    if (_step == 1)
                      FadeSlideIn(
                        delay: const Duration(milliseconds: 220),
                        child: TextFormField(
                          controller: _codeController,
                          keyboardType: TextInputType.number,
                          textInputAction: TextInputAction.done,
                          onFieldSubmitted: (_) => _verifyCode(),
                          inputFormatters: [
                            FilteringTextInputFormatter.digitsOnly,
                            LengthLimitingTextInputFormatter(6),
                          ],
                          style: const TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 24,
                            letterSpacing: 8,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                          decoration: InputDecoration(
                            labelText: l10n.resetCode,
                            prefixIcon: const Icon(Icons.pin_outlined),
                          ),
                          validator: (v) {
                            if (v == null || v.trim().isEmpty) {
                              return l10n.requiredField;
                            }
                            if (v.length != 6) return l10n.resetCodeInvalid;
                            return null;
                          },
                        ),
                      ),

                    // Step 2: New Password
                    if (_step == 2) ...[
                      FadeSlideIn(
                        delay: const Duration(milliseconds: 220),
                        child: TextFormField(
                          controller: _passwordController,
                          obscureText: _obscurePassword,
                          textInputAction: TextInputAction.next,
                          style:
                              const TextStyle(color: AppColors.textPrimary),
                          decoration: InputDecoration(
                            labelText: l10n.newPassword,
                            prefixIcon: const Icon(Icons.lock_outlined),
                            suffixIcon: IconButton(
                              icon: Icon(_obscurePassword
                                  ? Icons.visibility_off
                                  : Icons.visibility),
                              onPressed: () => setState(
                                  () => _obscurePassword = !_obscurePassword),
                            ),
                          ),
                          validator: (v) {
                            if (v == null || v.isEmpty) {
                              return l10n.requiredField;
                            }
                            if (v.length < 8) return l10n.passwordTooShort;
                            return null;
                          },
                        ),
                      ),
                      const SizedBox(height: 16),
                      FadeSlideIn(
                        delay: const Duration(milliseconds: 300),
                        child: TextFormField(
                          controller: _confirmPasswordController,
                          obscureText: _obscureConfirm,
                          textInputAction: TextInputAction.done,
                          onFieldSubmitted: (_) => _resetPassword(),
                          style:
                              const TextStyle(color: AppColors.textPrimary),
                          decoration: InputDecoration(
                            labelText: l10n.confirmPassword,
                            prefixIcon:
                                const Icon(Icons.lock_outline_rounded),
                            suffixIcon: IconButton(
                              icon: Icon(_obscureConfirm
                                  ? Icons.visibility_off
                                  : Icons.visibility),
                              onPressed: () => setState(
                                  () => _obscureConfirm = !_obscureConfirm),
                            ),
                          ),
                          validator: (v) {
                            if (v != _passwordController.text) {
                              return l10n.passwordMismatch;
                            }
                            return null;
                          },
                        ),
                      ),
                    ],

                    const SizedBox(height: 12),

                    // Error
                    if (_error != null)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.error.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                              color: AppColors.error.withValues(alpha: 0.30)),
                        ),
                        child: Text(
                          _error!,
                          style: const TextStyle(
                              color: AppColors.error, fontSize: 13),
                          textAlign: TextAlign.center,
                        ),
                      ),

                    const SizedBox(height: 20),

                    // Action button
                    FadeSlideIn(
                      delay: const Duration(milliseconds: 400),
                      child: GradientButton(
                        label: _step == 0
                            ? l10n.sendResetCode
                            : _step == 1
                                ? l10n.verifyCode
                                : l10n.resetPasswordButton,
                        isLoading: _isLoading,
                        onPressed: _step == 0
                            ? _sendCode
                            : _step == 1
                                ? _verifyCode
                                : _resetPassword,
                      ),
                    ),

                    // Resend code link (step 1)
                    if (_step == 1) ...[
                      const SizedBox(height: 16),
                      TextButton(
                        onPressed: _isLoading
                            ? null
                            : () {
                                setState(() {
                                  _step = 0;
                                  _codeController.clear();
                                  _error = null;
                                });
                              },
                        child: Text(
                          l10n.resendCode,
                          style: const TextStyle(
                              color: AppColors.accentStart, fontSize: 13),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
