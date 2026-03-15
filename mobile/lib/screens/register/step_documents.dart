import 'dart:io';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:dialectiq/l10n/app_localizations.dart';

import '../../app/theme.dart';
import '../../core/constants.dart';
import '../../widgets/fade_slide_in.dart';
import '../../widgets/gradient_button.dart';

class StepDocuments extends StatelessWidget {
  final File? commercialRegFile;
  final File? nationalIdFile;
  final bool isSubmitting;
  final ValueChanged<File?> onCommercialRegSelected;
  final ValueChanged<File?> onNationalIdSelected;
  final VoidCallback onSubmit;

  const StepDocuments({
    super.key,
    this.commercialRegFile,
    this.nationalIdFile,
    required this.isSubmitting,
    required this.onCommercialRegSelected,
    required this.onNationalIdSelected,
    required this.onSubmit,
  });

  Future<void> _pickFile(ValueChanged<File?> onSelected) async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: allowedExtensions,
    );
    if (result != null && result.files.single.path != null) {
      final file = File(result.files.single.path!);
      if (file.lengthSync() <= maxFileSize) {
        onSelected(file);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Commercial registration
          FadeSlideIn(
            child: _FileUploadCard(
              title: l10n.uploadCommercialReg,
              file: commercialRegFile,
              hint: l10n.allowedFormats,
              onTap: () => _pickFile(onCommercialRegSelected),
            ),
          ),

          const SizedBox(height: 20),

          // National ID
          FadeSlideIn(
            delay: const Duration(milliseconds: 150),
            child: _FileUploadCard(
              title: l10n.uploadNationalId,
              file: nationalIdFile,
              hint: l10n.allowedFormats,
              onTap: () => _pickFile(onNationalIdSelected),
            ),
          ),

          const SizedBox(height: 32),

          FadeSlideIn(
            delay: const Duration(milliseconds: 300),
            child: GradientButton(
              label: l10n.submit,
              icon: Icons.check,
              isLoading: isSubmitting,
              onPressed: isSubmitting ? null : onSubmit,
            ),
          ),
        ],
      ),
    );
  }
}

class _FileUploadCard extends StatelessWidget {
  final String title;
  final File? file;
  final String hint;
  final VoidCallback onTap;

  const _FileUploadCard({
    required this.title,
    this.file,
    required this.hint,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final hasFile = file != null;

    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: hasFile
                  ? AppColors.success.withValues(alpha: 0.08)
                  : Colors.white.withValues(alpha: 0.06),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: hasFile
                    ? AppColors.success.withValues(alpha: 0.30)
                    : Colors.white.withValues(alpha: 0.15),
                width: hasFile ? 2 : 1,
              ),
            ),
            child: Column(
              children: [
                Icon(
                  hasFile ? Icons.check_circle : Icons.cloud_upload_outlined,
                  size: 40,
                  color: hasFile ? AppColors.success : AppColors.textMuted,
                ),
                const SizedBox(height: 12),
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 15,
                    color: AppColors.textPrimary,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 6),
                Text(
                  hasFile
                      ? l10n.fileSelected(file!.path.split('/').last)
                      : l10n.selectFile,
                  style: TextStyle(
                    fontSize: 12,
                    color:
                        hasFile ? AppColors.success : AppColors.textSecondary,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 4),
                Text(
                  hint,
                  style: const TextStyle(
                      fontSize: 11, color: AppColors.textMuted),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
