import { Amplify } from 'aws-amplify';

export const amplifyConfig = {
    Auth: {
        Cognito: {
            region: process.env.AWS_REGION,
            userPoolId: process.env.COGNITO_USER_POOL_ID,
            userPoolClientId: process.env.COGNITO_CLIENT_ID,
            username: true
        },
    }
}
