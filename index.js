const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// * Please DO NOT INCLUDE the private app access token in your repo. Don't do this practicum in your normal account.
const PRIVATE_APP_ACCESS = '';
const CUSTOM_OBJECT_API_URL = 'https://api.hubspot.com/crm/v3/objects/2-138150590?properties=name,release_year,type,bio';

// TODO: ROUTE 1 - Create a new app.get route for the homepage to call your custom object data. Pass this data along to the front-end and create a new pug template in the views folder.

app.get('/', async (req, res) => {
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    }
    try {
        const resp = await axios.get(CUSTOM_OBJECT_API_URL, { headers });
        const data = resp.data.results;
        res.render('homepage', { title: 'Homepage | HubSpot Practicum', data });
    } catch (error) {
        console.error('Error retrieving CRM records:', error.response?.data || error.message);
    }
});

// TODO: ROUTE 2 - Create a new app.get route for the form to create or update new custom object data. Send this data along in the next route.

app.get('/update-cobj', (req, res) => {
    res.render('updates', { title: 'Update Custom Object Form | Integrating With HubSpot I Practicum' });
});

// TODO: ROUTE 3 - Create a new app.post route for the custom objects form to create or update your custom object data. Once executed, redirect the user to the homepage.

app.post('/update-cobj', async (req, res) => {
    const { name, bio, type, release_year } = req.body;

    // Convert release_year to Unix timestamp in milliseconds
    let releaseYearTimestamp = null;
    if (release_year) {
        releaseYearTimestamp = new Date(release_year).getTime();

        // Validate the conversion
        if (isNaN(releaseYearTimestamp)) {
            console.error('Invalid date format:', release_year);
            return res.status(400).send({ error: 'Invalid release_year format. Please provide a valid date and time.' });
        }
    }

    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json',
    };
    const data = {
        properties: {
            name,
            bio,
            type,
            release_year: releaseYearTimestamp,
        },
    };

    try {
        await axios.post(CUSTOM_OBJECT_API_URL, data, { headers });
        res.redirect('/');

    } catch (error) {
        console.error('Error creating CRM record:', error.response?.data || error.message);
        res.status(500).send('<h2>Error creating CRM record. Please try again later.</h2>');
    }
});

// * Localhost
app.listen(3000, () => console.log('Listening on http://localhost:3000'));