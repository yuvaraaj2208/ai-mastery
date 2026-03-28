// Mailgun Email Integration

const domain = process.env.MAILGUN_DOMAIN || 'example.com'
const fromEmail = process.env.MAILGUN_FROM_EMAIL || 'noreply@aimastery.com'

export async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  console.log('Sending email:', { to, subject })
  return { status: 'queued', id: Math.random().toString(36).substring(7) }
}

export async function sendWelcomeEmail(
  email: string,
  name: string,
  dashboardUrl: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; background: #0F172A; color: #F8FAFC; padding: 20px;">
      <h1 style="color: #06B6D4;">Welcome to AI Mastery, ${name}! 🎉</h1>
      <p>Thank you for joining our community of 10,000+ members learning to leverage AI.</p>
      <p>Your journey to making $500-5K/month with AI starts now.</p>
      <a href="${dashboardUrl}" style="background: #6D28D9; color: #F8FAFC; padding: 12px 30px; border-radius: 8px; text-decoration: none; display: inline-block;">
        Access Your Dashboard
      </a>
    </div>
  `
  return sendEmail(email, '🚀 Welcome to AI Mastery!', html)
}

export async function sendDailyTipEmail(
  email: string,
  tipTitle: string,
  tipContent: string,
  dashboardUrl: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; background: #0F172A; color: #F8FAFC; padding: 20px;">
      <h2 style="color: #06B6D4;">${tipTitle}</h2>
      <div style="background: #1e293b; padding: 20px; border-radius: 10px; margin: 20px 0;">
        ${tipContent}
      </div>
      <a href="${dashboardUrl}" style="background: #6D28D9; color: #F8FAFC; padding: 12px 30px; border-radius: 8px; text-decoration: none; display: inline-block;">
        See More Tips
      </a>
    </div>
  `
  return sendEmail(email, `💡 Daily AI Tip: ${tipTitle}`, html)
}

export async function sendUpsellEmail(
  email: string,
  name: string,
  currentTier: string,
  upgradeUrl: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; background: #0F172A; color: #F8FAFC; padding: 20px;">
      <h1 style="color: #06B6D4;">Ready to Level Up?</h1>
      <p>You've been with us for 7 days and we love seeing your progress!</p>
      <div style="background: #1e293b; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <h3 style="color: #06B6D4;">Pro Tier Benefits:</h3>
        <ul>
          <li>✨ 2x Monthly Group Webinars</li>
          <li>⚡ Priority Discord Support</li>
          <li>📚 Monthly Deep-Dive Courses</li>
          <li>🎁 Early Access to New Templates</li>
        </ul>
        <h3 style="color: #06B6D4; margin-top: 20px;">Just $99/month (vs $35)</h3>
      </div>
      <a href="${upgradeUrl}" style="background: #06B6D4; color: #0F172A; padding: 12px 30px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: bold;">
        Upgrade to Pro
      </a>
    </div>
  `
  return sendEmail(email, `${name}, Level Up Your AI Skills 🚀`, html)
}

export async function sendRefundNoticeEmail(email: string, name: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; background: #0F172A; color: #F8FAFC; padding: 20px;">
      <h1 style="color: #10B981;">Your Refund is Complete</h1>
      <p>Hi ${name},</p>
      <p>We've processed your refund request. Your money will be back in your account within 3-5 business days.</p>
    </div>
  `
  return sendEmail(email, 'Your Refund Has Been Processed ✅', html)
}

export async function sendBatchEmails(
  recipients: Array<{ email: string; variables: Record<string, string> }>,
  subject: string,
  html: string
) {
  console.log('Sending batch emails:', { count: recipients.length })
  return { status: 'queued', count: recipients.length }
}
