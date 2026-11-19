const pool = require("./db");

const gameDetails = [
  {
    title: "Elden Ring",
    developer: "FromSoftware",
    description:
      "A grand fantasy action RPG set across the Lands Between, crafted by Hidetaka Miyazaki and George R.R. Martin. Journey across expansive landscapes, uncover perilous dungeons, confront legendary demigods, and claim the power of the Elden Ring to become an Elden Lord.",
  },
  {
    title: "Cyberpunk 2077",
    developer: "CD Projekt Red",
    description:
      "An open-world, action-adventure RPG set in Night City, a neon-soaked megalopolis obsessed with power, glamour, and body modification. Assume the role of V, a mercenary outlaw navigating ruthless syndicates and cybernetic legends.",
  },
  {
    title: "Baldur's Gate 3",
    developer: "Larian Studios",
    description:
      "A story-rich, party-based RPG set in the iconic universe of Dungeons & Dragons. Your choices shape a deep narrative of camaraderie, betrayal, sacrifice, and the lure of absolute power amidst the impending Illithid invasion.",
  },
  {
    title: "God of War Ragnarök",
    developer: "Santa Monica Studio",
    description:
      "Embark on an epic and heartfelt odyssey as Kratos and Atreus grapple with fate and familial bonds against the formidable gods and beasts of the Nine Realms as Ragnarök approaches.",
  },
  {
    title: "Hollow Knight",
    developer: "Team Cherry",
    description:
      "An award-winning 2D action adventure through Hallownest, a vast forgotten kingdom of insects and heroes. Explore twisting caverns, master agile combat abilities, and unravel ancient mysteries entombed beneath the earth.",
  },
  {
    title: "Red Dead Redemption 2",
    developer: "Rockstar Games",
    description:
      "An epic tale of honor, brotherhood, and survival at the dawn of the modern era in America. Follow Arthur Morgan and the Van der Linde gang as they fight to survive across the rugged, sprawling heartland.",
  },
  {
    title: "Hades",
    developer: "Supergiant Games",
    description:
      "Defy the god of the dead in this rogue-like dungeon crawler. Wield legendary Olympian powers and mythical weapons to slash your way out of the Underworld while uncovering a rich narrative tapestry.",
  },
  {
    title: "Marvel's Spider-Man",
    developer: "Insomniac Games",
    description:
      "Swing through the skyscrapers of Marvel's New York as an experienced Peter Parker. Master acrobatic improvisational combat and traverse iconic city landmarks in an emotional, high-stakes superhero blockbuster.",
  },
  {
    title: "Ghost of Tsushima",
    developer: "Sucker Punch Productions",
    description:
      "In late 13th-century feudal Japan, samurai warrior Jin Sakai must shatter tradition and forge the unconventional path of the Ghost to liberate his island home of Tsushima from Mongol invaders.",
  },
  {
    title: "Persona 5 Royal",
    developer: "Atlus",
    description:
      "Don the iconic mask of Joker and lead the Phantom Thieves of Hearts. Balance Tokyo high-school student life by day with daring supernatural metaverse palace infiltrations by night.",
  },
  {
    title: "Stardew Valley",
    developer: "ConcernedApe",
    description:
      "Inherit your grandfather's overgrown farm plot in Pelican Town. Cultivate crops, raise livestock, forge lasting friendships with townspeople, and breathe new life into the charming countryside community.",
  },
  {
    title: "Monster Hunter: World",
    developer: "Capcom",
    description:
      "Step into the role of a research hunter exploring the New World. Track and battle colossal predatory beasts across living, breathing ecosystems using handcrafted armor and versatile weapons.",
  },
];

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Connected to Neon. Adding description and developer columns...");

    await client.query("BEGIN;");

    await client.query(`
      ALTER TABLE games
      ADD COLUMN IF NOT EXISTS developer VARCHAR(150),
      ADD COLUMN IF NOT EXISTS description TEXT;
    `);

    for (const item of gameDetails) {
      await client.query(
        `UPDATE games
         SET developer = $1, description = $2
         WHERE title = $3;`,
        [item.developer, item.description, item.title]
      );
    }

    await client.query("COMMIT;");
    console.log("Migration complete: Added developer and description to all games!");
  } catch (err) {
    await client.query("ROLLBACK;");
    console.error("Migration failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
