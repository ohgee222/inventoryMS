namespace InventoryMS.Helpers
{
    public static class EmailValidator
    {
        public static bool IsValidUniversityEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;
            // Convert to lowercase for comparison
            email = email.ToLower().Trim();
            // Must be valid email format
            if (!email.Contains("@") || !email.Contains("."))
                return false;
            // Must end with hull.ac.uk or @hull.ac.uk
            // doing this as it is a custom hull cs inventory system and i want to restrict to hull emails only
            return email.EndsWith("@hull.ac.uk");            
        }

        public static string GetEmailError(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return "Email is required";

            if (!email.Contains("@"))
                return "Invalid email format";

            if (!IsValidUniversityEmail(email))
                return "Only University of Hull email addresses are allowed (@hull.ac.uk)";

            return null;
        }
    }
}