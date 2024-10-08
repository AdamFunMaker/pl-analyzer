import Database from "@tauri-apps/plugin-sql";

const database = await Database.load("sqlite:pl_analyzer.sqlite");

export default database;