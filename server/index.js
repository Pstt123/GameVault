const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from client/dist (Vite build) or fallback to client
const clientDistPath = path.join(__dirname, "../client/dist");
const clientStaticPath = fs.existsSync(clientDistPath)
  ? clientDistPath
  : path.join(__dirname, "../client");
app.use(express.static(clientStaticPath));

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// ==========================================
// 1. GAMES CATALOG ROUTES
// ==========================================

// GET /api/games - Fetch all games
app.get("/api/games", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, genre, platform, rating::float AS rating, releasedate, image, developer, description 
       FROM games 
       ORDER BY id ASC;`
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({ error: "Failed to fetch games catalog" });
  }
});

// GET /api/games/:id - Fetch single game
app.get("/api/games/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT id, title, genre, platform, rating::float AS rating, releasedate, image, developer, description 
       FROM games 
       WHERE id = $1;`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching game:", error);
    res.status(500).json({ error: "Failed to fetch game details" });
  }
});

// POST /api/games - Add a new game
app.post("/api/games", async (req, res) => {
  const { title, genre, platform, rating, releasedate, image, developer, description } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }
  if (!genre || !genre.trim()) {
    return res.status(400).json({ error: "Genre is required" });
  }
  if (!platform || !platform.trim()) {
    return res.status(400).json({ error: "Platform is required" });
  }

  const parsedRating = parseFloat(rating);
  if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
    return res.status(400).json({ error: "Rating must be a number between 0.0 and 5.0" });
  }

  const gameImage = image && image.trim() ? image.trim() : "images/Logo.png";
  const gameReleaseDate = releasedate && releasedate.trim() ? releasedate.trim() : "TBA";
  const gameDeveloper = developer && developer.trim() ? developer.trim() : null;
  const gameDescription = description && description.trim() ? description.trim() : null;

  try {
    const { rows } = await pool.query(
      `INSERT INTO games (title, genre, platform, rating, releasedate, image, developer, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, title, genre, platform, rating::float AS rating, releasedate, image, developer, description;`,
      [
        title.trim(),
        genre.trim(),
        platform.trim(),
        parsedRating,
        gameReleaseDate,
        gameImage,
        gameDeveloper,
        gameDescription,
      ]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error adding game to catalog:", error);
    res.status(500).json({ error: "Failed to add game to catalog" });
  }
});

// DELETE /api/games/:id - Delete game from catalog
app.delete("/api/games/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query("DELETE FROM games WHERE id = $1;", [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: "Game not found" });
    }
    res.json({ message: "Game deleted successfully" });
  } catch (error) {
    console.error("Error deleting game:", error);
    res.status(500).json({ error: "Failed to delete game" });
  }
});

// ==========================================
// 2. BACKLOG ROUTES
// ==========================================

// GET /api/backlog - Fetch backlog games
app.get("/api/backlog", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT g.id, g.title, g.genre, g.platform, g.rating::float AS rating, g.releasedate, g.image, g.developer, g.description, b.status, b.created_at
       FROM backlog b
       JOIN games g ON b.game_id = g.id
       ORDER BY b.created_at ASC;`
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching backlog:", error);
    res.status(500).json({ error: "Failed to fetch backlog" });
  }
});

// POST /api/backlog - Add game to backlog
app.post("/api/backlog", async (req, res) => {
  const { gameId, status = "Plan to Play" } = req.body;

  if (!gameId) {
    return res.status(400).json({ error: "gameId is required" });
  }

  try {
    await pool.query(
      `INSERT INTO backlog (game_id, status)
       VALUES ($1, $2)
       ON CONFLICT (game_id) DO UPDATE SET status = EXCLUDED.status;`,
      [gameId, status]
    );

    const { rows } = await pool.query(
      `SELECT g.id, g.title, g.genre, g.platform, g.rating::float AS rating, g.releasedate, g.image, g.developer, g.description, b.status
       FROM backlog b
       JOIN games g ON b.game_id = g.id
       WHERE g.id = $1;`,
      [gameId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error adding to backlog:", error);
    res.status(500).json({ error: "Failed to add game to backlog" });
  }
});

// PATCH /api/backlog/:gameId - Update status (e.g. toggle "Completed")
app.patch("/api/backlog/:gameId", async (req, res) => {
  const { gameId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "status is required" });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE backlog
       SET status = $1
       WHERE game_id = $2
       RETURNING *;`,
      [status, gameId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Game not found in backlog" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error updating backlog status:", error);
    res.status(500).json({ error: "Failed to update backlog status" });
  }
});

// DELETE /api/backlog/:gameId - Remove from backlog
app.delete("/api/backlog/:gameId", async (req, res) => {
  const { gameId } = req.params;
  try {
    await pool.query("DELETE FROM backlog WHERE game_id = $1;", [gameId]);
    res.json({ message: "Game removed from backlog successfully" });
  } catch (error) {
    console.error("Error removing from backlog:", error);
    res.status(500).json({ error: "Failed to remove game from backlog" });
  }
});

// ==========================================
// 3. FAVORITES ROUTES
// ==========================================

// GET /api/favorites - Fetch favorited games
app.get("/api/favorites", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT g.id, g.title, g.genre, g.platform, g.rating::float AS rating, g.releasedate, g.image, g.developer, g.description, f.created_at
       FROM favorites f
       JOIN games g ON f.game_id = g.id
       ORDER BY f.created_at ASC;`
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

// POST /api/favorites - Add game to favorites
app.post("/api/favorites", async (req, res) => {
  const { gameId } = req.body;

  if (!gameId) {
    return res.status(400).json({ error: "gameId is required" });
  }

  try {
    await pool.query(
      `INSERT INTO favorites (game_id)
       VALUES ($1)
       ON CONFLICT (game_id) DO NOTHING;`,
      [gameId]
    );

    const { rows } = await pool.query(
      `SELECT g.id, g.title, g.genre, g.platform, g.rating::float AS rating, g.releasedate, g.image, g.developer, g.description
       FROM favorites f
       JOIN games g ON f.game_id = g.id
       WHERE g.id = $1;`,
      [gameId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error adding to favorites:", error);
    res.status(500).json({ error: "Failed to add game to favorites" });
  }
});

// DELETE /api/favorites/:gameId - Remove from favorites
app.delete("/api/favorites/:gameId", async (req, res) => {
  const { gameId } = req.params;
  try {
    await pool.query("DELETE FROM favorites WHERE game_id = $1;", [gameId]);
    res.json({ message: "Game removed from favorites successfully" });
  } catch (error) {
    console.error("Error removing from favorites:", error);
    res.status(500).json({ error: "Failed to remove game from favorites" });
  }
});

// Fallback for HTML5 client routing if accessed directly
app.use((req, res) => {
  const fallbackHtml = fs.existsSync(path.join(clientDistPath, "index.html"))
    ? path.join(clientDistPath, "index.html")
    : path.join(__dirname, "../client/index.html");
  res.sendFile(fallbackHtml);
});

// Start server (listen on all network interfaces to allow mobile device connection)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running locally: http://localhost:${PORT}`);
  console.log(`Network access (for mobile app): http://192.168.1.22:${PORT}/api/`);
});
