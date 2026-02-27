const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for others
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = `"Kavi's Naturals" <${process.env.SMTP_USER || 'no-reply@kavisnaturals.com'}>`;

/**
 * Send order confirmation email to customer
 */
exports.sendOrderConfirmation = async (order, user, items) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return; // skip if not configured

  const itemRows = items.map(item => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${item.name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₹${Number(item.price).toFixed(2)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₹${(Number(item.price) * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const addr = order.shipping_address || {};
  const addressStr = [addr.flat_house_no, addr.area_street, addr.city, addr.state, addr.pincode, addr.country].filter(Boolean).join(', ');

  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: `Order Confirmed #${order.id.slice(0, 8).toUpperCase()} – Kavi's Naturals`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
        <div style="background:#9EE94C;padding:24px;text-align:center">
          <h1 style="margin:0;font-size:24px">Kavi's Naturals</h1>
        </div>
        <div style="padding:24px">
          <h2 style="color:#003F62">Order Confirmed! 🎉</h2>
          <p>Hi ${user.name || 'Customer'},</p>
          <p>Thank you for your order. We've received it and will process it shortly.</p>
          <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:16px 0">
            <p style="margin:0"><strong>Order ID:</strong> #${order.id}</p>
            <p style="margin:4px 0"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p style="margin:4px 0"><strong>Payment:</strong> ${order.payment_status}</p>
            <p style="margin:4px 0"><strong>Deliver to:</strong> ${addressStr || 'N/A'}</p>
          </div>
          <table style="width:100%;border-collapse:collapse;margin-top:16px">
            <thead>
              <tr style="background:#003F62;color:white">
                <th style="padding:10px;text-align:left">Product</th>
                <th style="padding:10px;text-align:center">Qty</th>
                <th style="padding:10px;text-align:right">Price</th>
                <th style="padding:10px;text-align:right">Total</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding:10px;text-align:right;font-weight:bold">Grand Total</td>
                <td style="padding:10px;text-align:right;font-weight:bold">₹${Number(order.total_amount).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          <p style="margin-top:24px">You can track your order at <a href="${process.env.FRONTEND_URL || 'https://kavisnaturals.com'}/track-order" style="color:#003F62">Track Order</a>.</p>
          <p style="color:#666;font-size:12px;margin-top:32px">© 2025 Kavi's Naturals. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};

/**
 * Send order status update email to customer
 */
exports.sendStatusUpdate = async (order, user) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;

  const statusLabel = {
    pending: 'Pending',
    processing: 'Processing',
    out_for_delivery: 'Out for Delivery',
    shipped: 'Shipped',
    delivered: 'Delivered 🎉',
    cancelled: 'Cancelled',
    returned: 'Returned',
  }[order.delivery_status] || order.delivery_status;

  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: `Your Order is now "${statusLabel}" – Kavi's Naturals`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
        <div style="background:#9EE94C;padding:24px;text-align:center">
          <h1 style="margin:0;font-size:24px">Kavi's Naturals</h1>
        </div>
        <div style="padding:24px">
          <h2 style="color:#003F62">Order Status Update</h2>
          <p>Hi ${user.name || 'Customer'},</p>
          <p>Your order <strong>#${order.id}</strong> status has been updated to:</p>
          <div style="background:#003F62;color:white;border-radius:8px;padding:16px;text-align:center;font-size:20px;font-weight:bold;margin:16px 0">
            ${statusLabel}
          </div>
          <p>Track your order: <a href="${process.env.FRONTEND_URL || 'https://kavisnaturals.com'}/track-order" style="color:#003F62">Click here</a></p>
          <p style="color:#666;font-size:12px;margin-top:32px">© 2025 Kavi's Naturals. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};
