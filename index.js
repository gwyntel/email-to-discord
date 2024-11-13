require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

// Parse JSON bodies
app.use(bodyParser.json({
    limit: '50mb' // Support large payloads for attachments
}));

// Webhook mapping configuration
// Format: 'recipient@domain.com': 'discord_webhook_url'
const WEBHOOK_MAPPING = {};

// Load webhook mappings from environment variables
// Format: WEBHOOK_MAP_email_example_com=discord_webhook_url
Object.keys(process.env).forEach(key => {
    if (key.startsWith('WEBHOOK_MAP_')) {
        if (key === 'WEBHOOK_MAP_CATCHALL') {
            // Handle catch-all webhook separately
            WEBHOOK_MAPPING['CATCHALL'] = process.env[key];
        } else {
            // Convert environment variable name to email
            // e.g., WEBHOOK_MAP_email_example_com -> email@example.com
            const email = key.replace('WEBHOOK_MAP_', '')
                .replace(/_plus_/g, '+')  // Handle + in email addresses
                .replace(/_/g, '.')
                .replace(/DOT/g, '.')
                .replace(/AT/g, '@');
            WEBHOOK_MAPPING[email] = process.env[key];
        }
    }
});

// Convert base64 size to MB for logging
const getBase64Size = (base64String) => {
    return Math.round(base64String.length * 0.75 / 1024 / 1024 * 100) / 100;
};

// Helper function to create Discord embeds from email content
const createEmailEmbed = (emailData) => {
    const embed = {
        title: emailData.subject || 'No Subject',
        description: emailData.text || emailData.html || 'No Content',
        color: 0x00ff00, // Green color
        fields: [
            {
                name: 'From',
                value: `${emailData.from.name} <${emailData.from.email}>`,
                inline: true
            },
            {
                name: 'To',
                value: emailData.to.map(recipient => 
                    `${recipient.name} <${recipient.email}>`
                ).join(', '),
                inline: true
            },
            {
                name: 'Date',
                value: new Date(emailData.timestamp * 1000).toLocaleString(),
                inline: true
            }
        ]
    };

    return embed;
};

// Helper function to create attachment embeds
const createAttachmentEmbeds = (attachments, inlines) => {
    const embeds = [];
    
    // Handle inline images
    if (inlines && inlines.length > 0) {
        inlines.forEach(inline => {
            if (inline.type.startsWith('image/')) {
                embeds.push({
                    title: `Inline Image: ${inline.name}`,
                    image: {
                        url: `attachment://${inline.name}`
                    }
                });
            }
        });
    }

    // Handle attachments
    if (attachments && attachments.length > 0) {
        attachments.forEach(attachment => {
            const size = getBase64Size(attachment.content);
            embeds.push({
                title: `Attachment: ${attachment.name}`,
                description: `Type: ${attachment.type}\nSize: ${size}MB`,
                color: 0x0099ff
            });
        });
    }

    return embeds;
};

// Helper function to get Discord webhook URL for a recipient
const getWebhookUrl = (recipient) => {
    // Check if there's a direct mapping for this email
    if (WEBHOOK_MAPPING[recipient]) {
        return WEBHOOK_MAPPING[recipient];
    }

    // Check if there's a catch-all webhook
    if (WEBHOOK_MAPPING['CATCHALL']) {
        return WEBHOOK_MAPPING['CATCHALL'];
    }

    // Fallback to the default webhook URL if set
    return process.env.DISCORD_WEBHOOK_URL;
};

app.post('/webhook', async (req, res) => {
    try {
        const emailData = req.body;
        
        // Get all unique recipient emails
        const recipients = emailData.to.map(to => to.email);
        const webhookUrls = new Set();

        // Collect all relevant webhook URLs
        recipients.forEach(recipient => {
            const webhookUrl = getWebhookUrl(recipient);
            if (webhookUrl) {
                webhookUrls.add(webhookUrl);
            }
        });

        if (webhookUrls.size === 0) {
            throw new Error('No webhook URLs configured for the recipient(s)');
        }

        // Create the main email embed
        const emailEmbed = createEmailEmbed(emailData);
        
        // Create attachment embeds
        const attachmentEmbeds = createAttachmentEmbeds(
            emailData.attachments,
            emailData.inlines
        );

        // Prepare Discord webhook payload
        const discordPayload = {
            username: 'Email Webhook',
            avatar_url: 'https://improvmx.com/images/favicon.png', // ImprovMX favicon
            embeds: [emailEmbed, ...attachmentEmbeds]
        };

        // Send to all configured Discord webhooks
        const sendPromises = Array.from(webhookUrls).map(async webhookUrl => {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(discordPayload)
            });

            if (!response.ok) {
                throw new Error(`Discord API error for ${webhookUrl}: ${response.statusText}`);
            }
        });

        // Wait for all webhook sends to complete
        await Promise.all(sendPromises);

        res.status(200).json({ 
            status: 'success',
            webhooks_triggered: webhookUrls.size
        });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ 
            status: 'error',
            message: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    const mappings = Object.keys(WEBHOOK_MAPPING);
    res.status(200).json({ 
        status: 'healthy',
        webhook_mappings: mappings.length,
        configured_emails: mappings.filter(m => m !== 'CATCHALL')
    });
});

// Root endpoint to show basic info
app.get('/', (req, res) => {
    res.status(200).json({
        name: 'Email to Discord Webhook Converter',
        endpoints: {
            webhook: '/webhook',
            health: '/health'
        },
        configured_mappings: Object.keys(WEBHOOK_MAPPING).length
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Configured webhook mappings:', Object.keys(WEBHOOK_MAPPING));
    console.log('Waiting for email webhooks...');
});
