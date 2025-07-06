const axios = require('axios');

const fetchCharactersFromAPI = async () => {
    try {
        console.log(`Fetching characters from ${process.env.POTTER_API_URL}...`);
        // The PotterDB API paginates results. We might need to fetch multiple pages.
        // For simplicity, this seed will fetch the first page only.
        const response = await axios.get(process.env.POTTER_API_URL);
        
        // Map the API data to our Sticker schema
        const characters = response.data.data.map(char => ({
            characterId: char.id,
            name: char.attributes.name,
            imageUrl: char.attributes.image,
            // Synthesize description [cite: 215]
            description: `A ${char.attributes.species || 'character'} from the house of ${char.attributes.house || 'an unknown house'}. Born on ${char.attributes.born || 'an unknown date'}.`,
            house: char.attributes.house,
            species: char.attributes.species,
            wand: char.attributes.wand,
            patronus: char.attributes.patronus,
            // Simple rarity assignment for example
            rarity: Math.floor(Math.random() * 5) + 1
        }));

        console.log(`Successfully fetched ${characters.length} characters.`);
        return characters;
    } catch (error) {
        console.error('Error fetching data from Potter API:', error.message);
        return [];
    }
};

module.exports = { fetchCharactersFromAPI };