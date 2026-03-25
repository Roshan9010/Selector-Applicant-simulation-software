import os
from pathlib import Path
import smtplib
from email.message import EmailMessage
import json
try:
    import openai
except Exception:
    openai = None


SMTP_HOST = os.getenv('SMTP_HOST')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SMTP_USER = os.getenv('SMTP_USER')
SMTP_PASS = os.getenv('SMTP_PASS')
SMTP_FROM = os.getenv('SMTP_FROM', SMTP_USER)
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-5-mini')

if OPENAI_API_KEY and openai is not None:
    try:
        openai.api_key = OPENAI_API_KEY
    except Exception:
        pass


def send_email(to_email: str, subject: str, body: str, html: str = None) -> None:
    """Send an email using SMTP. Raises Exception on failure.

    Requires environment variables: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.
    """
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = SMTP_FROM
    msg['To'] = to_email
    if html:
        msg.set_content(body)
        msg.add_alternative(html, subtype='html')
    else:
        msg.set_content(body)

    # If SMTP not configured, fall back to logging the email to console and a file for local development
    if not SMTP_HOST or not SMTP_USER or not SMTP_PASS:
        log_entry = f"---\nTo: {to_email}\nSubject: {subject}\n\n{body}\n---\n"
        try:
            print("[email_utils] SMTP not configured — writing email to backend/email_log.txt and console")
            print(log_entry)
            with open(Path(__file__).parent / 'email_log.txt', 'a', encoding='utf-8') as f:
                f.write(log_entry)
        except Exception as e:
            # If logging fails, raise to signal the caller
            raise RuntimeError(f"Failed to log email locally: {e}")
        return

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)


def compose_invitation_email(candidate_name: str, domain: str, invitation_link: str, recruiter_name: str = None, company: str = None, tone: str = 'professional') -> tuple:
    """Compose subject, plain text body, and HTML body for an interview invitation.

    If `OPENAI_API_KEY` is set and the OpenAI SDK is available, the model will produce a polished email (JSON with keys: subject, text, html).
    Otherwise falls back to a simple template.
    Returns (subject, text_body, html_body).
    """
    recruiter_name = recruiter_name or 'Recruiter'
    company = company or ''

    # Use model to compose if available
    if OPENAI_API_KEY and openai is not None:
        prompt = f"Write a concise, professional interview invitation email. Return only a JSON object with keys: subject, text, html.\nCandidate name: {candidate_name}\nDomain: {domain}\nInvitation link: {invitation_link}\nRecruiter name: {recruiter_name}\nCompany: {company}\nTone: {tone}\nMake subject short and action-oriented. HTML should include a clickable link."
        try:
            resp = openai.ChatCompletion.create(
                model=OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are an assistant that outputs strictly valid JSON for emails."},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=400,
                temperature=0.2,
            )
            text = resp['choices'][0]['message']['content']
            # try to parse JSON
            try:
                data = json.loads(text)
                subject = data.get('subject') or data.get('title') or f"Interview Invitation - {domain}"
                text_body = data.get('text') or data.get('body') or data.get('text_body') or ''
                html_body = data.get('html') or data.get('html_body') or ''
                return subject, text_body, html_body
            except Exception:
                # fallback to raw text parsing: simple split
                subject = f"Interview Invitation - {domain}"
                text_body = text
                html_body = f"<pre>{text}</pre>"
                return subject, text_body, html_body
        except Exception:
            # if model call fails, fall through to template
            pass

    # Fallback template
    subject = f"Interview Invitation - {domain}"
    text_body = f"Hi {candidate_name},\n\nYou have been invited to a {domain} interview. Start here: {invitation_link}\n\nBest regards,\n{recruiter_name}{(' - ' + company) if company else ''}"
    html_body = f"<p>Hi {candidate_name},</p><p>You have been invited to a <strong>{domain}</strong> interview.</p><p><a href=\"{invitation_link}\">Start your interview</a></p><p>Best regards,<br/>{recruiter_name}{(' - ' + company) if company else ''}</p>"
    return subject, text_body, html_body
