require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { Client, GatewayIntentBits } = require('discord.js');
const { Pool } = require('pg');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: process.env.FLASK_SECRET_KEY || 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

// Database setup
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Discord OAuth configuration
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = 'http://localhost:5000/callback';

// Define scopes as an array and join with spaces
const DISCORD_SCOPES = [
    'identify',
    'email',
    'guilds'
].join(' ');

// Middleware to check if user is authorized to access dashboard
const isAuthorizedUser = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }
    
    // Check if the user is authorized (your Discord ID)
    if (req.session.userId === '255864836640997376') {
        next();
    } else {
        res.redirect('/verification-success');
    }
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/login', (req, res) => {
    const params = new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: DISCORD_REDIRECT_URI,
        response_type: 'code',
        scope: DISCORD_SCOPES
    });
    
    const authUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
    console.log('Redirecting to:', authUrl);
    res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
    console.log('Callback received:', req.query);
    
    if (req.query.error) {
        console.error('OAuth error:', req.query.error);
        return res.status(400).send(`OAuth error: ${req.query.error}`);
    }

    const { code } = req.query;
    if (!code) {
        console.error('No code provided in callback');
        return res.status(400).send('No code provided');
    }

    try {
        console.log('Exchanging code for tokens...');
        // Exchange code for tokens
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: DISCORD_REDIRECT_URI
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const tokens = await tokenResponse.json();
        console.log('Token response:', tokens);

        if (tokens.error) {
            console.error('Token error:', tokens.error);
            return res.status(400).send(`Error: ${tokens.error}`);
        }

        // Get user information
        console.log('Fetching user information...');
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`
            }
        });
        const userData = await userResponse.json();
        console.log('User data:', userData);

        // Get user's guilds
        console.log('Fetching user guilds...');
        const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`
            }
        });
        const guildsData = await guildsResponse.json();
        console.log('Guilds data:', guildsData);

        // Store user in database
        console.log('Storing user in database...');
        const userResult = await pool.query(
            'INSERT INTO users (id, username, discriminator, avatar, email, access_token, refresh_token, token_expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO UPDATE SET username = $2, discriminator = $3, avatar = $4, email = $5, access_token = $6, refresh_token = $7, token_expires_at = $8 RETURNING *',
            [
                userData.id,
                userData.username,
                userData.discriminator,
                userData.avatar,
                userData.email,
                tokens.access_token,
                tokens.refresh_token,
                new Date(Date.now() + tokens.expires_in * 1000)
            ]
        );

        // Store guilds in database
        console.log('Storing guilds in database...');
        for (const guild of guildsData) {
            await pool.query(
                'INSERT INTO guilds (id, name, icon, owner, permissions, user_id) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO UPDATE SET name = $2, icon = $3, owner = $4, permissions = $5',
                [
                    guild.id,
                    guild.name,
                    guild.icon,
                    guild.owner,
                    guild.permissions,
                    userData.id
                ]
            );
        }

        req.session.userId = userData.id;
        console.log('Redirecting to dashboard...');
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error in callback:', error);
        res.status(500).send('Internal server error');
    }
});

// Protected dashboard route
app.get('/dashboard', isAuthorizedUser, (req, res) => {
    res.sendFile(__dirname + '/public/dashboard.html');
});

// Verification success page for unauthorized users
app.get('/verification-success', (req, res) => {
    res.sendFile(__dirname + '/public/verification-success.html');
});

app.get('/api/user', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.session.userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userResult.rows[0];
        const guildsResult = await pool.query('SELECT * FROM guilds WHERE user_id = $1', [user.id]);

        res.json({
            id: user.id,
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.avatar,
            email: user.email,
            guilds: guildsResult.rows
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.*, 
                   COUNT(g.id) as guild_count,
                   json_agg(DISTINCT jsonb_build_object(
                       'id', g.id,
                       'name', g.name,
                       'icon', g.icon,
                       'owner', g.owner,
                       'permissions', g.permissions
                   )) as guilds
            FROM users u
            LEFT JOIN guilds g ON u.id = g.user_id
            GROUP BY u.id
            ORDER BY u.created_at DESC
        `);

        res.json(result.rows.map(row => ({
            ...row,
            guilds: row.guilds.filter(g => g.id !== null)
        })));
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/users/:userId', async (req, res) => {
    try {
        const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userResult.rows[0];
        const guildsResult = await pool.query('SELECT * FROM guilds WHERE user_id = $1', [user.id]);

        res.json({
            id: user.id,
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.avatar,
            email: user.email,
            created_at: user.created_at,
            guilds: guildsResult.rows
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add this new endpoint before the app.listen call
app.get('/reset-db', async (req, res) => {
    try {
        // Drop existing tables if they exist (with CASCADE to handle dependencies)
        await pool.query(`
            DROP TABLE IF EXISTS guilds CASCADE;
            DROP TABLE IF EXISTS dm_channels CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
        `);

        // Create tables with correct schema
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(20) PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                discriminator VARCHAR(4),
                avatar VARCHAR(255),
                email VARCHAR(255),
                access_token VARCHAR(255) NOT NULL,
                refresh_token VARCHAR(255) NOT NULL,
                token_expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS guilds (
                id VARCHAR(20) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                icon VARCHAR(255),
                owner BOOLEAN DEFAULT FALSE,
                permissions VARCHAR(255),
                user_id VARCHAR(20) REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        res.json({ message: 'Database reset successfully' });
    } catch (error) {
        console.error('Error resetting database:', error);
        res.status(500).json({ error: 'Failed to reset database' });
    }
});

// Create database tables
async function initializeDatabase() {
    try {
        // Drop existing tables if they exist (with CASCADE to handle dependencies)
        await pool.query(`
            DROP TABLE IF EXISTS guilds CASCADE;
            DROP TABLE IF EXISTS dm_channels CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
        `);

        // Create tables with correct schema
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(20) PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                discriminator VARCHAR(4),
                avatar VARCHAR(255),
                email VARCHAR(255),
                access_token VARCHAR(255) NOT NULL,
                refresh_token VARCHAR(255) NOT NULL,
                token_expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS guilds (
                id VARCHAR(20) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                icon VARCHAR(255),
                owner BOOLEAN DEFAULT FALSE,
                permissions VARCHAR(255),
                user_id VARCHAR(20) REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Database tables created successfully');
    } catch (error) {
        console.error('Error creating database tables:', error);
    }
}

// Initialize database and start server
initializeDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}); 