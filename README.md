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

## Webhook Mapping

The service supports three ways to map emails to Discord webhooks:

1. **Direct Mapping**: Map specific email addresses to specific Discord webhooks
2. **Catch-all Webhook**: Use a single webhook for any unmapped email address
3. **Default Fallback**: Use a default webhook if no other mapping matches

### Configuration Examples

```bash
# Direct mapping for specific emails
WEBHOOK_MAP_support_example_com=https://discord.com/api/webhooks/123/abc
WEBHOOK_MAP_sales_example_com=https://discord.com/api/webhooks/456/def

# Catch-all webhook for any unmapped email
WEBHOOK_MAP_*=https://discord.com/api/webhooks/789/ghi

# Default fallback webhook (legacy support)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/000/xyz
```

Note: Replace dots (.) with underscores (_) in email addresses when setting environment variables.

## Local Setup

1. Install dependencies:
```bash
npm install
```

2. Set your webhook mappings:
   ```bash
   # Windows
   set WEBHOOK_MAP_email_example_com=https://discord.com/api/webhooks/...
   set WEBHOOK_MAP_*=https://discord.com/api/webhooks/...

   # Unix/Linux/MacOS
   export WEBHOOK_MAP_email_example_com=https://discord.com/api/webhooks/...
   export WEBHOOK_MAP_*=https://discord.com/api/webhooks/...
   ```

3. Start the server:
```bash
npm start
```

## Heroku Deployment

1. Create a new Heroku app:
```bash
heroku create your-app-name
```

2. Set your webhook mappings in Heroku:
```bash
# Direct mapping
heroku config:set WEBHOOK_MAP_support_example_com=https://discord.com/api/webhooks/...

# Catch-all webhook
heroku config:set WEBHOOK_MAP_*=https://discord.com/api/webhooks/...
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

## Error Handling

- The service includes error handling for:
  - Missing webhook configurations
  - Invalid webhook data
  - Discord API errors
  - Large attachments
  - Multiple webhook delivery failures

## Environment Variables

- `PORT`: Server port (default: 3000)
- `WEBHOOK_MAP_*`: Catch-all webhook URL
- `WEBHOOK_MAP_[email]`: Specific email mapping (replace dots with underscores)
- `DISCORD_WEBHOOK_URL`: Legacy fallback webhook URL

## Limitations

- Discord has a maximum embed size limit of 6000 characters
- Maximum of 10 embeds per message
- File size limits apply based on Discord's restrictions
- Environment variable names must use underscores instead of dots for email addresses

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
