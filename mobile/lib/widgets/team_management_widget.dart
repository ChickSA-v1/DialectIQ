import 'package:flutter/material.dart';
import '../app/theme.dart';
import '../models/user.dart';
import '../repositories/tenant_repo.dart';

class TeamManagementWidget extends StatefulWidget {
  final String currentUserRole;

  const TeamManagementWidget({
    super.key,
    this.currentUserRole = 'owner',
  });

  @override
  State<TeamManagementWidget> createState() => _TeamManagementWidgetState();
}

class _TeamManagementWidgetState extends State<TeamManagementWidget> {
  final _tenantRepo = TenantRepository();
  List<TeamMember>? _members;
  bool _loading = true;
  String? _error;

  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _inviting = false;
  bool _showInviteForm = false;

  @override
  void initState() {
    super.initState();
    _loadMembers();
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadMembers() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final members = await _tenantRepo.getTeamMembers();
      if (mounted) {
        setState(() {
          _members = members;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _loading = false;
        });
      }
    }
  }

  Future<void> _invite() async {
    final email = _emailCtrl.text.trim();
    final name = _nameCtrl.text.trim();
    final password = _passwordCtrl.text;
    if (email.isEmpty || name.isEmpty || password.isEmpty) return;

    setState(() => _inviting = true);
    try {
      await _tenantRepo.inviteTeamMember(
        email: email,
        fullName: name,
        password: password,
      );
      _emailCtrl.clear();
      _nameCtrl.clear();
      _passwordCtrl.clear();
      setState(() {
        _showInviteForm = false;
        _inviting = false;
      });
      await _loadMembers();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تمت دعوة العضو بنجاح')),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _inviting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('خطأ: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _removeMember(TeamMember member) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('حذف عضو'),
        content: Text('هل تريد حذف ${member.fullName}؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('إلغاء'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('حذف', style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
    if (confirm != true) return;

    try {
      await _tenantRepo.removeTeamMember(member.id);
      await _loadMembers();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تم حذف العضو')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('خطأ: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isOwner = widget.currentUserRole == 'owner';

    return Container(
      decoration: AppColors.glassDecoration(radius: 16),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.group_rounded, color: AppColors.vibrantCyan, size: 20),
              const SizedBox(width: 8),
              const Text(
                'الفريق',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const Spacer(),
              if (isOwner)
                TextButton.icon(
                  onPressed: () => setState(() => _showInviteForm = !_showInviteForm),
                  icon: const Icon(Icons.add, size: 18, color: AppColors.vibrantCyan),
                  label: const Text(
                    '+ دعوة عضو',
                    style: TextStyle(color: AppColors.vibrantCyan, fontSize: 13),
                  ),
                ),
            ],
          ),

          if (_showInviteForm && isOwner) ...[
            const SizedBox(height: 12),
            Container(
              decoration: AppColors.glassMediumDecoration(radius: 12),
              padding: const EdgeInsets.all(12),
              child: Column(
                children: [
                  TextField(
                    controller: _nameCtrl,
                    style: const TextStyle(color: AppColors.textPrimary),
                    decoration: const InputDecoration(
                      labelText: 'الاسم الكامل',
                      prefixIcon: Icon(Icons.person_outline),
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _emailCtrl,
                    keyboardType: TextInputType.emailAddress,
                    style: const TextStyle(color: AppColors.textPrimary),
                    decoration: const InputDecoration(
                      labelText: 'البريد الإلكتروني',
                      prefixIcon: Icon(Icons.email_outlined),
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _passwordCtrl,
                    obscureText: true,
                    style: const TextStyle(color: AppColors.textPrimary),
                    decoration: const InputDecoration(
                      labelText: 'كلمة المرور',
                      prefixIcon: Icon(Icons.lock_outline),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _inviting ? null : _invite,
                      child: _inviting
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Text('دعوة'),
                    ),
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 12),

          if (_loading)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: CircularProgressIndicator(color: AppColors.vibrantCyan),
              ),
            )
          else if (_error != null)
            Center(
              child: Column(
                children: [
                  Text(_error!, style: const TextStyle(color: AppColors.error, fontSize: 13)),
                  TextButton(onPressed: _loadMembers, child: const Text('إعادة المحاولة')),
                ],
              ),
            )
          else if (_members == null || _members!.isEmpty)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Text('لا يوجد أعضاء', style: TextStyle(color: AppColors.textMuted)),
              ),
            )
          else
            ...(_members!.map((member) => _MemberTile(
                  member: member,
                  isOwner: isOwner,
                  onRemove: isOwner && member.role != 'owner'
                      ? () => _removeMember(member)
                      : null,
                ))),
        ],
      ),
    );
  }
}

class _MemberTile extends StatelessWidget {
  final TeamMember member;
  final bool isOwner;
  final VoidCallback? onRemove;

  const _MemberTile({
    required this.member,
    required this.isOwner,
    this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    final roleColor = member.role == 'owner' ? AppColors.vibrantCyan : AppColors.textMuted;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: AppColors.glassDecoration(radius: 12),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      child: Row(
        children: [
          CircleAvatar(
            radius: 18,
            backgroundColor: AppColors.vibrantCyan.withValues(alpha: 0.15),
            child: Text(
              member.fullName.isNotEmpty ? member.fullName[0].toUpperCase() : '?',
              style: const TextStyle(color: AppColors.vibrantCyan, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  member.fullName,
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
                Text(
                  member.email,
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: roleColor.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: roleColor.withValues(alpha: 0.30)),
            ),
            child: Text(
              member.role == 'owner' ? 'مالك' : 'عضو',
              style: TextStyle(color: roleColor, fontSize: 11, fontWeight: FontWeight.w600),
            ),
          ),
          const SizedBox(width: 8),
          Icon(
            member.isActive ? Icons.check_circle_rounded : Icons.cancel_rounded,
            color: member.isActive ? AppColors.emeraldGreen : AppColors.textMuted,
            size: 18,
          ),
          if (onRemove != null) ...[
            const SizedBox(width: 4),
            IconButton(
              onPressed: onRemove,
              icon: const Icon(Icons.delete_outline, color: AppColors.error, size: 18),
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
            ),
          ],
        ],
      ),
    );
  }
}
