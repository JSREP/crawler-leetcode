export const auth0Config = {
  domain: process.env.VITE_AUTH0_DOMAIN || '',
  clientId: process.env.VITE_AUTH0_CLIENT_ID || '',
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: process.env.VITE_AUTH0_AUDIENCE,
    scope: 'openid profile email',
  },
}; 