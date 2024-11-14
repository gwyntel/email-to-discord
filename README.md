# Email to Discord Webhook Converter

## Overview
Convert incoming emails to Discord webhooks with dynamic routing and an intuitive admin panel.

## Configuration Examples

### Webhook Mapping Configuration

#### Environment Variable Mapping
```bash
# Map specific email to a Discord webhook
WEBHOOK_MAP_SPLINTERTREE_GWYNTEL_US=https://discord.com/api/webhooks/your_webhook_url
WEBHOOK_MAP_SUPPORT_EXAMPLE_COM=https://discord.com/api/webhooks/another_webhook_url

# Catchall webhook (optional)
WEBHOOK_MAP_CATCHALL=https://discord.com/api/webhooks/default_webhook_url
```

#### Supported Email Formats
- `splintertree@gwyntel.us` → `WEBHOOK_MAP_SPLINTERTREE_GWYNTEL_US`
- `support@example.com` → `WEBHOOK_MAP_SUPPORT_EXAMPLE_COM`
- Supports `+` and multiple subdomain variations

### Admin Panel Configuration

#### First-Time Setup
1. First user registered becomes the admin
2. Subsequent registrations default to viewer role

#### Webhook Management
- Add new webhook mappings
- Remove existing mappings
- Set catchall webhooks
- View real-time processing statistics

## Environment Variables

### Required
```bash
# Discord default webhook (fallback)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_default_webhook

# MongoDB connection for admin panel
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/webhook_admin

# Session security
SESSION_SECRET=your_long_random_secret
```

### Optional Configuration
```bash
# Specific webhook mappings
WEBHOOK_MAP_SUPPORT_EXAMPLE_COM=https://discord.com/api/webhooks/support_channel
WEBHOOK_MAP_BILLING_EXAMPLE_COM=https://discord.com/api/webhooks/billing_channel
```

## Deployment

### Local Development
1. Clone repository
2. Install dependencies
   ```bash
   npm install
   ```
3. Create `.env` file with required variables
4. Start application
   ```bash
   npm start
   ```

### Heroku Deployment
1. Create Heroku app
2. Set config variables
3. Deploy via Heroku CLI or GitHub integration

## Admin Panel Access
- URL: `/admin` in production
- First user becomes admin
- Subsequent users are viewers

## Webhook Routing Logic
- Exact email match takes precedence
- Catchall webhook as final fallback
- Supports complex email routing

## Security Features
- Role-based access control
- Secure session management
- Environment-based configuration

## Example Routing Scenarios

### Scenario 1: Specific Email Routing
- Email: `support@example.com`
- Mapped to: Support Discord channel
- Configuration: `WEBHOOK_MAP_SUPPORT_EXAMPLE_COM`

### Scenario 2: Catchall Webhook
- Email: `unknown@domain.com`
- Routed to: Default Discord webhook
- Configuration: `WEBHOOK_MAP_CATCHALL`

## Troubleshooting
- Check environment variable formatting
- Verify Discord webhook URLs
- Ensure MongoDB connection is stable

## Contributing
1. Fork repository
2. Create feature branch
3. Commit changes
4. Create Pull Request
