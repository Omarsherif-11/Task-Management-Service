
console.log(process.env.NEXT_PUBLIC_LOGOUT);
export const oidcConfig = {
    authority: process.env.NEXT_PUBLIC_DOMAIN,
    client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
    redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI,
    scope: 'openid phone email profile',
    post_logout_redirect_uri: process.env.NEXT_PUBLIC_LOGOUT,
    response_type: 'code',
};
