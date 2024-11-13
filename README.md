# Email to Discord Webhook Converter

This service converts ImprovMX email webhooks to Discord webhooks. It receives email data from ImprovMX and forwards it to Discord in a nicely formatted message with embeds.

## Features

- Converts email content to Discord embeds
- Displays sender, recipient, and timestamp information
- Handles email attachments and inline images
- Shows attachment information (name, type, size)
- Configurable through environment variables

## Local Setup

1. Install dependencies:
```bash
npm install
```

2. Set your Discord webhook URL:
   - Create a webhook URL in your Discord server (Server Settings -> Integrations -> Webhooks)
   - Set it as an environment variable:
```bash
# Windows
set DISCORD_WEBHOOK_URL=your_webhook_url_here

# Unix/Linux/MacOS
export DISCORD_WEBHOOK_URL=your_webhook_url_here
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

2. Set your Discord webhook URL in Heroku:
```bash
heroku config:set DISCORD_WEBHOOK_URL=your_webhook_url_here
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
- `GET /health`: Health check endpoint

## Error Handling

- The service includes error handling for:
  - Missing Discord webhook URL
  - Invalid webhook data
  - Discord API errors
  - Large attachments

## Environment Variables

- `PORT`: Server port (default: 3000)
- `DISCORD_WEBHOOK_URL`: Your Discord webhook URL (required)

## Limitations

- Discord has a maximum embed size limit of 6000 characters
- Maximum of 10 embeds per message
- File size limits apply based on Discord's restrictions

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
