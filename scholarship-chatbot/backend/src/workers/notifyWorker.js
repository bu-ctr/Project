// backend/src/workers/notifyWorker.js
// Simple implementation that can be scheduled via PM2 or node to process pending tasks.
// For now it's a no-op placeholder which you can expand (e.g., processing queue)
const db = require('../db');
const { sendEligibilityEmail } = require('../services/mailer');

async function processPending() {
  console.log('notifyWorker: scanning notifications (placeholder)');
  // Example: find unsent notifications and send email
  // const r = await db.query("SELECT n.*, u.email FROM notifications n JOIN users u ON u.id = n.user_id WHERE n.sent IS NOT true");
  // for (const n of r.rows) { await sendEligibilityEmail(n.email, {title: n.payload.title}); await db.query('UPDATE notifications SET sent=true WHERE id=$1',[n.id]); }
}

setInterval(() => {
  processPending().catch(err => console.error('worker error', err));
}, 60_000);
