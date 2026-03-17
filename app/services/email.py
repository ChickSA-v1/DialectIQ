"""
Email notification service using SMTP (Gmail App Password).
Sends admin notifications for new registrations, bank transfers, etc.
"""

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import structlog

from app.config import get_settings

log = structlog.get_logger()


def _build_registration_html(
    business_name_ar: str,
    business_name_en: str,
    owner_name: str,
    email: str,
    phone: str,
    package: str,
) -> str:
    """Build a styled HTML email for new registration notification."""
    package_colors = {
        "basic": "#6366f1",
        "advanced": "#8b5cf6",
        "enterprise": "#a855f7",
    }
    color = package_colors.get(package, "#6366f1")

    return f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #f8fafc; padding: 24px;">
      <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 28px 24px; text-align: center;">
          <div style="width: 44px; height: 44px; background: rgba(255,255,255,0.2); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <span style="color: white; font-weight: bold; font-size: 20px;">D</span>
          </div>
          <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700;">New Registration</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">A new business has signed up on DialectIQ</p>
        </div>

        <!-- Body -->
        <div style="padding: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 13px; width: 140px;">Business (AR)</td>
              <td style="padding: 10px 0; color: #1e293b; font-size: 14px; font-weight: 600;">{business_name_ar}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 13px; border-top: 1px solid #f1f5f9;">Business (EN)</td>
              <td style="padding: 10px 0; color: #1e293b; font-size: 14px; font-weight: 600; border-top: 1px solid #f1f5f9;">{business_name_en}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 13px; border-top: 1px solid #f1f5f9;">Owner</td>
              <td style="padding: 10px 0; color: #1e293b; font-size: 14px; border-top: 1px solid #f1f5f9;">{owner_name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 13px; border-top: 1px solid #f1f5f9;">Email</td>
              <td style="padding: 10px 0; color: #1e293b; font-size: 14px; border-top: 1px solid #f1f5f9;">{email}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 13px; border-top: 1px solid #f1f5f9;">Phone</td>
              <td style="padding: 10px 0; color: #1e293b; font-size: 14px; border-top: 1px solid #f1f5f9;">{phone}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 13px; border-top: 1px solid #f1f5f9;">Package</td>
              <td style="padding: 10px 0; border-top: 1px solid #f1f5f9;">
                <span style="background: {color}; color: white; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: capitalize;">{package}</span>
              </td>
            </tr>
          </table>

          <!-- CTA -->
          <div style="text-align: center; margin-top: 24px;">
            <a href="https://d-iq.io/admin/registrations" style="display: inline-block; background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; padding: 12px 32px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600;">
              Review Registration
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="margin: 0; color: #94a3b8; font-size: 11px;">DialectIQ Admin Notification &mdash; d-iq.io</p>
        </div>
      </div>
    </div>
    """


async def send_new_registration_email(
    business_name_ar: str,
    business_name_en: str,
    owner_name: str,
    email: str,
    phone: str,
    package: str,
) -> None:
    """Send email notification to admin when a new registration occurs."""
    settings = get_settings()

    if not settings.smtp_username or not settings.smtp_password:
        log.warning("email_skipped_no_smtp", reason="SMTP credentials not configured")
        return

    try:
        html = _build_registration_html(
            business_name_ar=business_name_ar,
            business_name_en=business_name_en,
            owner_name=owner_name,
            email=email,
            phone=phone,
            package=package,
        )

        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"New Registration: {business_name_en or business_name_ar} ({package})"
        msg["From"] = f"DialectIQ <{settings.smtp_username}>"
        msg["To"] = settings.admin_notification_email

        # Plain text fallback
        plain = (
            f"New Registration on DialectIQ\n\n"
            f"Business (AR): {business_name_ar}\n"
            f"Business (EN): {business_name_en}\n"
            f"Owner: {owner_name}\n"
            f"Email: {email}\n"
            f"Phone: {phone}\n"
            f"Package: {package}\n\n"
            f"Review: https://d-iq.io/admin/registrations"
        )
        msg.attach(MIMEText(plain, "plain"))
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_username, settings.smtp_password)
            server.sendmail(settings.smtp_username, settings.admin_notification_email, msg.as_string())

        log.info("registration_email_sent", to=settings.admin_notification_email, business=business_name_en)

    except Exception as e:
        # Never let email failure break registration
        log.error("registration_email_failed", error=str(e))


def _build_reset_code_html(code: str) -> str:
    """Build a styled HTML email for password reset code."""
    return f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #f8fafc; padding: 24px;">
      <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 28px 24px; text-align: center;">
          <div style="width: 44px; height: 44px; background: rgba(255,255,255,0.2); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <span style="color: white; font-weight: bold; font-size: 20px;">D</span>
          </div>
          <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700;">Password Reset</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">Use the code below to reset your password</p>
        </div>
        <div style="padding: 32px 24px; text-align: center;">
          <p style="color: #64748b; font-size: 14px; margin: 0 0 20px;">Your verification code is:</p>
          <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; display: inline-block; letter-spacing: 8px; font-size: 32px; font-weight: 700; color: #1e293b; font-family: monospace;">
            {code}
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin: 20px 0 0;">This code expires in 10 minutes. If you didn't request this, please ignore this email.</p>
        </div>
        <div style="padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="margin: 0; color: #94a3b8; font-size: 11px;">DialectIQ &mdash; d-iq.io</p>
        </div>
      </div>
    </div>
    """


async def send_password_reset_email(email: str, code: str) -> None:
    """Send a password reset verification code to the user."""
    settings = get_settings()

    if not settings.smtp_username or not settings.smtp_password:
        log.warning("email_skipped_no_smtp", reason="SMTP credentials not configured")
        return

    try:
        html = _build_reset_code_html(code)

        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"DialectIQ - Password Reset Code: {code}"
        msg["From"] = f"DialectIQ <{settings.smtp_username}>"
        msg["To"] = email

        plain = (
            f"Your DialectIQ password reset code is: {code}\n\n"
            f"This code expires in 10 minutes.\n"
            f"If you didn't request this, please ignore this email."
        )
        msg.attach(MIMEText(plain, "plain"))
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_username, settings.smtp_password)
            server.sendmail(settings.smtp_username, email, msg.as_string())

        log.info("password_reset_email_sent", to=email)

    except Exception as e:
        log.error("password_reset_email_failed", error=str(e))
        raise
