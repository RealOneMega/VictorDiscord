# Viktor Discord Bot Dashboard

A modern dashboard for managing and monitoring Discord bot users and their guilds.

## Features

- User authentication with Discord OAuth2
- User information display (username, email, creation date)
- Server list with detailed information
- Modern, responsive UI with Tailwind CSS
- Secure access control

## Setup

1. Clone the repository:
```bash
git clone git@github.com:RealOneMega/VictorDiscord.git
cd VictorDiscord
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your Discord application credentials:
```
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_REDIRECT_URI=http://localhost:3000/auth/discord/callback
```

4. Start the server:
```bash
npm start
```

## Environment Variables

- `DISCORD_CLIENT_ID`: Your Discord application client ID
- `DISCORD_CLIENT_SECRET`: Your Discord application client secret
- `DISCORD_REDIRECT_URI`: The OAuth2 redirect URI for your application

## Security

- The dashboard is protected and only accessible to authorized users
- All sensitive information is stored securely
- OAuth2 authentication ensures secure user access

## License

MIT License 