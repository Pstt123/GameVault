const pool = require("./db");

const initialGames = [
  {
    title: "Elden Ring",
    genre: "Action RPG",
    platform: "PC / PS5 / Xbox",
    rating: 4.9,
    releasedate: "February 2022",
    image: "images/elden_ring.jpg",
    developer: "FromSoftware",
    description:
      "A grand fantasy action RPG set across the Lands Between, crafted by Hidetaka Miyazaki and George R.R. Martin. Journey across expansive landscapes, uncover perilous dungeons, confront legendary demigods, and claim the power of the Elden Ring to become an Elden Lord.",
  },
  {
    title: "Cyberpunk 2077",
    genre: "Action RPG",
    platform: "PC / PS5 / Xbox",
    rating: 4.7,
    releasedate: "December 2020",
    image: "images/cyberpunk_2077.jpg",
    developer: "CD Projekt Red",
    description:
      "An open-world, action-adventure RPG set in Night City, a neon-soaked megalopolis obsessed with power, glamour, and body modification. Assume the role of V, a mercenary outlaw navigating ruthless syndicates and cybernetic legends.",
  },
  {
    title: "Baldur's Gate 3",
    genre: "RPG",
    platform: "PC / PS5 / Xbox",
    rating: 4.9,
    releasedate: "August 2023",
    image: "images/baldurs_gate_3.jpg",
    developer: "Larian Studios",
    description:
      "A story-rich, party-based RPG set in the iconic universe of Dungeons & Dragons. Your choices shape a deep narrative of camaraderie, betrayal, sacrifice, and the lure of absolute power amidst the impending Illithid invasion.",
  },
  {
    title: "God of War Ragnarök",
    genre: "Action",
    platform: "PlayStation / PC",
    rating: 4.8,
    releasedate: "November 2022",
    image: "images/god_of_war.jpg",
    developer: "Santa Monica Studio",
    description:
      "Embark on an epic and heartfelt odyssey as Kratos and Atreus grapple with fate and familial bonds against the formidable gods and beasts of the Nine Realms as Ragnarök approaches.",
  },
  {
    title: "Hollow Knight",
    genre: "Indie",
    platform: "Multiplatform",
    rating: 4.9,
    releasedate: "February 2017",
    image: "images/hollow_knight.jpg",
    developer: "Team Cherry",
    description:
      "An award-winning 2D action adventure through Hallownest, a vast forgotten kingdom of insects and heroes. Explore twisting caverns, master agile combat abilities, and unravel ancient mysteries entombed beneath the earth.",
  },
  {
    title: "Red Dead Redemption 2",
    genre: "Open World",
    platform: "PC / PS4 / Xbox",
    rating: 4.9,
    releasedate: "October 2018",
    image: "images/rdr2.jpg",
    developer: "Rockstar Games",
    description:
      "An epic tale of honor, brotherhood, and survival at the dawn of the modern era in America. Follow Arthur Morgan and the Van der Linde gang as they fight to survive across the rugged, sprawling heartland.",
  },
  {
    title: "Hades",
    genre: "Indie",
    platform: "Multiplatform",
    rating: 4.8,
    releasedate: "September 2020",
    image: "images/hades.jpg",
    developer: "Supergiant Games",
    description:
      "Defy the god of the dead in this rogue-like dungeon crawler. Wield legendary Olympian powers and mythical weapons to slash your way out of the Underworld while uncovering a rich narrative tapestry.",
  },
  {
    title: "Marvel's Spider-Man",
    genre: "Action",
    platform: "PC / PS5",
    rating: 4.8,
    releasedate: "August 2022",
    image: "images/spiderman.jpg",
    developer: "Insomniac Games",
    description:
      "Swing through the skyscrapers of Marvel's New York as an experienced Peter Parker. Master acrobatic improvisational combat and traverse iconic city landmarks in an emotional, high-stakes superhero blockbuster.",
  },
  {
    title: "Ghost of Tsushima",
    genre: "Open World",
    platform: "PC / PS5",
    rating: 4.8,
    releasedate: "July 2020",
    image: "images/ghost_of_tsushima.jpg",
    developer: "Sucker Punch Productions",
    description:
      "In late 13th-century feudal Japan, samurai warrior Jin Sakai must shatter tradition and forge the unconventional path of the Ghost to liberate his island home of Tsushima from Mongol invaders.",
  },
  {
    title: "Persona 5 Royal",
    genre: "RPG",
    platform: "Multiplatform",
    rating: 4.9,
    releasedate: "October 2022",
    image: "images/persona_5_royal.jpg",
    developer: "Atlus",
    description:
      "Don the iconic mask of Joker and lead the Phantom Thieves of Hearts. Balance Tokyo high-school student life by day with daring supernatural metaverse palace infiltrations by night.",
  },
  {
    title: "Stardew Valley",
    genre: "Indie",
    platform: "Multiplatform",
    rating: 4.9,
    releasedate: "February 2016",
    image: "images/stardew_valley.jpg",
    developer: "ConcernedApe",
    description:
      "Inherit your grandfather's overgrown farm plot in Pelican Town. Cultivate crops, raise livestock, forge lasting friendships with townspeople, and breathe new life into the charming countryside community.",
  },
  {
    title: "Monster Hunter: World",
    genre: "Action RPG",
    platform: "PC / PS4 / Xbox",
    rating: 4.7,
    releasedate: "January 2018",
    image: "images/monster_hunter.jpg",
    developer: "Capcom",
    description:
      "Step into the role of a research hunter exploring the New World. Track and battle colossal predatory beasts across living, breathing ecosystems using handcrafted armor and versatile weapons.",
  },
];

async function seedDatabase() {
  const client = await pool.connect();
  try {
    console.log("Connected to database. Setting up schema...");

    await client.query("BEGIN");

    // 1. Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        genre VARCHAR(100) NOT NULL,
        platform VARCHAR(100) NOT NULL,
        rating NUMERIC(3, 1) NOT NULL,
        releasedate VARCHAR(50) NOT NULL,
        image VARCHAR(255) NOT NULL,
        developer VARCHAR(150),
        description TEXT
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS backlog (
        id SERIAL PRIMARY KEY,
        game_id INT UNIQUE REFERENCES games(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL DEFAULT 'Plan to Play',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        game_id INT UNIQUE REFERENCES games(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Check if games already exist
    const { rows } = await client.query("SELECT COUNT(*) AS count FROM games;");
    const gameCount = parseInt(rows[0].count, 10);

    if (gameCount === 0) {
      console.log("No games found. Seeding initial 12 games...");
      for (const game of initialGames) {
        await client.query(
          `INSERT INTO games (title, genre, platform, rating, releasedate, image, developer, description)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
          [
            game.title,
            game.genre,
            game.platform,
            game.rating,
            game.releasedate,
            game.image,
            game.developer,
            game.description,
          ]
        );
      }
      console.log("Seeded initial games successfully.");
    } else {
      console.log(`Database already has ${gameCount} games. Skipping seed.`);
    }

    await client.query("COMMIT");
    console.log("Database schema and seed completed successfully!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error setting up database:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();
