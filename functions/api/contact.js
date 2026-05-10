const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const RESEND_EMAIL_URL = 'https://api.resend.com/emails';

function json(data, status = 200) {
    return Response.json(data, {
        status,
        headers: {
            'Cache-Control': 'no-store'
        }
    });
}

function clean(value, maxLength = 2000) {
    return String(value || '').trim().slice(0, maxLength);
}

function escapeHtml(value) {
    return clean(value, 4000)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

async function validateTurnstile(token, request, env) {
    if (!env.TURNSTILE_SECRET_KEY) {
        return { success: false, message: 'Chybí konfigurace bezpečnostního ověření.' };
    }

    const body = new FormData();
    body.append('secret', env.TURNSTILE_SECRET_KEY);
    body.append('response', token);

    const remoteIp = request.headers.get('CF-Connecting-IP');
    if (remoteIp) {
        body.append('remoteip', remoteIp);
    }

    const response = await fetch(TURNSTILE_VERIFY_URL, {
        method: 'POST',
        body
    });

    if (!response.ok) {
        return { success: false, message: 'Bezpečnostní ověření není dočasně dostupné.' };
    }

    const result = await response.json();
    return {
        success: Boolean(result.success),
        message: result.success ? null : 'Bezpečnostní ověření se nezdařilo.'
    };
}

async function sendEmail(fields, env) {
    if (!env.RESEND_API_KEY || !env.CONTACT_TO || !env.CONTACT_FROM) {
        return { success: false, message: 'Chybí konfigurace odesílání e-mailu.' };
    }

    const subject = `Nová zpráva z webu: ${fields.topic || 'Kontakt'}`;
    const text = [
        `Jméno: ${fields.name}`,
        `Email: ${fields.email}`,
        `Telefon: ${fields.phone || '-'}`,
        `Téma: ${fields.topic}`,
        '',
        fields.message
    ].join('\n');

    const html = `
        <h2>Nová zpráva z webu</h2>
        <p><strong>Jméno:</strong> ${escapeHtml(fields.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(fields.email)}</p>
        <p><strong>Telefon:</strong> ${escapeHtml(fields.phone || '-')}</p>
        <p><strong>Téma:</strong> ${escapeHtml(fields.topic)}</p>
        <p><strong>Zpráva:</strong></p>
        <p>${escapeHtml(fields.message).replace(/\n/g, '<br>')}</p>
    `;

    const response = await fetch(RESEND_EMAIL_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: env.CONTACT_FROM,
            to: env.CONTACT_TO,
            reply_to: fields.email,
            subject,
            text,
            html
        })
    });

    if (!response.ok) {
        return { success: false, message: 'E-mail se nepodařilo odeslat.' };
    }

    return { success: true };
}

export async function onRequestPost({ request, env }) {
    try {
        const formData = await request.formData();
        const fields = {
            name: clean(formData.get('name'), 120),
            email: clean(formData.get('email'), 180),
            phone: clean(formData.get('phone'), 80),
            topic: clean(formData.get('topic'), 120),
            message: clean(formData.get('message'), 4000),
            consent: clean(formData.get('consent'), 20)
        };
        const token = clean(formData.get('cf-turnstile-response'), 2048);

        if (!fields.name || !fields.email || !fields.topic || !fields.message || fields.consent !== 'yes') {
            return json({ message: 'Vyplňte prosím všechna povinná pole.' }, 400);
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
            return json({ message: 'Zadejte prosím platný e-mail.' }, 400);
        }

        if (!token) {
            return json({ message: 'Chybí bezpečnostní ověření.' }, 400);
        }

        const turnstile = await validateTurnstile(token, request, env);
        if (!turnstile.success) {
            return json({ message: turnstile.message }, 400);
        }

        const email = await sendEmail(fields, env);
        if (!email.success) {
            return json({ message: email.message }, 500);
        }

        return json({ message: 'Zpráva byla odeslána.' });
    } catch (error) {
        return json({ message: 'Zprávu se nepodařilo zpracovat.' }, 500);
    }
}

export function onRequest() {
    return json({ message: 'Metoda není povolena.' }, 405);
}
