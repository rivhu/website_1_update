"""
Twilio Message Handler for OTP and SMS notifications
Based on tutorial approach for cleaner code organization
"""

from twilio.rest import Client
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class MessageHandler:
    """
    Handles all Twilio messaging operations including OTP and notifications.
    This class encapsulates Twilio client initialization and message sending logic.
    """

    def __init__(self, phone_number, otp=None):
        """
        Initialize MessageHandler with phone number and optional OTP.
        
        Args:
            phone_number (str): The recipient's phone number
            otp (str, optional): The OTP code to send
        """
        self.phone_number = phone_number
        self.otp = otp
        self.client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        self.from_number = settings.TWILIO_PHONE_NUMBER

    def send_otp_to_phone(self):
        """
        Send OTP via SMS using Twilio.
        
        Returns:
            dict: { 'success': bool, 'message_sid': str or None, 'error': str or None }
        """
        if not self.otp:
            return {
                'success': False,
                'message_sid': None,
                'error': 'OTP code is required'
            }

        try:
            message_body = f"Your OTP for MediCare Pharmacy is: {self.otp}\nValid for 10 minutes."
            
            message = self.client.messages.create(
                body=message_body,
                from_=self.from_number,
                to=f"+91{self.phone_number}" if len(self.phone_number) == 10 else f"+{self.phone_number}"
            )

            logger.info(f"OTP sent successfully to {self.phone_number}. Message SID: {message.sid}")
            
            return {
                'success': True,
                'message_sid': message.sid,
                'error': None
            }

        except Exception as e:
            logger.error(f"Failed to send OTP to {self.phone_number}: {str(e)}")
            
            return {
                'success': False,
                'message_sid': None,
                'error': str(e)
            }

    def send_appointment_confirmation(self, doctor_name, appointment_date, appointment_id):
        """
        Send appointment confirmation SMS.
        
        Args:
            doctor_name (str): Name of the doctor
            appointment_date (str): Date and time of appointment
            appointment_id (str): UUID of the appointment
            
        Returns:
            dict: { 'success': bool, 'message_sid': str or None, 'error': str or None }
        """
        try:
            message_body = (
                f"Appointment Confirmed!\n"
                f"Doctor: {doctor_name}\n"
                f"Date & Time: {appointment_date}\n"
                f"Ref ID: {appointment_id}\n"
                f"Thank you for booking with MediCare Pharmacy!"
            )
            
            message = self.client.messages.create(
                body=message_body,
                from_=self.from_number,
                to=f"+91{self.phone_number}" if len(self.phone_number) == 10 else f"+{self.phone_number}"
            )

            logger.info(f"Confirmation sent to {self.phone_number}. Message SID: {message.sid}")
            
            return {
                'success': True,
                'message_sid': message.sid,
                'error': None
            }

        except Exception as e:
            logger.error(f"Failed to send confirmation to {self.phone_number}: {str(e)}")
            
            return {
                'success': False,
                'message_sid': None,
                'error': str(e)
            }

    def send_notification(self, message_text):
        """
        Send a generic SMS notification.
        
        Args:
            message_text (str): The notification message to send
            
        Returns:
            dict: { 'success': bool, 'message_sid': str or None, 'error': str or None }
        """
        try:
            message = self.client.messages.create(
                body=message_text,
                from_=self.from_number,
                to=f"+91{self.phone_number}" if len(self.phone_number) == 10 else f"+{self.phone_number}"
            )

            logger.info(f"Notification sent to {self.phone_number}. Message SID: {message.sid}")
            
            return {
                'success': True,
                'message_sid': message.sid,
                'error': None
            }

        except Exception as e:
            logger.error(f"Failed to send notification to {self.phone_number}: {str(e)}")
            
            return {
                'success': False,
                'message_sid': None,
                'error': str(e)
            }
