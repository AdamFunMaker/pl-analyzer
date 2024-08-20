import Database from "tauri-plugin-sql-api";

const database = await Database.load("sqlite:pl_analyzer.sqlite");

export default database;