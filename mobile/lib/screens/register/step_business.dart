import 'package:flutter/material.dart';
import 'package:dialectiq/l10n/app_localizations.dart';
import '../../app/theme.dart';
import '../../widgets/fade_slide_in.dart';
import '../../widgets/gradient_button.dart';

class StepBusiness extends StatefulWidget {
  final String nameAr;
  final String nameEn;
  final String fullName;
  final String email;
  final String phone;
  final String password;
  final void Function(Map<String, String>) onNext;

  const StepBusiness({
    super.key,
    required this.nameAr,
    required this.nameEn,
    required this.fullName,
    required this.email,
    required this.phone,
    required this.password,
    required this.onNext,
  });

  @override
  State<StepBusiness> createState() => _StepBusinessState();
}

class _StepBusinessState extends State<StepBusiness> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameArCtrl;
  late final TextEditingController _nameEnCtrl;
  late final TextEditingController _fullNameCtrl;
  late final TextEditingController _emailCtrl;
  late final TextEditingController _phoneCtrl;
  late final TextEditingController _passwordCtrl;
  late final TextEditingController _confirmCtrl;

  @override
  void initState() {
    super.initState();
    _nameArCtrl = TextEditingController(text: widget.nameAr);
    _nameEnCtrl = TextEditingController(text: widget.nameEn);
    _fullNameCtrl = TextEditingController(text: widget.fullName);
    _emailCtrl = TextEditingController(text: widget.email);
    _phoneCtrl = TextEditingController(text: widget.phone);
    _passwordCtrl = TextEditingController(text: widget.password);
    _confirmCtrl = TextEditingController(text: widget.password);
  }

  @override
  void dispose() {
    _nameArCtrl.dispose();
    _nameEnCtrl.dispose();
    _fullNameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _passwordCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Form(
        key: _formKey,
        child: Column(
          children: [
            FadeSlideIn(
              delay: const Duration(milliseconds: 0),
              child: TextFormField(
                controller: _nameArCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: InputDecoration(
                  labelText: l10n.businessNameAr,
                  prefixIcon: const Icon(Icons.business),
                ),
                validator: (v) =>
                    v == null || v.trim().isEmpty ? l10n.requiredField : null,
              ),
            ),
            const SizedBox(height: 16),
            FadeSlideIn(
              delay: const Duration(milliseconds: 80),
              child: TextFormField(
                controller: _nameEnCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: InputDecoration(
                  labelText: l10n.businessNameEn,
                  prefixIcon: const Icon(Icons.business_center),
                ),
              ),
            ),
            const SizedBox(height: 16),
            FadeSlideIn(
              delay: const Duration(milliseconds: 160),
              child: TextFormField(
                controller: _fullNameCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: InputDecoration(
                  labelText: l10n.ownerName,
                  prefixIcon: const Icon(Icons.person),
                ),
                validator: (v) =>
                    v == null || v.trim().isEmpty ? l10n.requiredField : null,
              ),
            ),
            const SizedBox(height: 16),
            FadeSlideIn(
              delay: const Duration(milliseconds: 240),
              child: TextFormField(
                controller: _emailCtrl,
                keyboardType: TextInputType.emailAddress,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: InputDecoration(
                  labelText: l10n.ownerEmail,
                  prefixIcon: const Icon(Icons.email_outlined),
                ),
                validator: (v) {
                  if (v == null || v.trim().isEmpty) return l10n.requiredField;
                  if (!v.contains('@')) return l10n.invalidEmail;
                  return null;
                },
              ),
            ),
            const SizedBox(height: 16),
            FadeSlideIn(
              delay: const Duration(milliseconds: 320),
              child: TextFormField(
                controller: _phoneCtrl,
                keyboardType: TextInputType.phone,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: InputDecoration(
                  labelText: l10n.ownerPhone,
                  prefixIcon: const Icon(Icons.phone),
                ),
                validator: (v) =>
                    v == null || v.trim().isEmpty ? l10n.requiredField : null,
              ),
            ),
            const SizedBox(height: 16),
            FadeSlideIn(
              delay: const Duration(milliseconds: 400),
              child: TextFormField(
                controller: _passwordCtrl,
                obscureText: true,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: InputDecoration(
                  labelText: l10n.createPassword,
                  prefixIcon: const Icon(Icons.lock_outlined),
                ),
                validator: (v) {
                  if (v == null || v.isEmpty) return l10n.requiredField;
                  if (v.length < 8) return 'Min 8 characters';
                  return null;
                },
              ),
            ),
            const SizedBox(height: 16),
            FadeSlideIn(
              delay: const Duration(milliseconds: 480),
              child: TextFormField(
                controller: _confirmCtrl,
                obscureText: true,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: InputDecoration(
                  labelText: l10n.confirmPassword,
                  prefixIcon: const Icon(Icons.lock),
                ),
                validator: (v) {
                  if (v != _passwordCtrl.text) return l10n.passwordMismatch;
                  return null;
                },
              ),
            ),
            const SizedBox(height: 28),
            FadeSlideIn(
              delay: const Duration(milliseconds: 560),
              child: GradientButton(
              label: l10n.next,
              icon: Icons.arrow_forward,
              onPressed: () {
                if (_formKey.currentState!.validate()) {
                  widget.onNext({
                    'nameAr': _nameArCtrl.text.trim(),
                    'nameEn': _nameEnCtrl.text.trim(),
                    'fullName': _fullNameCtrl.text.trim(),
                    'email': _emailCtrl.text.trim(),
                    'phone': _phoneCtrl.text.trim(),
                    'password': _passwordCtrl.text,
                  });
                }
              },
            ),
            ),
          ],
        ),
      ),
    );
  }
}
