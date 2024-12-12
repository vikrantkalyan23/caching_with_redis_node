const express = require('express');
const axios = require('axios');
const redis = require('redis');
const mongoose = require('mongoose');

const app = express();
const PORT = 3500;

// Redis client
const redisClient = redis.createClient();
redisClient.connect().catch(console.error);

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/countryDB', { useNewUrlParser: true, useUnifiedTopology: true });
const countrySchema = new mongoose.Schema({ name: String, data: Object });
const Country = mongoose.model('Country', countrySchema);

// Fetch country data from API
async function fetchCountryData(country) {
    const url = `https://en.wikipedia.org/w/api.php?action=parse&format=json&section=0&page=${country}`;
    const response = await axios.get(url);
    return response.data;
}

// API endpoint
app.get('/country/:name', async (req, res) => {
    const country = req.params.name;

    // Check Redis cache
    const cachedData = await redisClient.get(country);
    if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
    }

    // Check MongoDB
    let countryRecord = await Country.findOne({ name: country });
    if (!countryRecord) {
        const countryData = await fetchCountryData(country);
        countryRecord = new Country({ name: country, data: countryData });
        await countryRecord.save();
    }

    // Cache data in Redis
    await redisClient.set(country, JSON.stringify(countryRecord.data), { EX: 3600 });

    res.status(200).json(countryRecord.data);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
