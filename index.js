const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

// Parse JSON bodies
app.use(bodyParser.json({
    limit: '50mb' // Support large payloads for attachments
}));

// Configuration - Replace this with your Discord webhook URL
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

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

app.post('/webhook', async (req, res) => {
    try {
        if (!DISCORD_WEBHOOK_URL) {
            throw new Error('Discord webhook URL not configured');
        }

        const emailData = req.body;
        
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

        // Send to Discord
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(discordPayload)
        });

        if (!response.ok) {
            throw new Error(`Discord API error: ${response.statusText}`);
        }

        res.status(200).json({ status: 'success' });
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
    res.status(200).json({ status: 'healthy' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Waiting for email webhooks...');
});
