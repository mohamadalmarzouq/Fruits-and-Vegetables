import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const smsFromNumber = process.env.TWILIO_PHONE_NUMBER;
const whatsappFromNumber = process.env.TWILIO_WHATSAPP_NUMBER; // For future WhatsApp support

// Initialize Twilio client
let client = null;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
  console.log('Twilio client initialized successfully');
  console.log('SMS From Number:', smsFromNumber || 'NOT SET');
} else {
  console.warn('Twilio credentials not configured. SMS notifications will be disabled.');
  console.warn('TWILIO_ACCOUNT_SID:', accountSid ? 'SET' : 'NOT SET');
  console.warn('TWILIO_AUTH_TOKEN:', authToken ? 'SET' : 'NOT SET');
  console.warn('TWILIO_PHONE_NUMBER:', smsFromNumber ? 'SET' : 'NOT SET');
}

/**
 * Format phone number to international E.164 format
 * @param {string} phone - Phone number in any format
 * @returns {string|null} - Formatted phone number or null if invalid
 */
function formatPhoneNumber(phone) {
  if (!phone) return null;
  
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If already starts with +, return as is (assuming it's correct format)
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // If starts with country code (e.g., 965 for Kuwait, 1 for US)
  if (cleaned.startsWith('965')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('1') && cleaned.length === 11) {
    return `+${cleaned}`;
  }
  
  // If no country code, assume Kuwait (+965)
  if (cleaned.length >= 8 && cleaned.length <= 10) {
    return `+965${cleaned}`;
  }
  
  // If US number without country code
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  
  return null;
}

/**
 * Build order notification message
 * Keep it short for SMS (under 160 chars for single SMS, or optimize for multi-part)
 * @param {Object} order - Order object
 * @param {Array} vendorItems - Array of items for this vendor
 * @returns {string} - Formatted message
 */
function buildOrderMessage(order, vendorItems) {
  // Short format: "2kg Apple(Spain), 1kg Cucumber(KW)"
  const itemsList = vendorItems.map(item => 
    `${item.quantity}${item.unit} ${item.productName}(${item.origin})`
  ).join(', ');
  
  const total = vendorItems.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
  const orderShortId = order.id.slice(0, 8);
  
  // Compact message format (without link for now)
  return `🛒 New Order #${orderShortId}\n` +
    `${itemsList}\n` +
    `Total: ${total.toFixed(2)} KWD\n` +
    `Please check your vendor dashboard for details.`;
}

/**
 * Send SMS notification
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} message - Message content
 * @returns {Promise<Object>} - Result object
 */
export async function sendSMS(phoneNumber, message) {
  if (!client) {
    throw new Error('Twilio client not initialized. Check environment variables.');
  }

  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!formattedPhone) {
      throw new Error('Invalid phone number format');
    }

    const result = await client.messages.create({
      body: message,
      from: smsFromNumber,
      to: formattedPhone
    });

    return {
      success: true,
      channel: 'sms',
      messageSid: result.sid,
      status: result.status,
      to: formattedPhone
    };
  } catch (error) {
    console.error('SMS send error:', error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
}

/**
 * Send WhatsApp notification (for future implementation)
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} message - Message content
 * @returns {Promise<Object>} - Result object
 */
export async function sendWhatsApp(phoneNumber, message) {
  if (!client) {
    throw new Error('Twilio client not initialized. Check environment variables.');
  }

  if (!whatsappFromNumber) {
    throw new Error('WhatsApp number not configured');
  }

  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!formattedPhone) {
      throw new Error('Invalid phone number format');
    }

    const result = await client.messages.create({
      body: message,
      from: whatsappFromNumber,
      to: `whatsapp:${formattedPhone}`
    });

    return {
      success: true,
      channel: 'whatsapp',
      messageSid: result.sid,
      status: result.status,
      to: formattedPhone
    };
  } catch (error) {
    console.error('WhatsApp send error:', error);
    throw new Error(`Failed to send WhatsApp: ${error.message}`);
  }
}

/**
 * Send order notification to vendor based on their preference
 * @param {Object} vendor - Vendor user object with phoneNumber and notificationPreference
 * @param {Object} order - Order object
 * @param {Array} vendorItems - Array of order items for this vendor
 * @returns {Promise<Object>} - Result object
 */
export async function sendOrderNotification(vendor, order, vendorItems) {
  if (!vendor.phoneNumber) {
    throw new Error('Vendor phone number not provided');
  }

  const message = buildOrderMessage(order, vendorItems);
  const preference = vendor.notificationPreference || 'sms';
  
  const results = [];
  
  try {
    // Send via SMS if preference includes SMS
    if (preference === 'sms' || preference === 'both') {
      const smsResult = await sendSMS(vendor.phoneNumber, message);
      results.push(smsResult);
    }
    
    // Send via WhatsApp if preference includes WhatsApp (future)
    if (preference === 'whatsapp' || preference === 'both') {
      if (whatsappFromNumber) {
        const whatsappResult = await sendWhatsApp(vendor.phoneNumber, message);
        results.push(whatsappResult);
      } else {
        console.warn('WhatsApp not configured, falling back to SMS');
        if (preference === 'whatsapp') {
          // Fallback to SMS if WhatsApp is preferred but not configured
          const smsResult = await sendSMS(vendor.phoneNumber, message);
          results.push(smsResult);
        }
      }
    }
    
    return {
      success: true,
      results
    };
  } catch (error) {
    // If one channel fails and both are enabled, try the other
    if (preference === 'both' && results.length === 0) {
      try {
        const fallback = await sendSMS(vendor.phoneNumber, message);
        return { success: true, results: [fallback], fallback: true };
      } catch (fallbackError) {
        console.error('All notification channels failed:', fallbackError);
      }
    }
    
    throw error;
  }
}

