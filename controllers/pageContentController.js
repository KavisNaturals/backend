const PageContent = require('../models/PageContent');

const DEFAULTS = {
  'privacy-policy': {
    title: "Privacy Policy",
    content: `1. Information We Collect

When you visit our website, place an order, or create an account, we may collect personal information such as your name, email address, phone number, billing and shipping address, and payment details. We also collect non-personal information like browser type, IP address, and browsing behaviour to improve our services.

2. How We Use Your Information

We use your information to process and fulfil your orders, send order confirmations and shipping updates, improve our website and customer experience, send promotional emails (only with your consent), and to prevent fraud and maintain security.

3. Sharing Your Information

We do not sell, trade, or rent your personal information to third parties. We may share information with trusted service providers (e.g. payment processors, courier partners) who assist us in operating our website and servicing you, subject to confidentiality agreements.

4. Data Security

We implement industry-standard security measures to protect your personal information. All payment transactions are encrypted using SSL technology. However, no method of transmission over the internet is 100% secure.

5. Cookies

Our website uses cookies to enhance your browsing experience. You can choose to disable cookies through your browser settings, though some features of the site may not function properly as a result.

6. Your Rights

You have the right to access, update, or delete your personal information at any time. To exercise these rights, please contact us at support@kavisnaturals.com.

7. Changes to This Policy

We reserve the right to update this Privacy Policy at any time. Changes will be posted on this page with the updated date. We encourage you to review this policy periodically.

8. Contact Us

If you have any questions about this Privacy Policy, please contact us at support@kavisnaturals.com.`,
  },
  'terms-conditions': {
    title: "Terms & Conditions",
    content: `1. Acceptance of Terms

By accessing or using the Kavi's Naturals website, placing an order, or creating an account, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our website.

2. Products & Pricing

All products are subject to availability. We reserve the right to modify prices at any time without prior notice. Prices displayed include applicable taxes unless otherwise stated.

3. Orders & Payments

An order is only confirmed once payment is successfully processed. We accept payments via Razorpay (UPI, cards, net banking). We reserve the right to cancel or refuse any order at our discretion. In case of a failed payment, the order will not be processed.

4. Use of Website

You agree not to misuse our website by engaging in any unlawful activity, attempting to gain unauthorised access, or transmitting harmful content.

5. Intellectual Property

All content on this website — including text, images, logos, and graphics — is the property of Kavi's Naturals and protected by applicable intellectual property laws.

6. Returns & Refunds

Please refer to our Shipping & Returns Policy for complete information on returns, exchanges, and refunds.

7. Limitation of Liability

Kavi's Naturals shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website.

8. Governing Law

These Terms & Conditions are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India.

9. Contact Us

For any questions regarding these Terms & Conditions, please contact us at support@kavisnaturals.com.`,
  },
  'shipping-policy': {
    title: "Shipping & Returns Policy",
    content: `Shipping Policy

Processing Time
All orders are processed within 1–2 business days after successful payment. Orders placed on weekends or public holidays will be processed on the next business day.

Delivery Time
Metro cities: 3–5 business days. Other cities & towns: 5–7 business days. Remote areas: 7–10 business days.

Shipping Charges
We offer free shipping on all orders above Rs.499. Orders below Rs.499 attract a flat shipping charge of Rs.49.

Tracking Your Order
Once your order is dispatched, you will receive a tracking number via email. You can also track your order using our Track Order page.

Returns & Refunds Policy

Return Eligibility
We accept returns within 7 days of delivery for the following reasons: damaged or defective product received, wrong product delivered, or product missing from the order.

How to Initiate a Return
Email us at support@kavisnaturals.com with your order ID and reason for return. Attach clear photos of the product and packaging. Our team will review your request within 2 business days. Upon approval, we will arrange a pickup or provide a return address.

Refund Process
Approved refunds will be processed within 5–7 business days of receiving the returned product. Refunds will be credited to the original payment method.

Non-Returnable Items
Products that have been opened or used, products without original packaging, and items marked as "Final Sale" are not eligible for return.

Contact Us
For shipping or return related queries, please reach out to us at support@kavisnaturals.com.`,
  },
};

// GET /api/pages/:slug — public
exports.getPage = async (req, res) => {
  try {
    const { slug } = req.params;
    let page = await PageContent.findOne({ where: { slug } });

    if (!page) {
      // Auto-create with default content if it exists
      const def = DEFAULTS[slug];
      if (!def) {
        return res.status(404).json({ message: 'Page not found' });
      }
      page = await PageContent.create({ slug, title: def.title, content: def.content });
    }

    res.json(page);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching page', error: error.message });
  }
};

// GET /api/pages — admin: list all pages
exports.getAllPages = async (req, res) => {
  try {
    let pages = await PageContent.findAll({ attributes: ['id', 'slug', 'title', 'updatedAt'] });

    // Ensure all 3 defaults exist
    for (const [slug, def] of Object.entries(DEFAULTS)) {
      if (!pages.find(p => p.slug === slug)) {
        const created = await PageContent.create({ slug, title: def.title, content: def.content });
        pages.push(created);
      }
    }

    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pages', error: error.message });
  }
};

// PUT /api/pages/:slug — admin only
exports.updatePage = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, content } = req.body;

    let page = await PageContent.findOne({ where: { slug } });
    if (!page) {
      const def = DEFAULTS[slug];
      page = await PageContent.create({ slug, title: title || def?.title || slug, content: content || '' });
    } else {
      await page.update({ title: title || page.title, content: content ?? page.content });
    }

    res.json(page);
  } catch (error) {
    res.status(500).json({ message: 'Error updating page', error: error.message });
  }
};
