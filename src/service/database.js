import Database from "tauri-plugin-sql-api";

const database = await Database.load("sqlite:pl_analyzer.sqlite");
const tables = await database.select("SELECT name FROM sqlite_master WHERE type = 'table'");

if (!tables.length) {
    await database.execute(`
        CREATE TABLE 'cash_flow' ('date' DATE PRIMARY KEY NOT NULL, 'salary' REAL NOT NULL, 'expenses' REAL NOT NULL, 'petty_cash' REAL NOT NULL);
        CREATE TABLE 'item_categories' ('id' INTEGER PRIMARY KEY NOT NULL, 'name' TEXT UNIQUE NOT NULL, 'ferous' BOOLEAN NOT NULL DEFAULT 'false');
        CREATE TABLE item_purchases(
            id INTEGER PRIMARY KEY NOT NULL,
            description TEXT UNIQUE NOT NULL,
            category INTEGER NOT NULL,
            FOREIGN KEY(category) REFERENCES item_categories(id)
        );
        CREATE TABLE item_sales(
            id INTEGER PRIMARY KEY NOT NULL,
            description TEXT UNIQUE NOT NULL,
            category INTEGER NOT NULL,
            FOREIGN KEY(category) REFERENCES item_categories(id)
        );
        CREATE TABLE transaction_purchases(
            \`date\` DATE NOT NULL,
            item INTEGER NOT NULL,
            weight REAL NOT NULL,
            price REAL NOT NULL,
            PRIMARY KEY (\`date\`, item),
            FOREIGN KEY(item) REFERENCES item_purchases(id)
        );
        CREATE TABLE transaction_sales(
            \`date\` DATE NOT NULL,
            item INTEGER NOT NULL,
            weight REAL NOT NULL,
            price REAL NOT NULL,
            PRIMARY KEY (\`date\`, item),
            FOREIGN KEY(item) REFERENCES item_sales(id)
        );
        CREATE VIEW 'sales' AS SELECT transaction_sales.\`date\` AS \`date\`, item_sales.category AS \`category_id\`, item_categories.name AS \`category\`, transaction_sales.item AS \`item_id\`, item_sales.description AS \`item\`, transaction_sales.weight AS \`weight\`, transaction_sales.price AS \`price\`, transaction_sales.price* transaction_sales.weight AS \`selling_price\` FROM ((transaction_sales join item_sales on(transaction_sales.item = item_sales.id)) join item_categories on(item_sales.category = item_categories.id)) ORDER BY transaction_sales.\`date\` ASC, item_sales.description ASC;
        CREATE VIEW 'purchases' AS SELECT "transaction_purchases"."date" AS \`date\`, CAST(strftime("%Y", "transaction_purchases"."date") AS INTEGER) AS \`year\`, CAST(strftime("%m", "transaction_purchases"."date") AS INTEGER) AS \`month\`, "item_purchases"."category" AS \`category_id\`, "item_categories"."name" AS \`category\`, "transaction_purchases"."item" AS \`item_id\`, "item_purchases"."description" AS \`item\`, "transaction_purchases"."weight" AS \`weight\`, "transaction_purchases"."price" AS \`price\`, "transaction_purchases"."price"/ "transaction_purchases"."weight" AS \`average_price\` FROM (("transaction_purchases" join "item_purchases" on("transaction_purchases"."item" = "item_purchases"."id")) join "item_categories" on("item_purchases"."category" = "item_categories"."id")) ORDER BY "transaction_purchases"."date" ASC, "item_purchases"."description" ASC;
        CREATE VIEW 'categorical_purchases' AS SELECT "purchases"."date" AS \`date\`, "purchases"."year" AS \`year\`, "purchases"."month" AS \`month\`, "purchases"."category" AS \`category\`, sum("purchases"."weight") AS \`weight\`, sum("purchases"."price") AS \`price\`, sum("purchases"."price") / sum("purchases"."weight") AS \`average_price\` FROM "purchases" GROUP BY "purchases"."year", "purchases"."month", "purchases"."category";
        CREATE VIEW 'yearly_purchases' AS SELECT "purchases"."year" AS \`year\`, sum("purchases"."weight") AS \`weight\`, sum("purchases"."price") AS \`price\`, sum("purchases"."price") / sum("purchases"."weight") AS \`average_price\` FROM "purchases" GROUP BY "purchases"."year";
        CREATE VIEW 'yearly_sales' AS SELECT CAST(strftime("%Y", "sales"."date") AS INTEGER) AS \`year\`, sum("sales"."weight") AS \`weight\`, sum("sales"."price" * "sales"."weight") AS \`price\`, sum("sales"."price" * "sales"."weight") / "sales"."weight" AS \`average_price\` FROM "sales" GROUP BY CAST(strftime("%Y", "sales"."date") AS INTEGER);
        CREATE VIEW 'monthly_purchases' AS SELECT \`purchases\`.\`year\` AS \`year\`, \`purchases\`.\`month\` AS \`month\`, sum(\`purchases\`.\`weight\`) AS \`weight\`, sum(\`purchases\`.\`price\`) AS \`price\`, sum(\`purchases\`.\`price\`) / sum(\`purchases\`.\`weight\`) AS \`average_price\` FROM \`purchases\` GROUP BY \`purchases\`.\`year\`, \`purchases\`.\`month\`;
        CREATE VIEW 'monthly_sales' AS SELECT CAST(strftime("%Y", \`sales\`.\`date\`) AS INTEGER) AS \`year\`, CAST(strftime("%m", \`sales\`.\`date\`) AS INTEGER) AS \`month\`, sum(\`sales\`.\`weight\`) AS \`weight\`, sum(\`sales\`.\`price\` * \`sales\`.\`weight\`) AS \`price\`, sum(\`sales\`.\`price\` * \`sales\`.\`weight\`) / sum(\`sales\`.\`weight\`) AS \`average_price\` FROM \`sales\` GROUP BY CAST(strftime("%Y", \`sales\`.\`date\`) AS INTEGER), CAST(strftime("%m", \`sales\`.\`date\`) AS INTEGER);
        CREATE VIEW 'categorical_sales' AS SELECT "sales"."date" AS \`date\`, CAST(strftime("%Y", "sales"."date") AS INTEGER) AS \`year\`, CAST(strftime("%m", "sales"."date") AS INTEGER) AS \`month\`, "sales"."category" AS \`category\`, sum("sales"."weight") AS \`weight\`, sum("sales"."price" * "sales"."weight") AS \`price\`, sum("sales"."price" * "sales"."weight") / sum("sales"."weight") AS \`average_price\` FROM "sales" GROUP BY CAST(strftime("%Y", "sales"."date") AS INTEGER), CAST(strftime("%m", "sales"."date") AS INTEGER), "sales"."category";
        CREATE VIEW 'overview' AS SELECT \`cash_flow\`.\`date\` AS \`date\`, CAST(strftime("%Y", \`cash_flow\`.\`date\`) AS INTEGER) AS \`year\`, CAST(strftime("%m", \`cash_flow\`.\`date\`) AS INTEGER) AS \`month\`, ifnull(\`monthly_purchases\`.\`weight\`,0) AS \`buy_weight\`, ifnull(\`monthly_purchases\`.\`price\`,0) AS \`buy_price\`, ifnull(\`monthly_purchases\`.\`average_price\`,0) AS \`buy_average_price\`, ifnull(\`monthly_sales\`.\`weight\`,0) AS \`sell_weight\`, ifnull(\`monthly_sales\`.\`price\`,0) AS \`sell_price\`, ifnull(\`monthly_sales\`.\`average_price\`,0) AS \`sell_average_price\`, \`cash_flow\`.\`salary\` AS \`salary\`, \`cash_flow\`.\`expenses\` AS \`expenses\`, \`cash_flow\`.\`petty_cash\` AS \`petty_cash\`, ifnull(\`monthly_sales\`.\`price\`,0) - ifnull(\`monthly_purchases\`.\`price\`,0) - \`cash_flow\`.\`salary\` - \`cash_flow\`.\`expenses\` - \`cash_flow\`.\`petty_cash\` AS \`profit_loss\` FROM ((\`cash_flow\` left join \`monthly_purchases\` on(CAST(strftime("%Y", \`cash_flow\`.\`date\`) AS INTEGER) = \`monthly_purchases\`.\`year\` and CAST(strftime("%m", \`cash_flow\`.\`date\`) AS INTEGER) = \`monthly_purchases\`.\`month\`)) left join \`monthly_sales\` on(CAST(strftime("%Y", \`cash_flow\`.\`date\`) AS INTEGER) = \`monthly_sales\`.\`year\` and CAST(strftime("%m", \`cash_flow\`.\`date\`) AS INTEGER) = \`monthly_sales\`.\`month\`)) GROUP BY CAST(strftime("%Y", \`cash_flow\`.\`date\`) AS INTEGER), CAST(strftime("%m", \`cash_flow\`.\`date\`) AS INTEGER) ORDER BY CAST(strftime("%Y", \`cash_flow\`.\`date\`) AS INTEGER) ASC, CAST(strftime("%m", \`cash_flow\`.\`date\`) AS INTEGER) ASC;
        CREATE VIEW "sales_items" AS SELECT "item_sales"."id" AS \`id\`, "item_sales"."description" AS \`description\`, "item_categories"."id" AS \`category_id\`, "item_categories"."name" AS \`category\` FROM ("item_sales" join "item_categories" on("item_sales"."category" = "item_categories"."id")) ORDER BY "item_sales"."id" ASC;
        CREATE VIEW "purchases_items" AS SELECT "item_purchases"."id" AS \`id\`, "item_purchases"."description" AS \`description\`, "item_categories"."id" AS \`category_id\`, "item_categories"."name" AS \`category\` FROM ("item_purchases" join "item_categories" on("item_purchases"."category" = "item_categories"."id")) ORDER BY "item_purchases"."id" ASC;
    `);
}

export default database;