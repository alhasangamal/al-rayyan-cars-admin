export async function sendWhatsAppMessage(phone: string, message: string) {
  // UltraMsg API or GreenAPI configuration
  const instanceId = process.env.WHATSAPP_INSTANCE_ID;
  const token = process.env.WHATSAPP_TOKEN;
  
  if (!instanceId || !token) {
    console.warn('WhatsApp credentials are not configured in .env.local. Message skipped.');
    return false;
  }

  // Format the phone number to ensure it has the country code
  // Assuming Egyptian numbers starting with 01
  let formattedPhone = phone.replace(/\D/g, ''); // Remove non-digits
  if (formattedPhone.startsWith('01')) {
    formattedPhone = '2' + formattedPhone;
  }

  console.log(`[WhatsApp] Attempting to send message to: ${formattedPhone} using instance: ${instanceId}`);

  try {
    // UltraMsg example endpoint:
    const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        token: token,
        to: formattedPhone,
        body: message,
      }),
    });

    const data = await response.json();
    if (data.sent || data.status === 'success') {
      console.log('WhatsApp message sent successfully to', formattedPhone);
      return true;
    } else {
      console.error('Failed to send WhatsApp message:', data);
      return false;
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
}
