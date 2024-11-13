# Email to Discord Webhook Converter

This service converts ImprovMX email webhooks to Discord webhooks. It receives email data from ImprovMX and forwards it to Discord in a nicely formatted message with embeds. Supports multiple Discord webhooks based on recipient email addresses.

## Features

- Converts email content to Discord embeds
- Supports multiple Discord webhooks based on recipient email
- Maps different email addresses to different Discord channels
- Displays sender, recipient, and timestamp information
- Handles email attachments and inline images
- Shows attachment information (name, type, size)
- Configurable through environment variables
- Automated testing with GitHub Actions

## Webhook Mapping

The service supports three ways to map emails to Discord webhooks:

1. **Direct Mapping**: Map specific email addresses to specific Discord webhooks
2. **Catch-all Webhook**: Use a single webhook for any unmapped email address
3. **Default Fallback**: Use a default webhook if no other mapping matches

### Configuration Examples

```bash
# Direct mapping for specific emails (supports both MAP and MATCH prefixes)
WEBHOOK_MAP_support_example_com=https://discord.com/api/webhooks/123/abc
WEBHOOK_MATCH_sales_example_com=https://discord.com/api/webhooks/456/def

# Support for hyphens in email addresses
WEBHOOK_MAP_support-tickets_example_com=https://discord.com/api/webhooks/789/jkl

# Catch-all webhook for any unmapped email
WEBHOOK_MAP_CATCHALL=https://discord.com/api/webhooks/789/ghi

# Default fallback webhook (legacy support)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/000/xyz
```

Note: 
- Replace dots (.) with underscores (_) in email addresses when setting environment variables
- Both `WEBHOOK_MAP_` and `WEBHOOK_MATCH_` prefixes are supported
- Hyphens (-) in email addresses are supported and will be converted to dots (.) automatically
- Example: For email "support-tickets@example.com", use `WEBHOOK_MAP_support-tickets_example_com`

## Local Setup

1. Install dependencies:
```bash
npm install
```

2. Set your webhook mappings:
   ```bash
   # Windows
   set WEBHOOK_MAP_email_example_com=https://discord.com/api/webhooks/...
   set WEBHOOK_MATCH_support-tickets_example_com=https://discord.com/api/webhooks/...
   set WEBHOOK_MAP_CATCHALL=https://discord.com/api/webhooks/...

   # Unix/Linux/MacOS
   export WEBHOOK_MAP_email_example_com=https://discord.com/api/webhooks/...
   export WEBHOOK_MATCH_support-tickets_example_com=https://discord.com/api/webhooks/...
   export WEBHOOK_MAP_CATCHALL=https://discord.com/api/webhooks/...
   ```

3. Start the server:
```bash
npm start
```

## Testing

### Local Testing

Run the test suite locally:
```bash
npm test
```

### Continuous Integration

This project uses GitHub Actions for automated testing. The workflow:
- Runs on push to main/master branches
- Runs on pull requests to main/master branches
- Tests against Node.js versions 16.x, 18.x, and 20.x
- Automatically sets up test environment variables
- Runs the full test suite

View test results in the Actions tab of the GitHub repository.

## Heroku Deployment

1. Create a new Heroku app:
```bash
heroku create your-app-name
```

2. Set your webhook mappings in Heroku:
```bash
# Direct mapping (supports both MAP and MATCH prefixes)
heroku config:set WEBHOOK_MAP_support_example_com=https://discord.com/api/webhooks/...
heroku config:set WEBHOOK_MATCH_support-tickets_example_com=https://discord.com/api/webhooks/...

# Catch-all webhook (use CATCHALL instead of * for Heroku compatibility)
heroku config:set WEBHOOK_MAP_CATCHALL=https://discord.com/api/webhooks/...
```

3. Deploy to Heroku:
```bash
git add .
git commit -m "Initial commit"
git push heroku main
```

4. Ensure at least one dyno is running:
```bash
heroku ps:scale web=1
```

5. Get your webhook URL:
```bash
heroku open
```
Your webhook URL will be: `https://your-app-name.herokuapp.com/webhook`

## ImprovMX Configuration

1. Go to your ImprovMX dashboard
2. Instead of an email address, enter your webhook URL as the forwarding address:
   ```
   https://your-app-name.herokuapp.com/webhook
   ```
   Replace `your-app-name` with your actual Heroku app name.

3. You can set up multiple email forwards to the same webhook URL - the service will route them to the appropriate Discord channels based on your configuration.

## Webhook Format

### Input (ImprovMX)
The service expects the standard ImprovMX webhook format:
```json
{
    "headers": { ... },
    "to": [
        {
            "name": "Example user",
            "email": "example@yourdomain.com"
        }
    ],
    "from": {
        "name": "Email Test",
        "email": "test@example.com"
    },
    "subject": "Email Subject",
    "text": "Email body text",
    "html": "Email body HTML",
    "attachments": [ ... ],
    "inlines": [ ... ]
}
```

### Output (Discord)
The service converts the email to a Discord message with embeds:
- Main embed with email subject, content, and metadata
- Additional embeds for attachments and inline images
- Formatted timestamps and sender information

## API Endpoints

- `POST /webhook`: Main endpoint for receiving ImprovMX webhooks
- `GET /health`: Health check endpoint (includes count of configured webhook mappings)
- `GET /`: Root endpoint showing service information

## Error Handling

- The service includes error handling for:
  - Missing webhook configurations
  - Invalid webhook data
  - Discord API errors
  - Large attachments
  - Multiple webhook delivery failures

## Environment Variables

- `PORT`: Server port (default: 3000)
- `WEBHOOK_MAP_CATCHALL`: Catch-all webhook URL for unmapped emails
- `WEBHOOK_MAP_[email]` or `WEBHOOK_MATCH_[email]`: Specific email mapping (replace dots with underscores)
- `DISCORD_WEBHOOK_URL`: Legacy fallback webhook URL

## Limitations

- Discord has a maximum embed size limit of 6000 characters
- Maximum of 10 embeds per message
- File size limits apply based on Discord's restrictions
- Environment variable names must use underscores instead of dots for email addresses
- Heroku config vars don't support * character, use CATCHALL instead
- Hyphens in email addresses are automatically converted to dots

## Development

To contribute to this project:

1. Fork the repository
2. Create your feature branch:
```bash
git checkout -b feature/amazing-feature
```
3. Commit your changes:
```bash
git commit -m 'Add some amazing feature'
```
4. Push to the branch:
```bash
git push origin feature/amazing-feature
```
5. Open a Pull Request

### Testing

The project includes a comprehensive test suite:
- Unit tests for email address conversion
- Tests for webhook URL resolution
- Environment variable loading tests
- Support for both MAP and MATCH prefixes
- Hyphen handling in email addresses

Tests are automatically run on:
- Every push to main/master
- Every pull request
- Local development (`npm test`)

The GitHub Actions workflow ensures tests pass across multiple Node.js versions.
