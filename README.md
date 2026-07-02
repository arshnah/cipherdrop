# cipherdrop

Zero-knowledge file and text drops. Everything is encrypted in your browser before it leaves; the key rides in the URL fragment (`#...`), which browsers never send to a server. All the server ever stores is ciphertext it cannot read.

## How it works

1. You paste text or pick a file. The browser generates a random AES-GCM 256 key and encrypts the payload (filename and mime included) locally.
2. Only the ciphertext is uploaded. The server hands back a short id and never sees the key.
3. Your link is `/{id}#{key}`. The part after `#` is the key and stays client-side by design.
4. The recipient opens the link, the browser reads the key from the fragment, fetches the ciphertext, and decrypts it in place.

Drops carry an expiry (1 hour, 1 day, 7 days) and an optional burn-after-read that deletes the blob on first successful fetch. Expired blobs are swept off disk.

## Run it

```
npm install
npm run dev
```

Blobs live on disk under `data/` (gitignored). Max upload is 25 MB.

## Stack

Next.js 14, TypeScript, Tailwind, Web Crypto (`crypto.subtle`, AES-GCM). No database, no accounts. Built to self-host behind nginx + PM2.

MIT.
