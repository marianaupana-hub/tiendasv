const { initializeApp } = require('firebase-admin/app');
const { FieldValue, Timestamp, getFirestore } = require('firebase-admin/firestore');
const { defineSecret } = require('firebase-functions/params');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const nodemailer = require('nodemailer');

initializeApp();

const DATA_OWNER_UID = 'CebhzopoNTX70krUuVqv7aELAew2';
const SMTP_HOST = defineSecret('SMTP_HOST');
const SMTP_PORT = defineSecret('SMTP_PORT');
const SMTP_USER = defineSecret('SMTP_USER');
const SMTP_PASSWORD = defineSecret('SMTP_PASSWORD');
const SALES_NOTIFICATION_TO = defineSecret('SALES_NOTIFICATION_TO');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatSale(invoice) {
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const lines = items.slice(0, 100).map((item) => {
    const quantity = Math.max(0, Number(item.qty) || 0);
    const name = String(item.name || 'Producto').replace(/[\r\n]/g, ' ').slice(0, 200);
    return `${quantity} x ${name}`;
  });
  const itemText = lines.join('\n') || 'Detalle no disponible';
  const itemHtml = lines.map((line) => `<li>${escapeHtml(line)}</li>`).join('');
  const number = Number(invoice.n) || 0;
  const total = Number(invoice.total);
  if (!Number.isFinite(total) || total <= 0) {
    throw new Error('La venta no tiene un total válido.');
  }

  return {
    subject: `Nueva venta #${number} · Seven Roses`,
    text: [
      'Se registró una nueva venta en Seven Roses.',
      `Venta: #${number}`,
      `Fecha: ${String(invoice.date || 'No disponible').slice(0, 100)}`,
      `Sucursal: ${String(invoice.branch || 'Principal').slice(0, 100)}`,
      `Forma de pago: ${String(invoice.pay || 'No especificada').slice(0, 50)}`,
      `Total: Q${total.toFixed(2)}`,
      '',
      'Productos:',
      itemText,
    ].join('\n'),
    html: `<h2>Nueva venta en Seven Roses</h2>
      <p><b>Venta:</b> #${number}<br>
      <b>Fecha:</b> ${escapeHtml(String(invoice.date || 'No disponible').slice(0, 100))}<br>
      <b>Sucursal:</b> ${escapeHtml(String(invoice.branch || 'Principal').slice(0, 100))}<br>
      <b>Forma de pago:</b> ${escapeHtml(String(invoice.pay || 'No especificada').slice(0, 50))}<br>
      <b>Total:</b> Q${total.toFixed(2)}</p>
      <p><b>Productos:</b></p><ul>${itemHtml || '<li>Detalle no disponible</li>'}</ul>`,
  };
}

exports.emailSaleNotification = onDocumentCreated({
  document: 'facturasUsers/{userId}/records/{recordId}',
  region: 'us-central1',
  retry: true,
  secrets: [SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SALES_NOTIFICATION_TO],
}, async (event) => {
  const snapshot = event.data;
  if (!snapshot || event.params.userId !== DATA_OWNER_UID) return;
  if (!event.params.recordId.startsWith('sevenroses_v1_invoice_')) return;

  const record = snapshot.data();
  if (!record || record.type !== 'invoice' || !record.data) return;

  const invoice = record.data;
  const notificationId = `${event.params.userId}_${event.params.recordId}`;
  const notificationRef = getFirestore().collection('salesEmailNotifications').doc(notificationId);
  const now = Date.now();
  let claimed = false;

  await getFirestore().runTransaction(async (transaction) => {
    const notification = await transaction.get(notificationRef);
    const state = notification.exists ? notification.data() : null;
    if (state && state.status === 'sent') return;
    const leaseUntil = state && state.leaseUntil;
    if (state && state.status === 'sending' &&
        leaseUntil && typeof leaseUntil.toMillis === 'function' &&
        leaseUntil.toMillis() > now) return;

    transaction.set(notificationRef, {
      status: 'sending',
      leaseUntil: Timestamp.fromMillis(now + 10 * 60 * 1000),
      invoiceId: String(invoice.id || event.params.recordId).slice(0, 160),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    claimed = true;
  });

  if (!claimed) return;

  try {
    const port = Number(SMTP_PORT.value());
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('SMTP_PORT debe ser un puerto válido.');
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST.value(),
      port,
      secure: port === 465,
      auth: {
        user: SMTP_USER.value(),
        pass: SMTP_PASSWORD.value(),
      },
    });
    const message = formatSale(invoice);
    await transporter.sendMail({
      from: `Seven Roses <${SMTP_USER.value()}>`,
      to: SALES_NOTIFICATION_TO.value(),
      ...message,
    });
    await notificationRef.set({
      status: 'sent',
      sentAt: FieldValue.serverTimestamp(),
      leaseUntil: FieldValue.delete(),
    }, { merge: true });
  } catch (error) {
    await notificationRef.set({
      status: 'failed',
      leaseUntil: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    throw error;
  }
});
