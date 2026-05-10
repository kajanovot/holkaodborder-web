const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const REVIEW_PREFIX = 'review:';

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

function publicReview(review) {
    return {
        id: review.id,
        name: review.name,
        rating: review.rating,
        review: review.review,
        createdAt: review.createdAt
    };
}

export async function onRequestGet({ env }) {
    if (!env.REVIEWS_KV) {
        return json({ message: 'Chybí úložiště recenzí.', reviews: [] }, 500);
    }

    const list = await env.REVIEWS_KV.list({ prefix: REVIEW_PREFIX, limit: 50 });
    const reviews = await Promise.all(
        list.keys.map(key => env.REVIEWS_KV.get(key.name, 'json'))
    );

    const sortedReviews = reviews
        .filter(Boolean)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(publicReview);

    return json({ reviews: sortedReviews });
}

export async function onRequestPost({ request, env }) {
    try {
        if (!env.REVIEWS_KV) {
            return json({ message: 'Chybí úložiště recenzí.' }, 500);
        }

        const formData = await request.formData();
        const name = clean(formData.get('name'), 80);
        const rating = Number(clean(formData.get('rating'), 1));
        const reviewText = clean(formData.get('review'), 1200);
        const gdpr = clean(formData.get('gdpr'), 20);
        const token = clean(formData.get('cf-turnstile-response'), 2048);

        if (!name || !reviewText || gdpr !== 'on') {
            return json({ message: 'Vyplňte prosím všechna povinná pole.' }, 400);
        }

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return json({ message: 'Vyberte prosím hodnocení.' }, 400);
        }

        if (!token) {
            return json({ message: 'Chybí bezpečnostní ověření.' }, 400);
        }

        const turnstile = await validateTurnstile(token, request, env);
        if (!turnstile.success) {
            return json({ message: turnstile.message }, 400);
        }

        const id = crypto.randomUUID();
        const review = {
            id,
            name,
            rating,
            review: reviewText,
            createdAt: new Date().toISOString()
        };

        await env.REVIEWS_KV.put(`${REVIEW_PREFIX}${review.createdAt}:${id}`, JSON.stringify(review));

        return json({
            message: 'Recenze byla zveřejněna.',
            review: publicReview(review)
        });
    } catch (error) {
        return json({ message: 'Recenzi se nepodařilo zpracovat.' }, 500);
    }
}

export function onRequest() {
    return json({ message: 'Metoda není povolena.' }, 405);
}
