import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dialectiq/l10n/app_localizations.dart';

import '../../app/theme.dart';
import '../../repositories/auth_repo.dart';
import '../../widgets/animated_glass_background.dart';
import '../../widgets/locale_switcher.dart';
import 'step_business.dart';
import 'step_package.dart';
import 'step_documents.dart';
import 'step_success.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _pageController = PageController();
  int _currentStep = 0;

  // Form data
  String nameAr = '';
  String nameEn = '';
  String fullName = '';
  String email = '';
  String phone = '';
  String password = '';
  String selectedPackage = 'basic';
  String? tenantId;
  File? commercialRegFile;
  File? nationalIdFile;
  bool _isSubmitting = false;
  String? _error;

  void _nextStep() {
    if (_currentStep < 2) {
      setState(() => _currentStep++);
      _pageController.animateToPage(
        _currentStep,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _prevStep() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
      _pageController.animateToPage(
        _currentStep,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  Future<void> _submitRegistration() async {
    setState(() {
      _isSubmitting = true;
      _error = null;
    });

    try {
      final repo = AuthRepository();
      final result = await repo.register(
        nameAr: nameAr,
        nameEn: nameEn.isNotEmpty ? nameEn : null,
        fullName: fullName,
        email: email,
        phone: phone,
        password: password,
        package: selectedPackage,
      );

      tenantId = result['tenant_id'] as String?;
      _nextStep(); // Go to success step
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _isSubmitting = false);
    }
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    final stepTitles = [
      l10n.regStepBusiness,
      l10n.regStepPackage,
      l10n.regStepSuccess,
    ];

    return Scaffold(
      backgroundColor: AppColors.bgStart,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        title: Text(l10n.register),
        leading: _currentStep > 0 && _currentStep < 2
            ? IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: _prevStep,
              )
            : null,
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 12),
            child: LocaleSwitcher(),
          ),
        ],
      ),
      body: AnimatedGlassBackground(
        child: Column(
          children: [
            // Step indicator
            if (_currentStep < 2)
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                child: Row(
                  children: List.generate(3, (i) {
                    final isActive = i <= _currentStep;
                    return Expanded(
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        height: 4,
                        margin: const EdgeInsets.symmetric(horizontal: 2),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(2),
                          gradient: isActive ? AppColors.gradient : null,
                          color: isActive
                              ? null
                              : Colors.white.withValues(alpha: 0.10),
                        ),
                      ),
                    );
                  }),
                ),
              ),
            if (_currentStep < 2)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Align(
                  alignment: AlignmentDirectional.centerStart,
                  child: Text(
                    stepTitles[_currentStep],
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
              ),

            // Error display
            if (_error != null)
              Padding(
                padding: const EdgeInsets.all(16),
                child: Container(
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
                    _error!,
                    style:
                        const TextStyle(color: AppColors.error, fontSize: 13),
                  ),
                ),
              ),

            // Page view
            Expanded(
              child: PageView(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  StepBusiness(
                    nameAr: nameAr,
                    nameEn: nameEn,
                    fullName: fullName,
                    email: email,
                    phone: phone,
                    password: password,
                    onNext: (data) {
                      setState(() {
                        nameAr = data['nameAr']!;
                        nameEn = data['nameEn'] ?? '';
                        fullName = data['fullName']!;
                        email = data['email']!;
                        phone = data['phone']!;
                        password = data['password']!;
                      });
                      _nextStep();
                    },
                  ),
                  StepPackage(
                    selectedPackage: selectedPackage,
                    isSubmitting: _isSubmitting,
                    onSelect: (pkg) {
                      setState(() => selectedPackage = pkg);
                      _submitRegistration();
                    },
                  ),
                  const StepSuccess(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
