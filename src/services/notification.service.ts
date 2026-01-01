
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

interface NotificationPayload {
  title: string;
  description: string;
  fields?: { name: string; value: string; inline?: boolean }[];
  url?: string;
  color?: number; // integer color code
}

export const NotificationService = {
  async send(payload: NotificationPayload) {
    if (!DISCORD_WEBHOOK_URL) {
      console.warn("DISCORD_WEBHOOK_URL is not set. Skipping notification.");
      return;
    }

    try {
      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: payload.title,
              description: payload.description,
              url: payload.url,
              color: payload.color || 5814783, // Default brand color (Purple-ish) or similar
              fields: payload.fields,
              footer: {
                text: "JStar FYB Admin",
                icon_url: "https://jstarstudios.com/favicon.ico", // Optional: Update with real icon
              },
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });

      if (!response.ok) {
        console.error("Failed to send discord notification", await response.text());
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  },

  async notifyNewLead(lead: { id: string; topic: string; whatsapp: string; twist: string, status: string }) {
    await this.send({
      title: "🚀 New Lead Captured!",
      description: `A new project idea has been submitted.`,
      color: 5763719, // Green
      fields: [
        { name: "Topic", value: lead.topic, inline: false },
        { name: "Twist", value: lead.twist || "N/A", inline: false },
        { name: "WhatsApp", value: lead.whatsapp, inline: true },
        { name: "Status", value: lead.status, inline: true },
      ],
      url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/leads`,
    });
  },

  async notifyPaymentLinkSent(leadId: string, amount: number, tier: string) {
    await this.send({
      title: "💸 Payment Link Sent",
      description: `Payment link generated for Lead #${leadId.slice(0, 8)}`,
      color: 3447003, // Blue
      fields: [
        { name: "Amount", value: `₦${amount.toLocaleString()}`, inline: true },
        { name: "Tier", value: tier, inline: true },
      ],
    });
  },
  
  async notifyPaymentSuccess(payment: { reference: string; amount: number; userEmail?: string }) {
     await this.send({
      title: "💰 Payment Received!",
      description: `Successful payment processed.`,
      color: 15548997, // Red/Gold (Celebratory?) or Green
      fields: [
        { name: "Reference", value: payment.reference, inline: true },
        { name: "Amount", value: `₦${payment.amount.toLocaleString()}`, inline: true },
        { name: "User", value: payment.userEmail || "Unknown", inline: true },
      ],
    });
  }
};
