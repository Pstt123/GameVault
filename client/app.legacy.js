const API_BASE = window.location.port === "3000" ? "/api" : "http://localhost:3000/api";

const app = Vue.createApp({
  data() {
    return {
      currentView: "games",
      selectedGenre: "All",
      searchQuery: "",
      sortBy: "featured",
      isLightMode: false,
      isLoading: false,
      networkError: null,

      notice: {
        message: "",
        type: "success",
      },
      noticeTimer: null,

      games: [],
      backlog: [],
      favorites: [],
      selectedGame: null,

      // Add Game modal state
      isAddModalOpen: false,
      isSubmittingGame: false,
      addFormError: "",
      newGame: {
        title: "",
        genre: "Action RPG",
        platform: "PC / PS5 / Xbox",
        rating: 4.8,
        releasedate: "",
        developer: "",
        image: "",
        description: "",
      },
      imagePresets: [
        { label: "Default Vault", url: "images/Logo.png" },
        { label: "Elden Ring", url: "images/elden_ring.jpg" },
        { label: "Cyberpunk", url: "images/cyberpunk_2077.jpg" },
        { label: "Baldur's Gate", url: "images/baldurs_gate_3.jpg" },
        { label: "Spider-Man", url: "images/spiderman.jpg" },
        { label: "Hades", url: "images/hades.jpg" },
        { label: "Hollow Knight", url: "images/hollow_knight.jpg" },
        { label: "Stardew Valley", url: "images/stardew_valley.jpg" },
      ],
    };
  },

  computed: {
    genres() {
      const allGenres = this.games.map((game) => game.genre);
      return ["All", ...new Set(allGenres)];
    },

    displayedGames() {
      let list = [];

      if (this.currentView === "backlog") {
        list = this.backlog;
      } else if (this.currentView === "favorites") {
        list = this.favorites;
      } else {
        list = this.games;
      }

      // Filter by genre in games view
      if (this.currentView === "games" && this.selectedGenre !== "All") {
        list = list.filter((game) => game.genre === this.selectedGenre);
      }

      // Filter by search query across views
      if (this.searchQuery.trim() !== "") {
        const query = this.searchQuery.toLowerCase().trim();
        list = list.filter(
          (game) =>
            game.title.toLowerCase().includes(query) ||
            game.genre.toLowerCase().includes(query) ||
            game.platform.toLowerCase().includes(query),
        );
      }

      // Sorting
      if (this.sortBy === "rating") {
        list = [...list].sort((a, b) => b.rating - a.rating);
      } else if (this.sortBy === "name") {
        list = [...list].sort((a, b) => a.title.localeCompare(b.title));
      }

      return list;
    },

    currentViewTitle() {
      const titles = {
        games: "Game Catalog",
        backlog: "My Play Backlog",
        favorites: "Hall of Fame",
      };
      return titles[this.currentView];
    },

    currentViewBadge() {
      const badges = {
        games: "EXPLORE ALL",
        backlog: "PLAY QUEUE",
        favorites: "TOP PICKS",
      };
      return badges[this.currentView];
    },

    currentViewDescription() {
      const descriptions = {
        games:
          "Browse through all available titles, manage your queue, and star your favorites.",
        backlog:
          "Track titles you plan to play and check off completed adventures.",
        favorites:
          "Your top-rated masterpieces and all-time favorite gaming experiences.",
      };
      return descriptions[this.currentView];
    },

    emptyStateTitle() {
      if (this.searchQuery) {
        return "No matching games found";
      }
      return this.currentView === "backlog"
        ? "Your backlog is empty"
        : "You have no favorite games yet";
    },

    emptyStateMessage() {
      if (this.searchQuery) {
        return `No results found for "${this.searchQuery}". Try a different keyword or reset filters.`;
      }
      return this.currentView === "backlog"
        ? "Explore the catalog and add titles you plan to play later."
        : "Explore the catalog and star the titles you love the most.";
    },

    emptyStateIcon() {
      if (this.searchQuery) {
        return "fa fa-search";
      }
      return this.currentView === "backlog"
        ? "fa fa-bookmark-o"
        : "fa fa-heart-o";
    },

    numberOfGames() {
      return this.games.length;
    },

    numberOfBacklog() {
      return this.backlog.length;
    },

    numberOfFavorites() {
      return this.favorites.length;
    },

    completedBacklogCount() {
      return this.backlog.filter((game) => game.status === "Completed").length;
    },

    currentYear() {
      return new Date().getFullYear();
    },
  },

  async mounted() {
    // Initialize theme from localStorage
    const savedTheme = window.localStorage.getItem("gamevault-theme");
    if (savedTheme === "light") {
      this.isLightMode = true;
      document.body.classList.add("light-theme");
    }

    // Handle Escape key to close modal
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (this.isAddModalOpen) {
          this.closeAddGameModal();
        } else if (this.selectedGame) {
          this.closeGameDetails();
        }
      }
    });

    await this.loadAllData();
  },

  methods: {
    async loadAllData() {
      this.isLoading = true;
      this.networkError = null;
      try {
        const [gamesRes, backlogRes, favoritesRes] = await Promise.all([
          fetch(`${API_BASE}/games`),
          fetch(`${API_BASE}/backlog`),
          fetch(`${API_BASE}/favorites`),
        ]);

        if (!gamesRes.ok || !backlogRes.ok || !favoritesRes.ok) {
          throw new Error("Failed to load data from server");
        }

        this.games = await gamesRes.json();
        this.backlog = await backlogRes.json();
        this.favorites = await favoritesRes.json();
      } catch (err) {
        console.error("API error:", err);
        this.networkError =
          "Unable to connect to the backend server. Make sure the server is running on port 3000.";
        this.showNotice("Could not load data from backend server.", "info");
      } finally {
        this.isLoading = false;
      }
    },

    setView(view) {
      this.currentView = view;
      this.clearNotice();
    },

    setGenre(genre) {
      this.selectedGenre = genre;
    },

    clearSearch() {
      this.searchQuery = "";
      this.selectedGenre = "All";
      this.sortBy = "featured";
    },

    toggleTheme() {
      this.isLightMode = !this.isLightMode;
      if (this.isLightMode) {
        document.body.classList.add("light-theme");
        window.localStorage.setItem("gamevault-theme", "light");
        this.showNotice("Switched to Light Theme", "info");
      } else {
        document.body.classList.remove("light-theme");
        window.localStorage.setItem("gamevault-theme", "dark");
        this.showNotice("Switched to Dark Theme", "info");
      }
    },

    async addToBacklog(game) {
      const alreadyExists = this.isInBacklog(game);
      if (alreadyExists) {
        this.showNotice(`${game.title} is already in your backlog.`, "info");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/backlog`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId: game.id, status: "Plan to Play" }),
        });

        if (!res.ok) throw new Error("Failed to add to backlog");
        const addedItem = await res.json();
        this.backlog.push(addedItem);
        this.showNotice(`${game.title} was added to your backlog.`, "success");
      } catch (error) {
        console.error(error);
        this.showNotice(`Failed to add ${game.title} to backlog.`, "info");
      }
    },

    async addToFavorites(game) {
      const alreadyExists = this.isInFavorites(game);
      if (alreadyExists) {
        this.showNotice(`${game.title} is already in your favorites.`, "info");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/favorites`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId: game.id }),
        });

        if (!res.ok) throw new Error("Failed to add to favorites");
        const addedItem = await res.json();
        this.favorites.push(addedItem);
        this.showNotice(`${game.title} was added to your favorites.`, "success");
      } catch (error) {
        console.error(error);
        this.showNotice(`Failed to add ${game.title} to favorites.`, "info");
      }
    },

    async removeFromBacklog(game) {
      try {
        const res = await fetch(`${API_BASE}/backlog/${game.id}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error("Failed to remove from backlog");
        const index = this.backlog.findIndex((item) => item.id === game.id);
        if (index !== -1) {
          this.backlog.splice(index, 1);
        }
        this.showNotice(`${game.title} was removed from your backlog.`, "success");
      } catch (error) {
        console.error(error);
        this.showNotice(`Failed to remove ${game.title} from backlog.`, "info");
      }
    },

    async removeFromFavorites(game) {
      try {
        const res = await fetch(`${API_BASE}/favorites/${game.id}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error("Failed to remove from favorites");
        const index = this.favorites.findIndex((item) => item.id === game.id);
        if (index !== -1) {
          this.favorites.splice(index, 1);
        }
        this.showNotice(`${game.title} was removed from your favorites.`, "success");
      } catch (error) {
        console.error(error);
        this.showNotice(`Failed to remove ${game.title} from favorites.`, "info");
      }
    },

    async toggleGameStatus(game) {
      const item = this.backlog.find((b) => b.id === game.id);
      if (!item) return;

      const newStatus = item.status === "Completed" ? "Plan to Play" : "Completed";

      try {
        const res = await fetch(`${API_BASE}/backlog/${game.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!res.ok) throw new Error("Failed to update status");
        item.status = newStatus;
        const message =
          newStatus === "Completed"
            ? `Marked ${item.title} as Completed! 🎉`
            : `Marked ${item.title} as Plan to Play.`;
        this.showNotice(message, "success");
      } catch (error) {
        console.error(error);
        this.showNotice(`Failed to update status for ${item.title}.`, "info");
      }
    },

    isInBacklog(game) {
      return this.backlog.some((item) => item.id === game.id);
    },

    isInFavorites(game) {
      return this.favorites.some((item) => item.id === game.id);
    },

    showNotice(message, type = "success") {
      this.clearNotice();

      this.notice = {
        message,
        type,
      };

      this.noticeTimer = window.setTimeout(() => {
        this.clearNotice();
      }, 2600);
    },

    clearNotice() {
      if (this.noticeTimer) {
        window.clearTimeout(this.noticeTimer);
        this.noticeTimer = null;
      }

      this.notice = {
        message: "",
        type: "success",
      };
    },

    openGameDetails(game) {
      this.selectedGame = { ...game };
      // If developer/description is missing, fetch full details asynchronously
      if (!this.selectedGame.description || !this.selectedGame.developer) {
        fetch(`${API_BASE}/games/${game.id}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((detailed) => {
            if (detailed && this.selectedGame && this.selectedGame.id === game.id) {
              this.selectedGame = { ...this.selectedGame, ...detailed };
            }
          })
          .catch((err) => console.warn("Could not fetch game details:", err));
      }
    },

    closeGameDetails() {
      this.selectedGame = null;
    },

    getBacklogStatus(game) {
      if (!game) return "Plan to Play";
      const item = this.backlog.find((b) => b.id === game.id);
      return item ? item.status : (game.status || "Plan to Play");
    },

    openAddGameModal() {
      this.addFormError = "";
      this.newGame = {
        title: "",
        genre: "Action RPG",
        platform: "PC / PS5 / Xbox",
        rating: 4.8,
        releasedate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        developer: "",
        image: "",
        description: "",
      };
      this.isAddModalOpen = true;

      // Focus first input after modal renders
      this.$nextTick(() => {
        if (this.$refs.gameTitleInput) {
          this.$refs.gameTitleInput.focus();
        }
      });
    },

    closeAddGameModal() {
      this.isAddModalOpen = false;
      this.addFormError = "";
    },

    selectImagePreset(url) {
      this.newGame.image = url;
    },

    isLogoImage(url) {
      return Boolean(url && url.toLowerCase().includes("logo.png"));
    },

    previewImageFallback(e) {
      if (e && e.target) {
        e.target.src = "images/Logo.png";
      }
    },

    async submitAddGame() {
      this.addFormError = "";

      // Validate required inputs
      if (!this.newGame.title || !this.newGame.title.trim()) {
        this.addFormError = "Please enter a game title.";
        return;
      }
      if (!this.newGame.genre || !this.newGame.genre.trim()) {
        this.addFormError = "Please specify a genre.";
        return;
      }
      if (!this.newGame.platform || !this.newGame.platform.trim()) {
        this.addFormError = "Please specify supported platform(s).";
        return;
      }

      const ratingVal = parseFloat(this.newGame.rating);
      if (isNaN(ratingVal) || ratingVal < 0 || ratingVal > 5) {
        this.addFormError = "Rating must be a score between 0.0 and 5.0.";
        return;
      }

      if (!this.newGame.releasedate || !this.newGame.releasedate.trim()) {
        this.addFormError = "Please provide a release date.";
        return;
      }

      this.isSubmittingGame = true;

      try {
        const payload = {
          title: this.newGame.title.trim(),
          genre: this.newGame.genre.trim(),
          platform: this.newGame.platform.trim(),
          rating: ratingVal,
          releasedate: this.newGame.releasedate.trim(),
          developer: this.newGame.developer.trim(),
          image: this.newGame.image.trim() || "images/Logo.png",
          description: this.newGame.description.trim(),
        };

        const res = await fetch(`${API_BASE}/games`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to create game in database");
        }

        // Add to games catalog at the beginning for immediate visibility
        this.games.unshift(data);

        // Switch to library view so user sees their new game immediately
        this.currentView = "games";
        this.selectedGenre = "All";
        this.searchQuery = "";

        this.closeAddGameModal();
        this.showNotice(`"${data.title}" was added to your library! 🎉`, "success");
      } catch (err) {
        console.error("Failed to add game:", err);
        this.addFormError = err.message || "Failed to add game. Please try again.";
      } finally {
        this.isSubmittingGame = false;
      }
    },

    async deleteGame(game) {
      if (!game) return;

      const confirmed = window.confirm(
        `Are you sure you want to permanently delete "${game.title}" from your library?`
      );
      if (!confirmed) return;

      try {
        const res = await fetch(`${API_BASE}/games/${game.id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to delete game");
        }

        // Remove from local lists
        this.games = this.games.filter((g) => g.id !== game.id);
        this.backlog = this.backlog.filter((g) => g.id !== game.id);
        this.favorites = this.favorites.filter((g) => g.id !== game.id);

        this.closeGameDetails();
        this.showNotice(`"${game.title}" was removed from the library.`, "info");
      } catch (err) {
        console.error("Failed to delete game:", err);
        this.showNotice(`Failed to delete "${game.title}".`, "info");
      }
    },
  },
});

app.mount("#app");