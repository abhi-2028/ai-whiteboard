const { createRemoteJWKSet, jwtVerify } = require('jose');

const base = process.env.NEON_AUTH_URL ? process.env.NEON_AUTH_URL.replace(/\/$/, '') : null;
const jwkURL = base ? `${base}/.well-known/jwks.json` : null;

if(!base) {
    console.warn("NEON_AUTH_URL is not set. protected routes will reject all requests.");
}

const jwks = base ? createRemoteJWKSet(new URL(jwkURL)) : null;
if(base) console.log(`Neon Auth enabled. Using JWKS from: ${jwkURL}`);

const verify = async (token) => {
    if(String(token).split(".").length === 3) {
        const { payload } = await jwtVerify(token, jwks);
        return { email: payload.email, name: payload.name, sub: payload.sub || payload.id };
    }
    const res = await fetch(`${base}/get-session`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });
    if(!res.ok) throw new Error(`neon get-session ${res.status}`);
    const data = await res.json();
    const user = data?.user;
    if(!user?.email) throw new Error("neon session has no user");
    return { email: user.email, name: user.name, sub: user.sub || user.id };
};

module.exports = {
    verify,
};