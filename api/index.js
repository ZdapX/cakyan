
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const formatNum = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'K';
    return num.toString();
};

app.get('/api/igstalk', async (req, res) => {
    const username = req.query.user;
    if (!username) return res.status(400).json({ success: false, message: "Username mana?" });

    try {
        const response = await axios.post(
            'https://api.boostfluence.com/api/instagram-profile-v2',
            { username: username.replace('@', '') },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                timeout: 10000
            }
        );

        const d = response.data;

        if (!d || !d.username) {
            return res.status(404).json({ success: false, message: "Akun tidak ditemukan atau API Limit." });
        }

        res.json({
            success: true,
            result: {
                username: d.username,
                fullName: d.full_name || '-',
                avatar: d.profile_pic_url_hd || d.profile_pic_url,
                isVerified: d.is_verified,
                isPrivate: d.is_private,
                stats: {
                    followers: formatNum(d.follower_count),
                    following: formatNum(d.following_count),
                    posts: formatNum(d.media_count)
                },
                bio: d.biography || '-'
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal mengambil data Instagram." });
    }
});

module.exports = app;
