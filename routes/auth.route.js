const express = require('express');
const router = express.Router();
const db = require('../db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
 

const accessTokenCookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 1000 *5
};

const getCookie = (req, name) => req.headers.cookie
    ?.split(';')
    .map(cookie => cookie.trim())
    .find(cookie => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);

router.post('/login', async (req, res) => {
    try {
    const { username, password } = req.body;
        
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const [rows] = await db.query('SELECT * FROM users WHERE user_name = ?', [username]);

    if (rows.length === 0 || !(await bcrypt.compare(password, rows[0].password_hash))) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    jwt.sign({
        user: rows[0]
    }, 'secretkey', { expiresIn: '1m' }, (err, token) => {
        if (err) {
            return res.status(500).json({ error: 'Error generating token' });
        }

        res.cookie('access_token', token, accessTokenCookieOptions);

        // Send the token , refresh token  and user information in the response
        const refresh_token = jwt.sign({
            user: rows[0]
        }, 'refreshsecretkey', { expiresIn: '1d' });

        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000
        });
        
        res.status(200).json({data: { access_token: token, refresh_token: refresh_token, user: rows[0] }});
    });

  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
    
});

router.post('/refresh-token', (req, res) => {
    const refreshToken = req.body.refresh_token || getCookie(req, 'refresh_token');

    if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token is required' });
    }

    jwt.verify(refreshToken, 'refreshsecretkey', (error, payload) => {
        if (error) {
            return res.status(403).json({ error: 'Invalid or expired refresh token' });
        }

        const accessToken = jwt.sign({ user: payload.user }, 'secretkey', { expiresIn: '1m' });
        res.cookie('access_token', accessToken, accessTokenCookieOptions);
        res.status(200).json({ access_token: accessToken });
    });
});

 /** give total credit and dibit transtion to a user with name and userId */
router.get('/user',(req,res)=>{
 
});
//* Get all users with their total credit and dibit transtion  aand with report.json file with name and userId and totalCredit and totalDebit
router.post('/user', async (req, res)=>{

    const hashedPassword = await bcrypt.hash(req.query.password, 10);
    const [rows] = await db.query('INSERT INTO users (user_name, password) VALUES (?, ?)', [req.query.username, hashedPassword]);

    res.status(200).json(rows);
});
 
 
module.exports = router;