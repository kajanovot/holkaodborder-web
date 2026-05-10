# Cloudflare kontaktni formular

## 0. Nameservery domeny

Tyto hodnoty nastav u registratora domeny jako Cloudflare nameservery:

```text
kay.ns.cloudflare.com
keanu.ns.cloudflare.com
```

Po zmene nameserveru muze propagace DNS trvat nekolik minut az 24 hodin. Do kodu webu se tyto hodnoty nevkladaji.

## 1. Turnstile

1. V Cloudflare Dashboard vytvor Turnstile widget pro svoji domenu.
2. `Site key` je uz doplneny v `index.html`.
3. Do Cloudflare Pages nastav environment variable:

```text
TURNSTILE_SECRET_KEY=druhy_klic_ktery_jsi_poslala
```

`TURNSTILE_SECRET_KEY` nikdy neukladej do HTML, CSS, JS ani verejneho souboru v projektu. Patri pouze do nastaveni Cloudflare Pages jako tajna environment variable.

### Kdyz widget pise "reseni potizi"

V Cloudflare Turnstile zkontroluj nastaveni widgetu:

1. Otevri Cloudflare Dashboard -> Turnstile.
2. Vyber widget pro tento web.
3. V casti povolenych hostnames/domains pridej obe varianty ostre domeny:

```text
holkaodborder.cz
www.holkaodborder.cz
```

Aktualne se `https://holkaodborder.cz/` presmeruje na `https://www.holkaodborder.cz/`, proto musi byt ve widgetu povolena i varianta s `www`.

4. Zkontroluj, ze widget pouziva stejny `Site key`, ktery je v `index.html`.
5. Pro lokalni testovani pridej take:

```text
localhost
127.0.0.1
```

Pokud web otevres jen jako soubor z pocitace pres `file://`, Turnstile nemusi fungovat spravne. Testuj pres lokalni server nebo az na nasazene domene.

## 2. Odesilani e-mailu pres Resend

Cloudflare Pages Function `functions/api/contact.js` pocita s Resend API.

V Cloudflare Pages nastav tyto environment variables:

```text
RESEND_API_KEY=tvuj_resend_api_key
CONTACT_TO=vycvik@holkaodborder.cz
CONTACT_FROM=Kontakt <kontakt@tvoje-overena-domena.cz>
```

`CONTACT_FROM` musi byt adresa z domeny overene v Resendu.

## 3. Bezpecnost

Turnstile token se overuje serverove v `/api/contact`. Samotny widget ve frontendu nestaci, proto je dulezite nasadit web pres Cloudflare Pages vcetne slozky `functions`.

## 4. Verejne recenze

Stranka `recenze.html` posila recenze na `/api/reviews`. Recenze se po uspesnem Turnstile overeni ulozi verejne a hned se zobrazi na webu.

V Cloudflare Pages je potreba vytvorit KV namespace a pripojit ho k projektu jako binding:

```text
REVIEWS_KV
```

Bez tohoto KV bindingu se recenze nebudou mit kam ulozit. Protoze se recenze zobrazuji bez schvalovani, nech Turnstile zapnuty a sleduj, jestli se neobjevuje spam.
