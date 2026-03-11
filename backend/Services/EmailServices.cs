using MailKit.Net.Smtp;
using MimeKit;

namespace InventoryMS.Services
{
    public class EmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendOverdueEmailAsync(string toEmail, string userName, string assetName, string serialNumber, DateTime dueDate, int daysOverdue)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress("IT Equipment System", _configuration["Email:SenderEmail"]));
                message.To.Add(new MailboxAddress(userName, toEmail));
                message.Subject = $"OVERDUE: {assetName} - Return Required";

                message.Body = new TextPart("html")
                {
                    Text = $@"
                        <h2>Equipment Overdue Notice</h2>
                        <p>Dear {userName},</p>
                        <p>The following equipment is overdue for return:</p>
                        <ul>
                            <li><strong>Item:</strong> {assetName}</li>
                            <li><strong>Serial:</strong> {serialNumber}</li>
                            <li><strong>Due Date:</strong> {dueDate:dd MMM yyyy}</li>
                            <li><strong>Days Overdue:</strong> {daysOverdue} days</li>
                        </ul>
                        <p><strong>Please return this equipment immediately.</strong></p>
                        <p>Best regards,<br/>Computer Science IT Team</p>
                    "
                };

                using var client = new SmtpClient();
                await client.ConnectAsync(_configuration["Email:SmtpServer"], 587, MailKit.Security.SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(_configuration["Email:SenderEmail"], _configuration["Email:Password"]);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation($"Email sent to {toEmail}");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to send email: {ex.Message}");
            }
        }
       public async Task SendPasswordResetEmailAsync(string toEmail, string userName, string resetToken)
{
    _logger.LogInformation($"Attempting to send password reset email to {toEmail}");
    
    try
    {
        _logger.LogInformation("Creating email message...");
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("IT Equipment System", _configuration["Email:SenderEmail"]));
        message.To.Add(new MailboxAddress(userName, toEmail));
        message.Subject = "Password Reset Request";

        message.Body = new TextPart("html")
        {
            Text = $@"
                <h2>Password Reset</h2>
                <p>Dear {userName},</p>
                <p>Your password reset code is: <strong>{resetToken}</strong></p>
                <p>This code expires in 1 hour.</p>
            "
        };

        _logger.LogInformation($"Connecting to SMTP server: {_configuration["Email:SmtpServer"]}");
        
        using var client = new SmtpClient();
        await client.ConnectAsync(
            _configuration["Email:SmtpServer"],
            587,
            MailKit.Security.SecureSocketOptions.StartTls
        );

        _logger.LogInformation($"Authenticating with email: {_configuration["Email:SenderEmail"]}");
        
        await client.AuthenticateAsync(
            _configuration["Email:SenderEmail"],
            _configuration["Email:Password"]
        );

        _logger.LogInformation("Sending email...");
        await client.SendAsync(message);
        await client.DisconnectAsync(true);

        _logger.LogInformation($"✅ Password reset email sent successfully to {toEmail}");
    }
    catch (Exception ex)
    {
        _logger.LogError($"❌ FAILED to send password reset email to {toEmail}");
        _logger.LogError($"Error type: {ex.GetType().Name}");
        _logger.LogError($"Error message: {ex.Message}");
        _logger.LogError($"Stack trace: {ex.StackTrace}");
        throw;
    }
}
}
}