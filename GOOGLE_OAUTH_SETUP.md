# Google OAuth Implementation

This document describes how to set up and use Google OAuth authentication in the caregiving platform.

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3001/auth/google/callback` (development)
     - `https://yourdomain.com/auth/google/callback` (production)

### 2. Environment Variables

Update your `.env` file with the Google OAuth credentials:

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id-from-console"
GOOGLE_CLIENT_SECRET="your-google-client-secret-from-console"
GOOGLE_CALLBACK_URL="http://localhost:3001/auth/google/callback"

# Frontend URL
FRONTEND_URL="http://localhost:3000"
```

## API Endpoints

### 1. Initiate Google OAuth Login

```
GET /auth/google
```

**Description**: Redirects user to Google OAuth consent screen

**Response**: 302 redirect to Google OAuth

### 2. Google OAuth Callback

```
GET /auth/google/callback
```

**Description**: Handles the callback from Google OAuth and creates/logs in the user

**Response**: Redirects to frontend with tokens

**Success Response**:
- Redirects to: `http://localhost:3000/auth/callback?access_token=xxx&refresh_token=xxx`

## Implementation Details

### Google Strategy (`src/auth/strategies/google.strategy.ts`)

The Google strategy handles the OAuth flow:

```typescript
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: GoogleProfile, done: VerifyCallback) {
    // Extract user data from Google profile
    const user = {
      googleId: profile.id,
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      accessToken,
      refreshToken,
    };

    done(null, user);
  }
}
```

### Auth Service Google Login Method

```typescript
async googleLogin(googleUser: any) {
  // Check if user exists with this email
  let user = await this.databaseService.user.findUnique({
    where: { email: googleUser.email },
  });

  if (!user) {
    // Create new user if doesn't exist
    user = await this.databaseService.user.create({
      data: {
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        passwordHash: '', // No password for OAuth users
        role: PrismaUserRole.CLIENT, // Default role
        isVerified: true, // Google accounts are pre-verified
      },
    });
  } else {
    // Update user info if exists
    user = await this.databaseService.user.update({
      where: { id: user.id },
      data: {
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        isVerified: true,
      },
    });
  }

  // Generate JWT tokens
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };
  
  const accessToken = this.jwtService.sign(payload);
  const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

  return {
    user: { ...user, passwordHash: undefined },
    access_token: accessToken,
    refresh_token: refreshToken,
  };
}
```

## Frontend Integration

### 1. Initiate Google Login

```javascript
// Redirect user to Google OAuth
window.location.href = 'http://localhost:3001/auth/google';
```

### 2. Handle OAuth Callback

Create a callback page at `/auth/callback` in your frontend:

```javascript
// pages/auth/callback.js or similar
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const { access_token, refresh_token } = router.query;

    if (access_token && refresh_token) {
      // Store tokens in localStorage or secure storage
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      // Redirect to dashboard or home page
      router.push('/dashboard');
    } else {
      // Handle error
      router.push('/login?error=oauth_failed');
    }
  }, [router.query]);

  return <div>Processing login...</div>;
}
```

### 3. Use Tokens for API Calls

```javascript
// Include access token in API requests
const token = localStorage.getItem('access_token');

fetch('http://localhost:3001/api/protected-endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

## Security Features

1. **Email Verification**: Google OAuth users are automatically verified
2. **No Password Storage**: OAuth users don't have passwords stored
3. **JWT Integration**: Google OAuth integrates with existing JWT system
4. **Role Assignment**: New Google users get CLIENT role by default
5. **Secure Redirects**: Callback URLs are validated

## Testing

### 1. Test OAuth Flow

1. Start the server: `npm run start:dev`
2. Navigate to: `http://localhost:3001/auth/google`
3. Complete Google OAuth consent
4. Verify redirect to frontend with tokens

### 2. Test with Postman

You can't directly test OAuth with Postman, but you can test the callback endpoint by simulating the Google response.

## Troubleshooting

### Common Issues

1. **Invalid Client ID**: Ensure `GOOGLE_CLIENT_ID` is correct
2. **Redirect URI Mismatch**: Verify callback URL matches Google Console settings
3. **Scope Issues**: Ensure 'email' and 'profile' scopes are requested
4. **CORS Errors**: Configure CORS for your frontend domain

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

## Production Considerations

1. **HTTPS Required**: Google OAuth requires HTTPS in production
2. **Domain Verification**: Verify your domain in Google Console
3. **Rate Limiting**: Implement rate limiting for OAuth endpoints
4. **Error Handling**: Add comprehensive error handling for OAuth failures
5. **Monitoring**: Monitor OAuth success/failure rates

## Next Steps

1. Add other OAuth providers (Facebook, GitHub, etc.)
2. Implement account linking for existing users
3. Add OAuth token refresh mechanism
4. Implement OAuth logout/revocation
5. Add audit logging for OAuth events