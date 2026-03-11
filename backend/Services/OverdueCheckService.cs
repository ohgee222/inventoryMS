using Microsoft.EntityFrameworkCore;
using InventoryMS.Data;

namespace InventoryMS.Services
{
    public class OverdueCheckService : BackgroundService
    {
        private readonly IServiceProvider _services;
        private readonly ILogger<OverdueCheckService> _logger;

        public OverdueCheckService(IServiceProvider services, ILogger<OverdueCheckService> logger)
        {
            _services = services;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Email notification service started");

            // Wait 30 seconds after startup
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CheckOverdueLoans();
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Error checking overdue loans: {ex.Message}");
                }

                // Wait 24 hours before next check
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }

        private async Task CheckOverdueLoans()
        {
            _logger.LogInformation("Checking for overdue loans...");

            using var scope = _services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<InventoryDb>();
            var emailService = scope.ServiceProvider.GetRequiredService<EmailService>();

            // Use RAW SQL to avoid EF enum casting issues
            var connection = context.Database.GetDbConnection();
            await connection.OpenAsync();

            using var command = connection.CreateCommand();
            command.CommandText = @"
        SELECT 
            l.Id as LoanId,
            l.DueDate,
            u.Email,
            CONCAT(u.Fname, ' ', u.Lname) as UserName,
            a.Name as AssetName,
            a.SerialNumber,
            DATEDIFF(NOW(), l.DueDate) as DaysOverdue
        FROM Loans l
        INNER JOIN Assets a ON l.AssetId = a.Id
        INNER JOIN Users u ON l.UserId = u.id
        WHERE l.ReturnDate IS NULL AND l.DueDate < NOW()";

            var overdueLoans = new List<(int loanId, DateTime dueDate, string email, string userName, string assetName, string serialNumber, int daysOverdue)>();

            using (var reader = await command.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    overdueLoans.Add((
                        loanId: reader.GetInt32(0),
                        dueDate: reader.GetDateTime(1),
                        email: reader.GetString(2),
                        userName: reader.GetString(3),
                        assetName: reader.GetString(4),
                        serialNumber: reader.GetString(5),
                        daysOverdue: reader.GetInt32(6)
                    ));
                }
            }

            _logger.LogInformation($"Found {overdueLoans.Count} overdue loans");

            foreach (var loan in overdueLoans)
            {
                try
                {
                    _logger.LogInformation($"Sending email to {loan.email} for loan {loan.loanId}");

                    await emailService.SendOverdueEmailAsync(
                        toEmail: loan.email,
                        userName: loan.userName,
                        assetName: loan.assetName,
                        serialNumber: loan.serialNumber,
                        dueDate: loan.dueDate,
                        daysOverdue: loan.daysOverdue
                    );

                    _logger.LogInformation($"Email sent successfully for loan {loan.loanId}");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Failed to send email for loan {loan.loanId}");
                }
            }
        }
    }
}