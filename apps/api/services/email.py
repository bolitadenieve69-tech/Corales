import logging
from typing import List, Optional
from core.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        # We start with a console-based service for development
        self.mode = settings.ENVIRONMENT
        self.sender = "Corales <noreply@corales.app>"

    async def send_email(
        self, 
        to_email: str, 
        subject: str, 
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """
        Sends an email. In development, it just logs to console.
        In production, it should use an external service like Resend or AWS SES.
        """
        if self.mode == "development" or self.mode == "local":
            logger.info(f"--- MOCK EMAIL SENT ---")
            logger.info(f"From: {self.sender}")
            logger.info(f"To: {to_email}")
            logger.info(f"Subject: {subject}")
            logger.info(f"Content: {html_content[:100]}...")
            logger.info(f"------------------------")
            return True
        else:
            # TODO: Implement Resend/SES integration here
            logger.warning(f"Email service not fully implemented for {self.mode}. Email to {to_email} was not sent.")
            return False

    async def notify_new_project(self, coralist_email: str, project_name: str, choir_name: str):
        subject = f"¡Nuevo proyecto en {choir_name}: {project_name}!"
        html = f"""
        <html>
            <body>
                <h1>¡Hola!</h1>
                <p>El director de <strong>{choir_name}</strong> ha publicado un nuevo proyecto: <strong>{project_name}</strong>.</p>
                <p>Ya puedes acceder a la aplicación para ver el repertorio y empezar a ensayar.</p>
                <br/>
                <a href="https://corales.app/projects" style="background-color: #2E75B6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Proyectos</a>
            </body>
        </html>
        """
        return await self.send_email(coralist_email, subject, html)

email_service = EmailService()
