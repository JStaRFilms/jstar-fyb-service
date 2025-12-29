import { createHmac, createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Polyfill for environment variables if dotenv is missing
if (!process.env.PAYSTACK_SECRET_KEY) {
    try {
        const envFiles = ['.env.local', '.env'];
        for (const file of envFiles) {
            const envPath = path.resolve(process.cwd(), file);
            if (fs.existsSync(envPath)) {
                console.log(`Loading env from ${file}`);
                const envConfig = fs.readFileSync(envPath, 'utf8');
                envConfig.split('\n').forEach(line => {
                    const [key, value] = line.split('=');
                    if (key && value && !process.env[key.trim()]) {
                        process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, ''); // Remove quotes
                    }
                });
            }
        }
    } catch (e) {
        console.warn('Could not read .env files manually.');
    }
}

const SECRET = process.env.PAYSTACK_SECRET_KEY;
// Default to 3000
const PORT = process.env.PORT || 3000;
const URL = `http://localhost:${PORT}/api/pay/webhook`;

console.log(`Targeting URL: ${URL}`);

if (!SECRET) {
    console.error('Error: PAYSTACK_SECRET_KEY is missing in .env');
    process.exit(1);
}

async function sendWebhook(event: any, validSignature: boolean = true) {
    const body = JSON.stringify(event);
    const hash = createHmac('sha512', SECRET!).update(body).digest('hex');
    const signature = validSignature ? hash : 'invalid_signature_hash';

    console.log(`Sending ${event.event} to ${URL}...`);
    console.log(`Signature: ${signature.substring(0, 10)}... (Valid: ${validSignature})`);

    try {
        const res = await fetch(URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-paystack-signature': signature
            },
            body: body
        });

        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = text;
        }

        console.log(`Response: ${res.status} ${res.statusText}`);
        console.log('Body:', typeof data === 'string' ? data.substring(0, 500) : data);

        if (res.status === 401 && typeof data === 'object') {
            console.log('--- SIGNATURE DEBUG ---');
            console.log(`Recv Sig: ${data.received}`);
            // Note: Expected signature is not returned by server in non-debug mode
        }

        return res.status;
    } catch (error) {
        console.error('Fetch error:', error);
        return 0;
    }
}

async function runTests() {
    // Test 1: Invalid Signature
    console.log('\n--- Test 1: Invalid Signature ---');
    await sendWebhook({ event: 'charge.success', data: {} }, false);

    // Test 2: Valid Signature (Charge Success)
    console.log('\n--- Test 2: Valid Signature (Charge Success) ---');
    await sendWebhook({
        event: 'charge.success',
        data: {
            reference: `TEST_${Date.now()}`,
            amount: 500000,
            currency: 'NGN',
            status: 'success',
            paid_at: new Date().toISOString(),
            metadata: {
                projectId: 'test_project_id_123'
            },
            customer: {
                email: 'test@example.com'
            }
        }
    });
}

runTests();
