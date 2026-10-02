const nodemailer = require('nodemailer');

// ✅ Configure transporter (use your email credentials)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Send email notification when a project is archived
 */
exports.sendProjectArchivedNotification = async (employee, project, adminName) => {
  try {
    const mailOptions = {
      to: employee.email,
      subject: `📋 Project "${project.name}" has been archived`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1a1a2e; color: #ffffff; border-radius: 12px;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #2a2a4a;">
            <h1 style="color: #3b82f6; margin: 0;">ResourceFlow</h1>
            <p style="color: #9ca3af; margin: 0;">Smart Resource Allocation</p>
          </div>
          
          <div style="padding: 30px 0;">
            <h2 style="color: #ffffff;">Hi ${employee.name},</h2>
            
            <p style="color: #d1d5db; line-height: 1.6;">
              The project <strong style="color: #ffffff;">"${project.name}"</strong> you were allocated to has been <strong style="color: #f59e0b;">archived</strong> by <strong style="color: #ffffff;">${adminName}</strong>.
            </p>
            
            <div style="background: #2a2a4a; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="color: #d1d5db; margin: 0;">
                <strong>📋 Project Details:</strong><br>
                Name: ${project.name}<br>
                Status: <span style="color: #f59e0b;">Archived</span><br>
                Your Allocation: ${employee.allocatedHours || 'N/A'} hours/week
              </p>
            </div>
            
            <p style="color: #d1d5db; line-height: 1.6;">
              Your allocation has been automatically closed. If you have any questions, please contact your manager.
            </p>
            
            <div style="background: #0a0a0a; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                💡 <strong>What happens next?</strong><br>
                • You will no longer see this project on your dashboard<br>
                • Your hours will be freed up for new projects<br>
                • Your manager may reach out about reallocation
              </p>
            </div>
          </div>
          
          <div style="border-top: 1px solid #2a2a4a; padding-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>This is an automated notification from ResourceFlow.</p>
            <p>© ${new Date().getFullYear()} ResourceFlow. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${employee.email}`);
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
  }
};