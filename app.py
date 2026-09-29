from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)
DB_NAME = "games.db"

def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            genre TEXT NOT NULL,
            release_year INTEGER NOT NULL,
            platform TEXT NOT NULL,
            rating REAL NOT NULL
        )
    """)
    
    cursor.execute("SELECT COUNT(*) FROM games")
    if cursor.fetchone()[0] == 0:
        seed_data = [
            ("The Legend of Zelda: Breath of the Wild", "Action-Adventure", 2017, "Nintendo Switch", 9.7),
            ("Elden Ring", "Action RPG", 2022, "Multi-platform", 9.6),
            ("The Witcher 3: Wild Hunt", "Action RPG", 2015, "Multi-platform", 9.5),
            ("Red Dead Redemption 2", "Action-Adventure", 2018, "Multi-platform", 9.7),
            ("God of War Ragnarök", "Action-Adventure", 2022, "PlayStation 5", 9.4),
            ("Hollow Knight", "Metroidvania", 2017, "Multi-platform", 9.2),
            ("Cyberpunk 2077", "Action RPG", 2020, "Multi-platform", 8.6),
            ("Minecraft", "Sandbox", 2011, "Multi-platform", 9.0),
            ("Grand Theft Auto V", "Action-Adventure", 2013, "Multi-platform", 9.5),
            ("Portal 2", "Puzzle-Platformer", 2011, "PC", 9.8),
            ("Super Mario Odyssey", "Platformer", 2017, "Nintendo Switch", 9.5),
            ("Persona 5 Royal", "JRPG", 2019, "Multi-platform", 9.5),
            ("Hades", "Rogue-like", 2020, "Multi-platform", 9.3),
            ("Stardew Valley", "Simulation", 2016, "Multi-platform", 9.1),
            ("Baldur's Gate 3", "RPG", 2023, "Multi-platform", 9.6)
        ]
        cursor.executemany("""
            INSERT INTO games (title, genre, release_year, platform, rating)
            VALUES (?, ?, ?, ?, ?)
        """, seed_data)
        conn.commit()
    conn.close()

REQUIRED_FIELDS = ["title", "genre", "release_year", "platform", "rating"]

@app.route("/games", methods=["GET"])
def get_all_games():
    conn = get_db()
    games = conn.execute("SELECT * FROM games").fetchall()
    conn.close()
    return jsonify([dict(g) for g in games]), 200

@app.route("/games/<int:game_id>", methods=["GET"])
def get_game(game_id):
    conn = get_db()
    game = conn.execute("SELECT * FROM games WHERE id = ?", (game_id,)).fetchone()
    conn.close()
    if game is None:
        return jsonify({"error": f"Game with ID {game_id} not found"}), 404
    return jsonify(dict(game)), 200

@app.route("/games", methods=["POST"])
def create_game():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request payload must be valid JSON"}), 400

    for field in REQUIRED_FIELDS:
        if field not in data or data[field] is None:
            return jsonify({"error": f"Missing required field: '{field}'"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO games (title, genre, release_year, platform, rating)
        VALUES (?, ?, ?, ?, ?)
    """, (data["title"], data["genre"], data["release_year"], data["platform"], data["rating"]))
    conn.commit()
    new_id = cursor.lastrowid
    new_game = conn.execute("SELECT * FROM games WHERE id = ?", (new_id,)).fetchone()
    conn.close()
    return jsonify(dict(new_game)), 201

@app.route("/games/<int:game_id>", methods=["PUT"])
def update_game(game_id):
    conn = get_db()
    existing = conn.execute("SELECT * FROM games WHERE id = ?", (game_id,)).fetchone()
    if existing is None:
        conn.close()
        return jsonify({"error": f"Game with ID {game_id} not found"}), 404

    data = request.get_json()
    if not data:
        conn.close()
        return jsonify({"error": "Request payload must be valid JSON"}), 400

    for field in REQUIRED_FIELDS:
        if field not in data or data[field] is None:
            conn.close()
            return jsonify({"error": f"Missing required field: '{field}'"}), 400

    conn.execute("""
        UPDATE games
        SET title = ?, genre = ?, release_year = ?, platform = ?, rating = ?
        WHERE id = ?
    """, (data["title"], data["genre"], data["release_year"], data["platform"], data["rating"], game_id))
    conn.commit()
    updated = conn.execute("SELECT * FROM games WHERE id = ?", (game_id,)).fetchone()
    conn.close()
    return jsonify(dict(updated)), 200

@app.route("/games/<int:game_id>", methods=["DELETE"])
def delete_game(game_id):
    conn = get_db()
    existing = conn.execute("SELECT * FROM games WHERE id = ?", (game_id,)).fetchone()
    if existing is None:
        conn.close()
        return jsonify({"error": f"Game with ID {game_id} not found"}), 404

    conn.execute("DELETE FROM games WHERE id = ?", (game_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": f"Game with ID {game_id} deleted successfully"}), 200

if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)