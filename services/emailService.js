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

/**
 * Send password reset email
 */
exports.sendPasswordReset = async (user, resetToken) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;

  const resetUrl = `${process.env.FRONTEND_URL || 'https://kavisnaturals.com'}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: `Reset Your Password – Kavi's Naturals`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
        <div style="background:#9EE94C;padding:24px;text-align:center">
          <h1 style="margin:0;font-size:24px">Kavi's Naturals</h1>
        </div>
        <div style="padding:24px">
          <h2>Reset Your Password</h2>
          <p>Hi ${user.name || 'Customer'},</p>
          <p>We received a request to reset the password for your account associated with <strong>${user.email}</strong>.</p>
          <p>Click the button below to reset your password. This link is valid for <strong>1 hour</strong>.</p>
          <div style="text-align:center;margin:32px 0">
            <a href="${resetUrl}" style="background:#9EE94C;color:#000;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px">
              Reset Password
            </a>
          </div>
          <p style="font-size:13px;color:#666">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="font-size:12px;word-break:break-all;color:#003F62">${resetUrl}</p>
          <p style="margin-top:24px;font-size:13px;color:#666">If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
          <p style="color:#666;font-size:12px;margin-top:32px">© 2025 Kavi's Naturals. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};

/**
 * Send welcome email after registration
 */
exports.sendWelcome = async (user) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;

  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: `Welcome to Kavi's Naturals! 🌿`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
        <div style="background:#9EE94C;padding:24px;text-align:center">
          <h1 style="margin:0;font-size:24px">Kavi's Naturals</h1>
        </div>
        <div style="padding:24px">
          <h2>Welcome, ${user.name || 'Friend'}! 🎉</h2>
          <p>Thank you for creating an account with <strong>Kavi's Naturals</strong>. We're thrilled to have you as part of our community!</p>
          <p>Discover our 100% natural, plant-based products made with love and traditional methods.</p>
          <div style="text-align:center;margin:32px 0">
            <a href="${process.env.FRONTEND_URL || 'https://kavisnaturals.com'}/shop" style="background:#9EE94C;color:#000;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px">
              Start Shopping
            </a>
          </div>
          <p style="color:#666;font-size:12px;margin-top:32px">© 2025 Kavi's Naturals. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};
