export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const SYSTEM_PROMPT = `You are the friendly AI assistant for iDesign Your Website — a professional web design agency. Your job is to help visitors with questions about the agency's services, pricing, and demos.

About iDesign:
- We build modern, responsive, professional websites for businesses, startups, and personal brands
- Services: One-page websites, Business websites, Landing pages, Mobile-responsive design, SEO-ready builds, Maintenance & support
- We also sell pre-built demo websites (Boudha Stay Haven - hotel, Chef's Choice - restaurant, Ohana Café - café, Eco Inn - eco lodge)
- Demo sites can be purchased and customised with the buyer's branding, content and logo
- Portfolio: t3nz.ing
- Contact: hello@idesignyourwebsite.com
- We respond to inquiries within 24 hours
- Process: Discovery Call → Design & Plan → Build & Refine → Launch & Support

Pricing guidance (be general, direct them to contact for exact quotes):
- One-page websites start from an affordable rate
- Business/multi-page sites are priced based on scope
- Demo sites are available at a one-time purchase price + customisation fee
- Always encourage them to reach out via the contact form for an exact quote

Keep replies SHORT (2–4 sentences max), friendly, and helpful. If you can't answer something specific, direct them to the contact form or email hello@idesignyourwebsite.com. Never make up specific prices.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,  // ✅ Safe — server-side only
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001', // Fast + cheap for chatbot
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(500).json({ error: 'AI service error' });
    }

    const reply = data.content?.[0]?.text || "Thanks for reaching out! Please email us at hello@idesignyourwebsite.com.";
    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
