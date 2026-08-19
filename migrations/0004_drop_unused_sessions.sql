-- Sessions are HMAC-signed cookies (src/auth/session.ts), not D1 rows.
DROP TABLE IF EXISTS sessions;
