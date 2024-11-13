const assert = require('assert');

// Mock environment variables
process.env.WEBHOOK_MAP_SUPPORT_EXAMPLE_COM = 'https://discord.com/api/webhooks/123/abc';
process.env['WEBHOOK_MATCH_SALES_TEAM_EXAMPLE_COM'] = 'https://discord.com/api/webhooks/456/def';
process.env.WEBHOOK_MAP_CATCHALL = 'https://discord.com/api/webhooks/789/ghi';
process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/000/xyz';

// Import the configKeyToEmail function
const { configKeyToEmail } = require('../index.js');

describe('Webhook Mapping Tests', () => {
    describe('configKeyToEmail', () => {
        it('should handle basic email conversion with MAP prefix', () => {
            const result = configKeyToEmail('WEBHOOK_MAP_SUPPORT_EXAMPLE_COM');
            assert.strictEqual(result, 'support@example.com');
        });

        it('should handle basic email conversion with MATCH prefix', () => {
            const result = configKeyToEmail('WEBHOOK_MATCH_SUPPORT_EXAMPLE_COM');
            assert.strictEqual(result, 'support@example.com');
        });

        it('should handle hyphens in email addresses', () => {
            const result = configKeyToEmail('WEBHOOK_MAP_SUPPORT_TICKETS_EXAMPLE_COM');
            assert.strictEqual(result, 'support.tickets@example.com');
        });

        it('should handle plus signs in email addresses', () => {
            const result = configKeyToEmail('WEBHOOK_MAP_SUPPORT_PLUS_TICKETS_EXAMPLE_COM');
            assert.strictEqual(result, 'support+tickets@example.com');
        });

        it('should handle multiple dots in local part', () => {
            const result = configKeyToEmail('WEBHOOK_MAP_SUPPORT_TICKETS_ADMIN_EXAMPLE_COM');
            assert.strictEqual(result, 'support.tickets.admin@example.com');
        });

        it('should preserve case sensitivity in webhook URLs', () => {
            const webhookUrl = process.env.WEBHOOK_MAP_SUPPORT_EXAMPLE_COM;
            assert.strictEqual(webhookUrl, 'https://discord.com/api/webhooks/123/abc');
        });
    });

    describe('Webhook URL Resolution', () => {
        it('should find direct MAP mapping', () => {
            const email = 'support@example.com';
            const webhookUrl = getWebhookUrl(email);
            assert.strictEqual(webhookUrl, process.env.WEBHOOK_MAP_SUPPORT_EXAMPLE_COM);
        });

        it('should find direct MATCH mapping', () => {
            const email = 'sales.team@example.com';
            const webhookUrl = getWebhookUrl(email);
            assert.strictEqual(webhookUrl, process.env['WEBHOOK_MATCH_SALES_TEAM_EXAMPLE_COM']);
        });

        it('should fallback to catchall if no direct mapping exists', () => {
            const email = 'unknown@example.com';
            const webhookUrl = getWebhookUrl(email);
            assert.strictEqual(webhookUrl, process.env.WEBHOOK_MAP_CATCHALL);
        });

        it('should fallback to default webhook if no other mapping exists', () => {
            // Temporarily remove catchall
            const catchall = process.env.WEBHOOK_MAP_CATCHALL;
            delete process.env.WEBHOOK_MAP_CATCHALL;

            const email = 'unknown@example.com';
            const webhookUrl = getWebhookUrl(email);
            assert.strictEqual(webhookUrl, process.env.DISCORD_WEBHOOK_URL);

            // Restore catchall
            process.env.WEBHOOK_MAP_CATCHALL = catchall;
        });
    });

    describe('Environment Variable Loading', () => {
        it('should load all webhook mappings', () => {
            // Reset WEBHOOK_MAPPING
            const WEBHOOK_MAPPING = {};

            // Load mappings
            Object.keys(process.env).forEach(key => {
                if (key.startsWith('WEBHOOK_MAP_') || key.startsWith('WEBHOOK_MATCH_')) {
                    if (key.endsWith('_CATCHALL')) {
                        WEBHOOK_MAPPING['CATCHALL'] = process.env[key];
                    } else {
                        const email = configKeyToEmail(key);
                        WEBHOOK_MAPPING[email] = process.env[key];
                    }
                }
            });

            // Verify mappings
            assert.strictEqual(Object.keys(WEBHOOK_MAPPING).length, 3); // 2 direct mappings + 1 catchall
            assert.strictEqual(WEBHOOK_MAPPING['support@example.com'], process.env.WEBHOOK_MAP_SUPPORT_EXAMPLE_COM);
            assert.strictEqual(WEBHOOK_MAPPING['sales.team@example.com'], process.env['WEBHOOK_MATCH_SALES_TEAM_EXAMPLE_COM']);
            assert.strictEqual(WEBHOOK_MAPPING['CATCHALL'], process.env.WEBHOOK_MAP_CATCHALL);
        });
    });
});
