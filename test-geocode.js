
const Amadeus = require('amadeus');
require('dotenv').config();

const amadeus = new Amadeus({
    clientId: process.env.AMADEUS_CLIENT_ID,
    clientSecret: process.env.AMADEUS_CLIENT_SECRET
});

async function testGeocode(city) {
    try {
        const response = await amadeus.referenceData.locations.get({
            keyword: city,
            subType: 'CITY'
        });
        console.log(`City: ${city}`);
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error(`Error for ${city}:`, error);
    }
}

async function run() {
    await testGeocode('New York');
    await testGeocode('Miami');
    await testGeocode('Richmond');
}

run();
