<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Game Journal - Setup Guide</title>
</head>
<body>
  <h1>Game Journal - Setup & Run Guide</h1>

  <p>
    Game Journal is a full-stack web app for PC gamers to track games and notes.
    This document explains how to set it up from scratch after cloning the repo.
  </p>

  <h2>1. Prerequisites</h2>
  <ul>
    <li><strong>Node.js</strong> 20.x or later (LTS recommended)</li>
    <li><strong>npm</strong> (comes with Node)</li>
    <li><strong>PostgreSQL database</strong> (Neon connection string)</li>
    <li><strong>Steam Web API key</strong> (or at least access to Steam endpoints)</li>
  </ul>

  <p>
    This assumes you have pulled the project code but <strong>no</strong> <code>node_modules</code> folders and
    <strong>no</strong> <code>.env</code> file.
  </p>

  <h2>2. Project Structure</h2>
  <p>From the repo root (for example):</p>
  <pre>
csc372-Final-Project-MVP/
  game-journal/
    package.json          &lt;-- root scripts (backend + client)
    .env                  &lt;-- to be created (backend env vars)
    server/
      index.js            &lt;-- Express entry point
      db.js               &lt;-- Postgres/Neon connection
      auth.js             &lt;-- auth utilities (JWT, hashing)
      steam.js            &lt;-- Steam API helpers
      routes/
        authRoutes.js
        gameRoutes.js
        noteRoutes.js
    client/
      package.json        &lt;-- Vite/React app
      vite.config.*       &lt;-- Vite config & dev proxy
      src/...
  </pre>

  <h2>3. Install Dependencies</h2>

  <h3>3.1. Backend & Root Scripts</h3>
  <ol>
    <li>Open a terminal in the <code>game-journal</code> folder:
      <pre>cd path/to/csc372-Final-Project-MVP/game-journal</pre>
    </li>
    <li>Install root dependencies (Express, pg, nodemon, etc.):
      <pre>npm install</pre>
    </li>
  </ol>

  <h3>3.2. Frontend (Vite + React)</h3>
  <ol>
    <li>From the same <code>game-journal</code> folder, go into <code>client</code>:
      <pre>cd client</pre>
    </li>
    <li>Install client dependencies:
      <pre>npm install</pre>
    </li>
    <li>Go back to <code>game-journal</code>:
      <pre>cd ..</pre>
    </li>
  </ol>

  <h2>4. Environment Variables (.env)</h2>

  <p>
    In <code>game-journal/</code>, create a file named <code>.env</code>. This file is not committed to git and
    must be created manually.
  </p>

  <p>Example <code>.env</code> contents (fill in with your own values):</p>

  <pre>
PORT=5001
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?sslmode=require
JWT_SECRET=some_super_secret_string
STEAM_API_KEY=your_steam_api_key_here
CLIENT_ORIGIN=http://localhost:5173
  </pre>

  <ul>
    <li><strong>PORT</strong>: Port for the Express server (e.g., 5001).</li>
    <li><strong>DATABASE_URL</strong>: Neon/PostgreSQL connection string.</li>
    <li><strong>JWT_SECRET</strong>: Any long random string for signing JWTs.</li>
    <li><strong>STEAM_API_KEY</strong>: Key from Steam Web API.</li>
    <li><strong>CLIENT_ORIGIN</strong>: Vite dev server URL.</li>
  </ul>

  <h2>5. Database Setup</h2>

  <p>Create the necessary tables in your Neon/Postgres database (for example via Neon’s SQL editor):</p>

  <pre>
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE game_packets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  steam_app_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  game_packet_id INTEGER REFERENCES game_packets(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  file_path TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
  </pre>

  <h2>6. Dev Server: Backend (Express)</h2>

  <ol>
    <li>Open a terminal in <code>game-journal</code>:
      <pre>cd path/to/csc372-Final-Project-MVP/game-journal</pre>
    </li>
    <li>Start the backend dev server with nodemon:
      <pre>npm run dev:server</pre>
    </li>
  </ol>

  <p>If everything is configured correctly, you should see something like:</p>
  <pre>
&gt; game-journal@1.0.0 dev:server
&gt; nodemon server/index.js

[nodemon] starting `node server/index.js`
Server running on http://localhost:5001
  </pre>

  <p>
    You can test the API (if the health route is defined) by visiting:
    <code>http://localhost:5001/api/health</code> in a browser or using a tool like curl/Postman.
  </p>

  <h2>7. Dev Server: Frontend (Vite + React)</h2>

  <p>The frontend is in the <code>client</code> folder and uses Vite’s dev server.</p>

  <ol>
    <li>Open a second terminal (keep the backend running).</li>
    <li>From <code>game-journal</code>, start the dev client:
      <pre>cd path/to/csc372-Final-Project-MVP/game-journal
npm run dev:client</pre>
    </li>
  </ol>

  <p>You should see output similar to:</p>

  <pre>
&gt; game-journal@1.0.0 dev:client
&gt; cd client &amp;&amp; npm run dev

&gt; client@0.0.0 dev
&gt; vite

  VITE v5.x.x  ready in Xs

  ➜  Local:   http://localhost:5173/
  </pre>

  <p>Open <code>http://localhost:5173</code> in your browser to view the React app.</p>

  <h3>7.1 Vite Proxy to Backend</h3>

  <p>
    The Vite dev server is configured (in <code>client/vite.config.*</code>) to proxy API calls to the backend.
    In development, calls like:
  </p>

  <pre>
fetch("/api/health")
  </pre>

  <p>will be forwarded to <code>http://localhost:5001/api/health</code>.</p>

  <h2>8. Production Build & Single Server</h2>

  <p>
    In production, Express can serve both the API and the built React frontend.
  </p>

  <ol>
    <li>Build the React app:
      <pre>cd path/to/csc372-Final-Project-MVP/game-journal
npm run build</pre>
    </li>
    <li>Start the server in "production" mode:
      <pre>npm start</pre>
    </li>
  </ol>

  <p>
    This runs Express with <code>NODE_ENV=production</code> and serves static files from
    <code>client/dist</code> while still exposing the <code>/api</code> routes.
  </p>

  <h2>9. Quick Summary of Commands</h2>

  <h3>Initial setup (after cloning, no node_modules or .env):</h3>
  <pre>
cd game-journal
npm install          # install backend + root deps

cd client
npm install          # install React/Vite deps
cd ..

# create game-journal/.env with DB, JWT, STEAM_API_KEY, etc.
# ensure DB tables are created in Neon
  </pre>

  <h3>Run in development:</h3>
  <pre>
# Terminal 1 (backend)
cd game-journal
npm run dev:server   # runs Express on http://localhost:5001

# Terminal 2 (frontend)
cd game-journal
npm run dev:client   # runs Vite on http://localhost:5173
  </pre>

  <h3>Build and run in "production" mode:</h3>
  <pre>
cd game-journal
npm run build        # builds React into client/dist
npm start            # Express serves API + built frontend
  </pre>

  <hr />

  <p>
    After following these steps, you should have:
  </p>
  <ul>
    <li>Backend API running on <code>http://localhost:5001</code></li>
    <li>React frontend running on <code>http://localhost:5173</code> (dev)</li>
    <li>Or a single production server via <code>npm start</code></li>
  </ul>
</body>
</html>
