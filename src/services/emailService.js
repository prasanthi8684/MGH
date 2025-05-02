import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'cinna20070613@gmail.com',
      pass: 'urxs ylcm zclg oqnf'
    }
  });

export const sendEmail = async ({ to, subject, proposal, pdfBuffer }) => {
  console.log('test mail')
  const mailOptions = {
    from: `"MH GLOBAL" <${process.env.SMTP_USER}>`,
    to:'prasanthileela2007@gmail.com',
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Dear ${proposal.clientName},</h2>
        
        <p>Thank you for your interest in our products. Please find attached our proposal for your review.</p>
        
        <h3>Proposal Details:</h3>
        <ul>
          <li>Proposal Name: ${proposal.name}</li>
          <li>Total Amount: RM ${proposal.totalAmount.toFixed(2)}</li>
          <li>Date: ${new Date(proposal.date).toLocaleDateString()}</li>
        </ul>
        
        <p>If you have any questions or would like to discuss this proposal further, please don't hesitate to contact us.</p>
        
        <p style="margin-top: 20px;">Best regards,<br>MH GLOBAL Team</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
          <p>This email and any files transmitted with it are confidential and intended solely for the use of the individual or entity to whom they are addressed.</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `proposal-${proposal._id}.pdf`,
        content: pdfBuffer
      }
    ]
  };

  await transporter.sendMail(mailOptions);
};