import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppRequest {
  message: string;
  orderDetails?: {
    productName: string;
    quantity: number;
    customerName: string;
    customerEmail: string;
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = Deno.env.get('TWILIO_WHATSAPP_FROM');
    const toNumber = Deno.env.get('NOTIFICATION_PHONE');

    if (!accountSid || !authToken || !fromNumber || !toNumber) {
      throw new Error('Missing Twilio configuration');
    }

    const { message, orderDetails }: WhatsAppRequest = await req.json();

    // Build the message body
    let messageBody = message;
    if (orderDetails) {
      messageBody = `🛒 New Order Received!\n\n` +
        `Product: ${orderDetails.productName}\n` +
        `Quantity: ${orderDetails.quantity}\n` +
        `Customer: ${orderDetails.customerName}\n` +
        `Email: ${orderDetails.customerEmail}`;
    }

    console.log('Sending WhatsApp message to:', toNumber);
    console.log('Message:', messageBody);

    // Send WhatsApp message via Twilio API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append('To', `whatsapp:${toNumber}`);
    formData.append('From', `whatsapp:${fromNumber}`);
    formData.append('Body', messageBody);

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const result = await response.json();
    console.log('Twilio response:', result);

    if (!response.ok) {
      throw new Error(result.message || 'Failed to send WhatsApp message');
    }

    return new Response(
      JSON.stringify({ success: true, sid: result.sid }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending WhatsApp:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
