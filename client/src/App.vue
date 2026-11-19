<template>
  <div class="app-layout">
    
    <aside class="app-sidebar" aria-label="Main Navigation">
      <div class="sidebar-header">
        <button
          type="button"
          class="brand-badge"
          @click="setView('games')"
        >
          <div class="brand-icon">
            <i class="fa fa-gamepad" aria-hidden="true"></i>
          </div>
          <div class="brand-info">
            <span class="brand-title">GameVault</span>
            <span class="brand-sub">Gaming Hub</span>
          </div>
        </button>
      </div>

      <div class="sidebar-body">
        <div class="nav-group">
          <div class="group-title">Collections</div>
          <nav class="nav-menu">
            <button
              type="button"
              class="nav-item"
              :class="{ active: currentView === 'games' }"
              @click="setView('games')"
            >
              <i class="fa fa-th-large nav-icon" aria-hidden="true"></i>
              <span class="nav-text">Library</span>
              <span class="nav-pill">{{ numberOfGames }}</span>
            </button>

            <button
              type="button"
              class="nav-item"
              :class="{ active: currentView === 'backlog' }"
              @click="setView('backlog')"
            >
              <i class="fa fa-bookmark nav-icon" aria-hidden="true"></i>
              <span class="nav-text">Backlog</span>
              <span class="nav-pill pill-backlog">{{ numberOfBacklog }}</span>
            </button>

            <button
              type="button"
              class="nav-item"
              :class="{ active: currentView === 'favorites' }"
              @click="setView('favorites')"
            >
              <i class="fa fa-heart nav-icon" aria-hidden="true"></i>
              <span class="nav-text">Favorites</span>
              <span class="nav-pill pill-favorites">{{ numberOfFavorites }}</span>
            </button>
          </nav>

          <div class="sidebar-action-wrap">
            <button
              type="button"
              class="sidebar-add-game-btn"
              @click="openAddGameModal()"
            >
              <i class="fa fa-plus-circle" aria-hidden="true"></i>
              <span>Add New Game</span>
            </button>
          </div>
        </div>

        <div v-if="currentView === 'games'" class="nav-group">
          <div class="group-title">Browse by Genre</div>
          <div class="sidebar-genres">
            <button
              v-for="genre in genres"
              :key="genre"
              type="button"
              class="sidebar-genre-chip"
              :class="{ active: selectedGenre === genre }"
              @click="setGenre(genre)"
            >
              <span>{{ genre }}</span>
              <i v-if="selectedGenre === genre" class="fa fa-check-circle" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <div class="user-progress-widget">
          <div class="progress-title">
            <i class="fa fa-pie-chart" aria-hidden="true"></i>
            <span>Queue Overview</span>
          </div>
          <div class="progress-item">
            <span>Completed Titles</span>
            <strong>{{ completedBacklogCount }} / {{ numberOfBacklog }}</strong>
          </div>
          <div class="progress-item">
            <span>Hall of Fame</span>
            <strong>{{ numberOfFavorites }} games</strong>
          </div>
        </div>
      </div>

      <div class="sidebar-footer">
        <button
          type="button"
          class="theme-switch-row"
          :title="isLightMode ? 'Switch to Dark Theme' : 'Switch to Light Theme'"
          @click="toggleTheme()"
        >
          <div class="theme-switch-label">
            <i class="fa" :class="isLightMode ? 'fa-moon-o' : 'fa-sun-o'" aria-hidden="true"></i>
            <span>{{ isLightMode ? 'Dark Theme' : 'Light Theme' }}</span>
          </div>
          <div class="theme-switch-indicator" :class="{ 'is-light': isLightMode }"></div>
        </button>

        <div class="sidebar-copyright">
          &copy; {{ currentYear }} GameVault • Vue 3 + Quasar
        </div>

        <button
          type="button"
          class="server-config-btn"
          title="Configure backend server connection"
          @click="openServerModal()"
        >
          <i class="fa fa-server" aria-hidden="true"></i>
          <span>API: {{ serverDisplayHost }}</span>
        </button>
      </div>
    </aside>

    <div class="app-main">
      
      <header class="workspace-topbar">
        <div class="topbar-search">
          <i class="fa fa-search search-icon" aria-hidden="true"></i>
          <input
            type="text"
            v-model.trim="searchQuery"
            placeholder="Search by title, genre, or platform..."
            class="search-input-field"
          >
          <button
            v-if="searchQuery"
            type="button"
            class="search-clear-btn"
            title="Clear search"
            @click="searchQuery = ''"
          >
            <i class="fa fa-times" aria-hidden="true"></i>
          </button>
        </div>

        <div class="topbar-actions">
          <button
            type="button"
            class="topbar-add-game-btn"
            @click="openAddGameModal()"
            title="Add a new game to library"
          >
            <i class="fa fa-plus" aria-hidden="true"></i>
            <span>Add Game</span>
          </button>

          <div class="sort-selector">
            <label for="sortDropdown"><i class="fa fa-sort" aria-hidden="true"></i> Sort by:</label>
            <select id="sortDropdown" v-model="sortBy" class="sort-select-box">
              <option value="featured">Featured</option>
              <option value="rating">Rating (High to Low)</option>
              <option value="name">Title (A - Z)</option>
            </select>
          </div>
        </div>
      </header>

      <main class="workspace-content">
        
        <transition name="notice">
          <div
            v-if="notice.message"
            class="app-notice-toast"
            :class="'toast-' + notice.type"
            role="status"
          >
            <i
              class="fa"
              :class="notice.type === 'success' ? 'fa-check-circle' : 'fa-info-circle'"
              aria-hidden="true"
            ></i>
            <span>{{ notice.message }}</span>
          </div>
        </transition>

        <section class="view-hero-card">
          <div class="hero-left">
            <span class="hero-pill">{{ currentViewBadge }}</span>
            <h1 class="hero-title">{{ currentViewTitle }}</h1>
            <p class="hero-desc">{{ currentViewDescription }}</p>
          </div>

          <div class="metrics-ribbon">
            <div class="metric-box">
              <div class="metric-val">{{ numberOfGames }}</div>
              <div class="metric-caption">Total Games</div>
            </div>
            <div class="metric-box">
              <div class="metric-val">{{ numberOfBacklog }}</div>
              <div class="metric-caption">In Backlog</div>
            </div>
            <div class="metric-box">
              <div class="metric-val">{{ numberOfFavorites }}</div>
              <div class="metric-caption">Favorited</div>
            </div>
          </div>
        </section>

        <!-- Loading State -->
        <section v-if="isLoading" class="empty-state-box">
          <div class="empty-state-icon">
            <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
          </div>
          <h2>Connecting to Database...</h2>
          <p>Fetching your games library from database.</p>
        </section>

        <!-- Network Error State -->
        <section v-else-if="networkError" class="empty-state-box">
          <div class="empty-state-icon">
            <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
          </div>
          <h2>Connection Error</h2>
          <p>{{ networkError }}</p>
          <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button type="button" class="empty-cta-btn" @click="loadAllData()">
              Retry Connection
            </button>
            <button
              type="button"
              class="empty-cta-btn"
              style="background: var(--bg-card); border: 1px solid var(--accent-primary);"
              @click="openServerModal()"
            >
              <i class="fa fa-cog" aria-hidden="true"></i> Change Server IP
            </button>
          </div>
        </section>

        <section v-else-if="displayedGames.length" class="games-stream-grid">
          <article
            v-for="game in displayedGames"
            :key="game.id"
            class="game-stream-card"
            @click="openGameDetails(game)"
            tabindex="0"
            role="button"
            :aria-label="'View details for ' + game.title"
            @keydown.enter="openGameDetails(game)"
          >
            <div class="card-cover-wrap">
              <img
                :src="game.image"
                :alt="game.title + ' cover'"
                class="card-cover-img"
                loading="lazy"
              >
              <div class="cover-overlay-tags">
                <span class="cover-genre-tag">{{ game.genre }}</span>
                <span class="cover-rating-tag">
                  <i class="fa fa-star" aria-hidden="true"></i>
                  {{ game.rating }}
                </span>
              </div>
              <div class="card-click-hint">
                <i class="fa fa-eye" aria-hidden="true"></i>
                <span>Details</span>
              </div>
            </div>

            <div class="card-info-wrap">
              <h2 class="card-title">{{ game.title }}</h2>

              <div class="card-details">
                <span class="detail-item">
                  <i class="fa fa-gamepad" aria-hidden="true"></i>
                  {{ game.platform }}
                </span>
                <span class="detail-item">
                  <i class="fa fa-calendar-o" aria-hidden="true"></i>
                  {{ game.releasedate }}
                </span>
              </div>

              <div
                v-if="currentView === 'backlog'"
                class="queue-status-chip"
                :class="game.status === 'Completed' ? 'status-done' : 'status-waiting'"
              >
                <i
                  class="fa"
                  :class="game.status === 'Completed' ? 'fa-check-circle' : 'fa-hourglass-half'"
                  aria-hidden="true"
                ></i>
                <span>{{ game.status }}</span>
              </div>

              <div v-if="currentView === 'games'" class="card-buttons-row">
                <button
                  type="button"
                  class="action-btn btn-queue"
                  :disabled="isInBacklog(game)"
                  :title="isInBacklog(game) ? 'Already in backlog' : 'Add to backlog'"
                  @click.stop="addToBacklog(game)"
                >
                  <i
                    class="fa"
                    :class="isInBacklog(game) ? 'fa-check' : 'fa-bookmark'"
                    aria-hidden="true"
                  ></i>
                  <span>{{ isInBacklog(game) ? 'In Queue' : '+ Backlog' }}</span>
                </button>

                <button
                  type="button"
                  class="action-btn btn-fav"
                  :disabled="isInFavorites(game)"
                  :title="isInFavorites(game) ? 'Already in favorites' : 'Add to favorites'"
                  @click.stop="addToFavorites(game)"
                >
                  <i
                    class="fa"
                    :class="isInFavorites(game) ? 'fa-heart' : 'fa-heart-o'"
                    aria-hidden="true"
                  ></i>
                  <span>{{ isInFavorites(game) ? 'Starred' : 'Star' }}</span>
                </button>
              </div>

              <div v-else-if="currentView === 'backlog'" class="card-buttons-row">
                <button
                  type="button"
                  class="action-btn btn-toggle-state"
                  :title="game.status === 'Completed' ? 'Reopen game' : 'Mark completed'"
                  @click.stop="toggleGameStatus(game)"
                >
                  <i
                    class="fa"
                    :class="game.status === 'Completed' ? 'fa-undo' : 'fa-check'"
                    aria-hidden="true"
                  ></i>
                  <span>{{ game.status === 'Completed' ? 'Reopen' : 'Done' }}</span>
                </button>

                <button
                  type="button"
                  class="action-btn btn-delete"
                  title="Remove from backlog"
                  @click.stop="removeFromBacklog(game)"
                >
                  <i class="fa fa-trash" aria-hidden="true"></i>
                  <span>Remove</span>
                </button>
              </div>

              <button
                v-else
                type="button"
                class="action-btn btn-delete full-btn"
                title="Remove from favorites"
                @click.stop="removeFromFavorites(game)"
              >
                <i class="fa fa-trash" aria-hidden="true"></i>
                <span>Remove from Favorites</span>
              </button>
            </div>
          </article>
        </section>

        <section v-else class="empty-state-box">
          <div class="empty-state-icon">
            <i :class="emptyStateIcon" aria-hidden="true"></i>
          </div>
          <h2>{{ emptyStateTitle }}</h2>
          <p>{{ emptyStateMessage }}</p>

          <button
            v-if="searchQuery || selectedGenre !== 'All'"
            type="button"
            class="empty-cta-btn"
            @click="clearSearch()"
          >
            Clear Filters & Search
          </button>
          <button
            v-else
            type="button"
            class="empty-cta-btn"
            @click="setView('games')"
          >
            Explore All Games
          </button>
        </section>

      </main>
    </div>

    <!-- Game Details Modal Dialog -->
    <transition name="modal-fade">
      <div v-if="selectedGame" class="modal-wrapper">
        <div class="modal-backdrop" @click="closeGameDetails()" aria-hidden="true"></div>

        <div
          class="modal-dialog-split"
          role="dialog"
          aria-modal="true"
          :aria-label="selectedGame.title + ' Details'"
        >
          <button
            type="button"
            class="modal-close-btn"
            title="Close details (Esc)"
            @click="closeGameDetails()"
          >
            <i class="fa fa-times" aria-hidden="true"></i>
          </button>

          <!-- Left Column: Game Poster Artwork -->
          <div class="modal-media-col">
            <div class="modal-poster-wrap">
              <img
                :src="selectedGame.image"
                :alt="selectedGame.title + ' cover'"
                class="modal-poster-img"
              >
            </div>
          </div>

          <!-- Right Column: Complete Game Details -->
          <div class="modal-info-col">
            <div class="modal-info-header">
              <div class="modal-meta-row">
                <span class="modal-tag-genre">{{ selectedGame.genre }}</span>
                <span class="modal-tag-rating">
                  <i class="fa fa-star" aria-hidden="true"></i> {{ selectedGame.rating }}
                </span>
              </div>

              <div class="modal-title-row">
                <div class="modal-title-main">
                  <h2 class="modal-game-title">{{ selectedGame.title }}</h2>
                  <div v-if="selectedGame.developer" class="modal-dev-credit">
                    <i class="fa fa-code" aria-hidden="true"></i>
                    <span>Developer: <strong>{{ selectedGame.developer }}</strong></span>
                  </div>
                </div>

                <!-- Backlog Status Badge -->
                <div
                  v-if="isInBacklog(selectedGame)"
                  class="modal-status-badge"
                  :class="getBacklogStatus(selectedGame) === 'Completed' ? 'badge-done' : 'badge-queued'"
                >
                  <i
                    class="fa"
                    :class="getBacklogStatus(selectedGame) === 'Completed' ? 'fa-check-circle' : 'fa-hourglass-half'"
                    aria-hidden="true"
                  ></i>
                  <span>{{ getBacklogStatus(selectedGame) }}</span>
                </div>
              </div>

              <div class="modal-specs-grid">
                <div class="modal-spec-chip">
                  <div class="spec-icon-wrap">
                    <i class="fa fa-gamepad" aria-hidden="true"></i>
                  </div>
                  <div class="spec-info">
                    <span class="spec-label">Platforms</span>
                    <span class="spec-val" :title="selectedGame.platform">{{ selectedGame.platform }}</span>
                  </div>
                </div>

                <div class="modal-spec-chip">
                  <div class="spec-icon-wrap">
                    <i class="fa fa-calendar-o" aria-hidden="true"></i>
                  </div>
                  <div class="spec-info">
                    <span class="spec-label">Release Date</span>
                    <span class="spec-val">{{ selectedGame.releasedate }}</span>
                  </div>
                </div>

                <div class="modal-spec-chip">
                  <div class="spec-icon-wrap">
                    <i class="fa fa-star" aria-hidden="true"></i>
                  </div>
                  <div class="spec-info">
                    <span class="spec-label">Critic Rating</span>
                    <span class="spec-val">{{ selectedGame.rating }} / 5.0</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-section-synopsis">
              <h3 class="modal-section-heading">
                <i class="fa fa-align-left" aria-hidden="true"></i>
                <span>About this Game</span>
              </h3>
              <p class="modal-desc-text">
                {{ selectedGame.description || 'No detailed synopsis available yet for this title.' }}
              </p>
            </div>

            <div class="modal-bottom-actions">
              <div class="modal-collection-buttons">
                <!-- Backlog Management -->
                <button
                  v-if="!isInBacklog(selectedGame)"
                  type="button"
                  class="modal-action-btn btn-modal-backlog"
                  @click="addToBacklog(selectedGame)"
                >
                  <i class="fa fa-bookmark" aria-hidden="true"></i>
                  <span>Add to Backlog</span>
                </button>
                <div v-else class="modal-action-duo">
                  <button
                    type="button"
                    class="modal-action-btn btn-modal-toggle"
                    @click="toggleGameStatus(selectedGame)"
                  >
                    <i
                      class="fa"
                      :class="getBacklogStatus(selectedGame) === 'Completed' ? 'fa-undo' : 'fa-check'"
                      aria-hidden="true"
                    ></i>
                    <span>{{ getBacklogStatus(selectedGame) === 'Completed' ? 'Reopen Game' : 'Mark Completed' }}</span>
                  </button>
                  <button
                    type="button"
                    class="modal-action-btn btn-modal-remove"
                    title="Remove from Backlog"
                    @click="removeFromBacklog(selectedGame)"
                  >
                    <i class="fa fa-trash" aria-hidden="true"></i>
                    <span>Remove</span>
                  </button>
                </div>

                <!-- Favorites Management -->
                <button
                  type="button"
                  class="modal-action-btn btn-modal-fav"
                  :class="{ active: isInFavorites(selectedGame) }"
                  @click="isInFavorites(selectedGame) ? removeFromFavorites(selectedGame) : addToFavorites(selectedGame)"
                >
                  <i
                    class="fa"
                    :class="isInFavorites(selectedGame) ? 'fa-heart' : 'fa-heart-o'"
                    aria-hidden="true"
                  ></i>
                  <span>{{ isInFavorites(selectedGame) ? 'Favorited' : 'Star as Favorite' }}</span>
                </button>

                <!-- Delete Game from Vault -->
                <button
                  type="button"
                  class="modal-action-btn btn-modal-delete-game"
                  title="Delete this game permanently from vault"
                  @click="deleteGame(selectedGame)"
                >
                  <i class="fa fa-trash-o" aria-hidden="true"></i>
                  <span>Delete Game</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Add Game Modal Dialog -->
    <transition name="modal-fade">
      <div v-if="isAddModalOpen" class="modal-wrapper">
        <div class="modal-backdrop" @click="closeAddGameModal()" aria-hidden="true"></div>

        <div
          class="modal-dialog-split modal-add-game-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="Add New Game"
        >
          <button
            type="button"
            class="modal-close-btn"
            title="Close (Esc)"
            @click="closeAddGameModal()"
          >
            <i class="fa fa-times" aria-hidden="true"></i>
          </button>

          <!-- Left Column: Live Card / Artwork Preview -->
          <div class="modal-media-col add-preview-col">
            <div class="preview-badge-header">
              <i class="fa fa-eye" aria-hidden="true"></i>
              <span>Live Card Preview</span>
            </div>

            <div class="add-preview-card">
              <div class="card-cover-wrap preview-cover-wrap">
                <img
                  v-if="newGame.image"
                  :src="newGame.image"
                  :alt="(newGame.title || 'New Game') + ' cover preview'"
                  class="preview-cover-img"
                  :class="{ 'is-contain': isLogoImage(newGame.image) }"
                  @error="previewImageFallback"
                >
                <div v-else class="preview-empty-cover">
                  <div class="empty-cover-icon">
                    <i class="fa fa-gamepad" aria-hidden="true"></i>
                  </div>
                  <span class="empty-cover-hint">Select a cover preset below or paste an image URL</span>
                </div>

                <div class="cover-overlay-tags">
                  <span class="cover-genre-tag">{{ newGame.genre || 'Genre' }}</span>
                  <span class="cover-rating-tag">
                    <i class="fa fa-star" aria-hidden="true"></i>
                    {{ newGame.rating || '5.0' }}
                  </span>
                </div>
              </div>

              <div class="card-info-wrap preview-info-wrap">
                <h3
                  class="card-title preview-card-title"
                  :class="{ 'placeholder-title': !newGame.title }"
                >
                  {{ newGame.title || 'Game Title' }}
                </h3>

                <div class="card-details preview-card-details">
                  <span class="detail-item">
                    <i class="fa fa-gamepad" aria-hidden="true"></i>
                    {{ newGame.platform || 'Platform' }}
                  </span>
                  <span class="detail-item">
                    <i class="fa fa-calendar-o" aria-hidden="true"></i>
                    {{ newGame.releasedate || 'Release Date' }}
                  </span>
                </div>

                <div v-if="newGame.developer" class="preview-dev-badge">
                  <i class="fa fa-code" aria-hidden="true"></i>
                  <span>{{ newGame.developer }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Add Game Form -->
          <div class="modal-info-col add-form-col">
            <div class="modal-info-header">
              <div class="modal-meta-row">
                <span class="modal-tag-genre"><i class="fa fa-plus-circle" aria-hidden="true"></i> New Title</span>
              </div>

              <div class="modal-title-row">
                <div class="modal-title-main">
                  <h2 class="modal-game-title">Add Game to Vault</h2>
                  <p class="add-form-subtitle">Add a title to your database catalog and manage it across your collections.</p>
                </div>
              </div>
            </div>

            <!-- Form Validation Error Alert -->
            <div v-if="addFormError" class="form-error-alert" role="alert">
              <i class="fa fa-exclamation-circle" aria-hidden="true"></i>
              <span>{{ addFormError }}</span>
            </div>

            <form @submit.prevent="submitAddGame()" class="add-game-form">
              <div class="form-grid-2">
                <!-- Title -->
                <div class="form-field-group">
                  <label for="gameTitle" class="form-label">
                    Game Title <span class="req">*</span>
                  </label>
                  <input
                    id="gameTitle"
                    ref="gameTitleInput"
                    type="text"
                    v-model.trim="newGame.title"
                    placeholder="e.g. Black Myth: Wukong"
                    class="form-text-input"
                    required
                  >
                </div>

                <!-- Genre -->
                <div class="form-field-group">
                  <label for="gameGenre" class="form-label">
                    Genre <span class="req">*</span>
                  </label>
                  <input
                    id="gameGenre"
                    type="text"
                    v-model.trim="newGame.genre"
                    list="genreSuggestions"
                    placeholder="e.g. Action RPG, Indie, Open World"
                    class="form-text-input"
                    required
                  >
                  <datalist id="genreSuggestions">
                    <option value="Action RPG"></option>
                    <option value="RPG"></option>
                    <option value="Action"></option>
                    <option value="Indie"></option>
                    <option value="Open World"></option>
                    <option value="Adventure"></option>
                    <option value="Shooter"></option>
                    <option value="Strategy"></option>
                    <option value="Simulation"></option>
                    <option value="Horror"></option>
                    <option value="Fighting"></option>
                    <option value="Platformer"></option>
                  </datalist>
                </div>
              </div>

              <div class="form-grid-3">
                <!-- Platform -->
                <div class="form-field-group">
                  <label for="gamePlatform" class="form-label">
                    Platform <span class="req">*</span>
                  </label>
                  <input
                    id="gamePlatform"
                    type="text"
                    v-model.trim="newGame.platform"
                    list="platformSuggestions"
                    placeholder="e.g. PC / PS5 / Xbox"
                    class="form-text-input"
                    required
                  >
                  <datalist id="platformSuggestions">
                    <option value="PC / PS5 / Xbox"></option>
                    <option value="PC"></option>
                    <option value="PlayStation / PC"></option>
                    <option value="Multiplatform"></option>
                    <option value="Nintendo Switch"></option>
                    <option value="PS5"></option>
                    <option value="Xbox Series X"></option>
                  </datalist>
                </div>

                <!-- Rating -->
                <div class="form-field-group">
                  <label for="gameRating" class="form-label">
                    Rating (0 - 5.0) <span class="req">*</span>
                  </label>
                  <input
                    id="gameRating"
                    type="number"
                    v-model.number="newGame.rating"
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="e.g. 4.8"
                    class="form-text-input"
                    required
                  >
                </div>

                <!-- Release Date -->
                <div class="form-field-group">
                  <label for="gameReleaseDate" class="form-label">
                    Release Date <span class="req">*</span>
                  </label>
                  <input
                    id="gameReleaseDate"
                    type="text"
                    v-model.trim="newGame.releasedate"
                    placeholder="e.g. August 2024"
                    class="form-text-input"
                    required
                  >
                </div>
              </div>

              <!-- Developer -->
              <div class="form-field-group">
                <label for="gameDeveloper" class="form-label">
                  Developer / Studio
                </label>
                <input
                  id="gameDeveloper"
                  type="text"
                  v-model.trim="newGame.developer"
                  placeholder="e.g. Game Science, FromSoftware, Capcom"
                  class="form-text-input"
                >
              </div>

              <!-- Cover Image URL & Presets -->
              <div class="form-field-group">
                <label for="gameImage" class="form-label">
                  Cover Image URL or Project Path
                </label>
                <input
                  id="gameImage"
                  type="text"
                  v-model.trim="newGame.image"
                  placeholder="e.g. https://... or images/bloodline.jpg (Default: images/Logo.png)"
                  class="form-text-input"
                >
                <div class="image-preset-picker">
                  <span class="preset-label">Quick covers:</span>
                  <div class="preset-chips-wrap">
                    <button
                      v-for="preset in imagePresets"
                      :key="preset.label"
                      type="button"
                      class="preset-chip"
                      :class="{ active: newGame.image === preset.url }"
                      @click="selectImagePreset(preset.url)"
                    >
                      {{ preset.label }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <div class="form-field-group">
                <label for="gameDescription" class="form-label">
                  Description / Synopsis
                </label>
                <textarea
                  id="gameDescription"
                  v-model.trim="newGame.description"
                  rows="3"
                  placeholder="A brief overview of the storyline, setting, gameplay mechanics, and world..."
                  class="form-textarea"
                ></textarea>
              </div>

              <!-- Action Buttons -->
              <div class="form-actions-row">
                <button
                  type="button"
                  class="form-btn form-btn-secondary"
                  @click="closeAddGameModal()"
                  :disabled="isSubmittingGame"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="form-btn form-btn-primary"
                  :disabled="isSubmittingGame"
                >
                  <i
                    class="fa"
                    :class="isSubmittingGame ? 'fa-spinner fa-spin' : 'fa-plus-circle'"
                    aria-hidden="true"
                  ></i>
                  <span>{{ isSubmittingGame ? 'Adding Game...' : 'Add Game to Vault' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>
    <!-- Server Connection Modal Dialog -->
    <transition name="modal-fade">
      <div v-if="isServerModalOpen" class="modal-wrapper">
        <div class="modal-backdrop" @click="closeServerModal()" aria-hidden="true"></div>
        <div
          class="modal-server-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="Backend Server Settings"
        >
          <button
            type="button"
            class="modal-close-btn"
            title="Close"
            @click="closeServerModal()"
          >
            <i class="fa fa-times" aria-hidden="true"></i>
          </button>

          <h2 style="margin-top: 0; display: flex; align-items: center; gap: 10px; font-size: 1.25rem;">
            <i class="fa fa-server" style="color: var(--accent-primary)"></i> Backend API Server
          </h2>
          <p style="color: var(--text-secondary); font-size: 13px; line-height: 1.5;">
            Configure the backend API URL. For an Android device or emulator on your Wi-Fi, point to your computer's IP address.
          </p>

          <div class="form-field-group">
            <label class="form-label">API Base URL</label>
            <input
              type="text"
              v-model.trim="serverUrlInput"
              class="form-text-input"
              placeholder="e.g. http://192.168.1.22:3000/api"
            >
          </div>

          <div class="server-preset-chips">
            <span style="font-size: 12px; color: var(--text-muted); width: 100%;">Quick presets:</span>
            <button
              type="button"
              class="server-chip"
              @click="setServerPreset('http://192.168.1.22:3000/api')"
            >
              Wi-Fi Host (192.168.1.22:3000)
            </button>
            <button
              type="button"
              class="server-chip"
              @click="setServerPreset('http://10.0.2.2:3000/api')"
            >
              Android Emulator (10.0.2.2:3000)
            </button>
            <button
              type="button"
              class="server-chip"
              @click="setServerPreset('/api')"
            >
              Web Default (/api)
            </button>
          </div>

          <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px;">
            <button
              type="button"
              class="form-btn form-btn-secondary"
              @click="closeServerModal()"
            >
              Cancel
            </button>
            <button
              type="button"
              class="form-btn form-btn-primary"
              @click="saveServerUrl()"
            >
              Save & Reconnect
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { Capacitor } from "@capacitor/core";

function getInitialApiBase() {
  const stored = window.localStorage.getItem("gamevault_api_url");
  if (stored && stored.trim()) {
    return stored.trim();
  }
  if (Capacitor.isNativePlatform()) {
    return "http://192.168.1.22:3000/api";
  }
  return window.location.port === "3000" || window.location.port === "5173"
    ? "/api"
    : "http://localhost:3000/api";
}

export default {
  name: "App",
  data() {
    return {
      currentView: "games",
      selectedGenre: "All",
      searchQuery: "",
      sortBy: "featured",
      isLightMode: false,
      isLoading: false,
      networkError: null,

      apiBase: getInitialApiBase(),
      isServerModalOpen: false,
      serverUrlInput: "",

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

    serverDisplayHost() {
      try {
        if (!this.apiBase || this.apiBase.startsWith("/")) return "Localhost (/api)";
        const parsed = new URL(this.apiBase);
        return parsed.host;
      } catch {
        return this.apiBase;
      }
    },
  },

  async mounted() {
    // Initialize theme from localStorage
    const savedTheme = window.localStorage.getItem("gamevault-theme");
    if (savedTheme === "light") {
      this.isLightMode = true;
      document.body.classList.add("light-theme");
      if (this.$q && this.$q.dark) {
        this.$q.dark.set(false);
      }
    } else {
      if (this.$q && this.$q.dark) {
        this.$q.dark.set(true);
      }
    }

    // Handle Escape key to close modal
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (this.isServerModalOpen) {
          this.closeServerModal();
        } else if (this.isAddModalOpen) {
          this.closeAddGameModal();
        } else if (this.selectedGame) {
          this.closeGameDetails();
        }
      }
    });

    await this.loadAllData();
  },

  methods: {
    openServerModal() {
      this.serverUrlInput = this.apiBase;
      this.isServerModalOpen = true;
    },

    closeServerModal() {
      this.isServerModalOpen = false;
    },

    setServerPreset(url) {
      this.serverUrlInput = url;
    },

    saveServerUrl() {
      if (!this.serverUrlInput || !this.serverUrlInput.trim()) {
        this.apiBase = getInitialApiBase();
        window.localStorage.removeItem("gamevault_api_url");
      } else {
        this.apiBase = this.serverUrlInput.trim().replace(/\/+$/, "");
        window.localStorage.setItem("gamevault_api_url", this.apiBase);
      }
      this.closeServerModal();
      this.showNotice(`API server set to: ${this.apiBase}`, "info");
      this.loadAllData();
    },

    async loadAllData() {
      this.isLoading = true;
      this.networkError = null;
      try {
        const [gamesRes, backlogRes, favoritesRes] = await Promise.all([
          fetch(`${this.apiBase}/games`),
          fetch(`${this.apiBase}/backlog`),
          fetch(`${this.apiBase}/favorites`),
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
          `Unable to reach backend at "${this.apiBase}". Ensure your server is running or configure the server IP in Settings.`;
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
        if (this.$q && this.$q.dark) this.$q.dark.set(false);
        this.showNotice("Switched to Light Theme", "info");
      } else {
        document.body.classList.remove("light-theme");
        window.localStorage.setItem("gamevault-theme", "dark");
        if (this.$q && this.$q.dark) this.$q.dark.set(true);
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
        const res = await fetch(`${this.apiBase}/backlog`, {
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
        const res = await fetch(`${this.apiBase}/favorites`, {
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
        const res = await fetch(`${this.apiBase}/backlog/${game.id}`, {
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
        const res = await fetch(`${this.apiBase}/favorites/${game.id}`, {
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
        const res = await fetch(`${this.apiBase}/backlog/${game.id}`, {
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

      if (this.$q && this.$q.notify) {
        this.$q.notify({
          message,
          type: type === "success" ? "positive" : "info",
          color: type === "success" ? "positive" : "primary",
          timeout: 2500,
        });
      }

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
        fetch(`${this.apiBase}/games/${game.id}`)
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

        const res = await fetch(`${this.apiBase}/games`, {
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
        const res = await fetch(`${this.apiBase}/games/${game.id}`, {
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
};
</script>
