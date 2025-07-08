const axios = require('axios');

const fetchCharactersFromAPI = async () => {
    try {
        console.log(`Fetching characters from ${process.env.POTTER_API_URL}...`);
        const response = await axios.get(process.env.POTTER_API_URL);
        const data = response.data;

        const characters = data.map(char => ({
            characterId: char.id,
            name: char.name,
            imageUrl: char.image,
            description: `A ${char.species || 'character'} from the house of ${char.house || 'an unknown house'}. Born on ${char.dateOfBirth || 'an unknown date'}.`,
            house: char.house,
            species: char.species,
            gender: char.gender,
            ancestry: char.ancestry,
            actor: char.actor,
            alternate_names: char.alternate_names || [],
            alive: typeof char.alive === 'boolean' ? char.alive : undefined,
            eyeColour: char.eyeColour,
            hairColour: char.hairColour,
            dateOfBirth: char.dateOfBirth,
            yearOfBirth: char.yearOfBirth,
            wand: char.wand || {},
            hogwartsStudent: char.hogwartsStudent,
            hogwartsStaff: char.hogwartsStaff,
            wizard: char.wizard,
            patronus: char.patronus,
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