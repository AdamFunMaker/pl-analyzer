// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, Window};
use tauri_plugin_sql::{Builder, Migration, MigrationKind};

#[derive(Clone, serde::Serialize)]
struct Payload {
  args: Vec<String>,
  cwd: String,
}

#[tauri::command]
async fn close_splashscreen(window: Window) {
  if window.get_window("splashscreen").is_some() {
    window.get_window("splashscreen").expect("no window labeled 'splashscreen' found").close().unwrap();
    window.get_window("main").expect("no window labeled 'main' found").show().unwrap();
  }
}

fn main() {
  let migrations = vec![
    Migration {
      version: 1,
      description: "create_tables",
      sql: r"CREATE TABLE IF NOT EXISTS 'cash_flow' ('date' DATETIME PRIMARY KEY NOT NULL, 'salary' REAL NOT NULL, 'expenses' REAL NOT NULL, 'petty_cash' REAL NOT NULL);
        CREATE TABLE IF NOT EXISTS 'item_categories' ('id' INTEGER PRIMARY KEY NOT NULL, 'name' TEXT NOT NULL, 'ferous' BOOLEAN NOT NULL DEFAULT 'false');
        CREATE TABLE IF NOT EXISTS item_purchases(
            id INTEGER PRIMARY KEY NOT NULL,
            description TEXT NOT NULL,
            category INTEGER NOT NULL,
            FOREIGN KEY(category) REFERENCES item_categories(id)
        );
        CREATE TABLE IF NOT EXISTS item_sales(
            id INTEGER PRIMARY KEY NOT NULL,
            description TEXT NOT NULL,
            category INTEGER NOT NULL,
            FOREIGN KEY(category) REFERENCES item_categories(id)
        );
        CREATE TABLE IF NOT EXISTS transaction_purchases(
            `date` DATETIME NOT NULL,
            item INTEGER NOT NULL,
            weight REAL NOT NULL,
            price REAL NOT NULL,
            PRIMARY KEY (`date`, item),
            FOREIGN KEY(item) REFERENCES item_purchases(id)
        );
        CREATE TABLE IF NOT EXISTS transaction_sales(
            `date` DATETIME NOT NULL,
            item INTEGER NOT NULL,
            weight REAL NOT NULL,
            price REAL NOT NULL,
            PRIMARY KEY (`date`, item),
            FOREIGN KEY(item) REFERENCES item_sales(id)
        );",
      kind: MigrationKind::Up
    },
    Migration {
      version: 2,
      description: "create_views",
      sql: r"DROP VIEW IF EXISTS 'sales';
        CREATE VIEW 'sales' AS SELECT transaction_sales.`date` AS `date`, item_sales.category AS `category_id`, item_categories.name AS `category`, transaction_sales.item AS `item_id`, item_sales.description AS `item`, transaction_sales.weight AS `weight`, transaction_sales.price AS `price`, transaction_sales.price* transaction_sales.weight AS `selling_price` FROM ((transaction_sales join item_sales on(transaction_sales.item = item_sales.id)) join item_categories on(item_sales.category = item_categories.id)) ORDER BY transaction_sales.`date` ASC, item_sales.description ASC;
        DROP VIEW IF EXISTS 'purchases';
        CREATE VIEW 'purchases' AS SELECT 'transaction_purchases'.'date' AS `date`, CAST(strftime('%Y', 'transaction_purchases'.'date') AS INTEGER) AS `year`, CAST(strftime('%m', 'transaction_purchases'.'date') AS INTEGER) AS `month`, 'item_purchases'.'category' AS `category_id`, 'item_categories'.'name' AS `category`, 'transaction_purchases'.'item' AS `item_id`, 'item_purchases'.'description' AS `item`, 'transaction_purchases'.'weight' AS `weight`, 'transaction_purchases'.'price' AS `price`, 'transaction_purchases'.'price'/ 'transaction_purchases'.'weight' AS `average_price` FROM (('transaction_purchases' join 'item_purchases' on('transaction_purchases'.'item' = 'item_purchases'.'id')) join 'item_categories' on('item_purchases'.'category' = 'item_categories'.'id')) ORDER BY 'transaction_purchases'.'date' ASC, 'item_purchases'.'description' ASC;
        DROP VIEW IF EXISTS 'categorical_purchases';
        CREATE VIEW 'categorical_purchases' AS SELECT 'purchases'.'date' AS `date`, 'purchases'.'year' AS `year`, 'purchases'.'month' AS `month`, 'purchases'.'category' AS `category`, sum('purchases'.'weight') AS `weight`, sum('purchases'.'price') AS `price`, sum('purchases'.'price') / sum('purchases'.'weight') AS `average_price` FROM 'purchases' GROUP BY 'purchases'.'year', 'purchases'.'month', 'purchases'.'category';
        DROP VIEW IF EXISTS 'yearly_purchases';
        CREATE VIEW 'yearly_purchases' AS SELECT 'purchases'.'year' AS `year`, sum('purchases'.'weight') AS `weight`, sum('purchases'.'price') AS `price`, sum('purchases'.'price') / sum('purchases'.'weight') AS `average_price` FROM 'purchases' GROUP BY 'purchases'.'year';
        DROP VIEW IF EXISTS 'yearly_sales';
        CREATE VIEW 'yearly_sales' AS SELECT CAST(strftime('%Y', 'sales'.'date') AS INTEGER) AS `year`, sum('sales'.'weight') AS `weight`, sum('sales'.'price' * 'sales'.'weight') AS `price`, sum('sales'.'price' * 'sales'.'weight') / 'sales'.'weight' AS `average_price` FROM 'sales' GROUP BY CAST(strftime('%Y', 'sales'.'date') AS INTEGER);
        DROP VIEW IF EXISTS 'monthly_purchases';
        CREATE VIEW 'monthly_purchases' AS SELECT `purchases`.`year` AS `year`, `purchases`.`month` AS `month`, sum(`purchases`.`weight`) AS `weight`, sum(`purchases`.`price`) AS `price`, sum(`purchases`.`price`) / sum(`purchases`.`weight`) AS `average_price` FROM `purchases` GROUP BY `purchases`.`year`, `purchases`.`month`;
        DROP VIEW IF EXISTS 'monthly_sales';
        CREATE VIEW 'monthly_sales' AS SELECT CAST(strftime('%Y', `sales`.`date`) AS INTEGER) AS `year`, CAST(strftime('%m', `sales`.`date`) AS INTEGER) AS `month`, sum(`sales`.`weight`) AS `weight`, sum(`sales`.`price` * `sales`.`weight`) AS `price`, sum(`sales`.`price` * `sales`.`weight`) / sum(`sales`.`weight`) AS `average_price` FROM `sales` GROUP BY CAST(strftime('%Y', `sales`.`date`) AS INTEGER), CAST(strftime('%m', `sales`.`date`) AS INTEGER);
        DROP VIEW IF EXISTS 'categorical_sales';
        CREATE VIEW 'categorical_sales' AS SELECT 'sales'.'date' AS `date`, CAST(strftime('%Y', 'sales'.'date') AS INTEGER) AS `year`, CAST(strftime('%m', 'sales'.'date') AS INTEGER) AS `month`, 'sales'.'category' AS `category`, sum('sales'.'weight') AS `weight`, sum('sales'.'price' * 'sales'.'weight') AS `price`, sum('sales'.'price' * 'sales'.'weight') / sum('sales'.'weight') AS `average_price` FROM 'sales' GROUP BY CAST(strftime('%Y', 'sales'.'date') AS INTEGER), CAST(strftime('%m', 'sales'.'date') AS INTEGER), 'sales'.'category';
        DROP VIEW IF EXISTS 'overview';
        CREATE VIEW 'overview' AS SELECT `cash_flow`.`date` AS `date`, CAST(strftime('%Y', `cash_flow`.`date`) AS INTEGER) AS `year`, CAST(strftime('%m', `cash_flow`.`date`) AS INTEGER) AS `month`, ifnull(`monthly_purchases`.`weight`,0) AS `buy_weight`, ifnull(`monthly_purchases`.`price`,0) AS `buy_price`, ifnull(`monthly_purchases`.`average_price`,0) AS `buy_average_price`, ifnull(`monthly_sales`.`weight`,0) AS `sell_weight`, ifnull(`monthly_sales`.`price`,0) AS `sell_price`, ifnull(`monthly_sales`.`average_price`,0) AS `sell_average_price`, `cash_flow`.`salary` AS `salary`, `cash_flow`.`expenses` AS `expenses`, `cash_flow`.`petty_cash` AS `petty_cash`, ifnull(`monthly_sales`.`price`,0) - ifnull(`monthly_purchases`.`price`,0) - `cash_flow`.`salary` - `cash_flow`.`expenses` - `cash_flow`.`petty_cash` AS `profit_loss` FROM ((`cash_flow` left join `monthly_purchases` on(CAST(strftime('%Y', `cash_flow`.`date`) AS INTEGER) = `monthly_purchases`.`year` and CAST(strftime('%m', `cash_flow`.`date`) AS INTEGER) = `monthly_purchases`.`month`)) left join `monthly_sales` on(CAST(strftime('%Y', `cash_flow`.`date`) AS INTEGER) = `monthly_sales`.`year` and CAST(strftime('%m', `cash_flow`.`date`) AS INTEGER) = `monthly_sales`.`month`)) GROUP BY CAST(strftime('%Y', `cash_flow`.`date`) AS INTEGER), CAST(strftime('%m', `cash_flow`.`date`) AS INTEGER) ORDER BY CAST(strftime('%Y', `cash_flow`.`date`) AS INTEGER) ASC, CAST(strftime('%m', `cash_flow`.`date`) AS INTEGER) ASC;
        DROP VIEW IF EXISTS 'sales_items';
        CREATE VIEW 'sales_items' AS SELECT 'item_sales'.'id' AS `id`, 'item_sales'.'description' AS `description`, 'item_categories'.'id' AS `category_id`, 'item_categories'.'name' AS `category` FROM ('item_sales' join 'item_categories' on('item_sales'.'category' = 'item_categories'.'id')) ORDER BY 'item_sales'.'id' ASC;
        DROP VIEW IF EXISTS 'purchases_items';
        CREATE VIEW 'purchases_items' AS SELECT 'item_purchases'.'id' AS `id`, 'item_purchases'.'description' AS `description`, 'item_categories'.'id' AS `category_id`, 'item_categories'.'name' AS `category` FROM ('item_purchases' join 'item_categories' on('item_purchases'.'category' = 'item_categories'.'id')) ORDER BY 'item_purchases'.'id' ASC;
        DROP VIEW IF EXISTS 'overview_categories';
        CREATE VIEW overview_categories AS SELECT cash_flow.`date`, CAST(strftime('%Y', cash_flow.`date`) AS INTEGER) AS year, CAST(strftime('%m', cash_flow.`date`) AS INTEGER) AS month, transactions.category, ifnull(buy_weight, 0) AS buy_weight, ifnull(buy_price, 0) AS buy_price, ifnull(buy_average_price, 0) AS buy_average_price, ifnull(sell_weight, 0) AS sell_weight, ifnull(sell_price, 0) AS sell_price, ifnull(sell_average_price, 0) AS sell_average_price FROM cash_flow
        LEFT JOIN
        (
            SELECT categorical_purchases.`date`, categorical_purchases.year, categorical_purchases.month, name AS category, categorical_purchases.weight AS buy_weight, categorical_purchases.price AS buy_price, categorical_purchases.average_price AS buy_average_price, categorical_sales.price AS sell_price, categorical_sales.weight AS sell_weight, categorical_sales.average_price AS sell_average_price
            FROM item_categories
            LEFT JOIN categorical_purchases
            ON name = categorical_purchases.category
            FULL JOIN categorical_sales
            ON name = categorical_sales.category AND categorical_purchases.year = categorical_sales.year AND categorical_purchases.month = categorical_sales.month
            GROUP BY categorical_purchases.year, categorical_purchases.month, name
        ) transactions
        ON cash_flow.`date` = transactions.`date`
        WHERE transactions.category IS NOT NULL;",
      kind: MigrationKind::Up
    },
    Migration {
      version: 3,
      description: "update_views",
      sql: r"DROP VIEW IF EXISTS purchases_items;
        CREATE VIEW purchases_items AS SELECT item_purchases.id AS id, description, item_categories.id AS category_id, name AS category FROM item_purchases LEFT JOIN item_categories ON item_purchases.category = item_categories.id ORDER BY id;
        DROP VIEW IF EXISTS sales_items;
        CREATE VIEW sales_items AS SELECT item_sales.id AS id, description, item_categories.id AS category_id, name AS category FROM item_sales LEFT JOIN item_categories ON item_sales.category = item_categories.id ORDER BY id;
        DROP VIEW IF EXISTS purchases;
        CREATE VIEW purchases AS SELECT `date`, CAST(strftime('%Y', `date`) AS INTEGER) AS year, CAST(strftime('%m', `date`) AS INTEGER) AS month, item_categories.id AS category_id, name AS category, item AS item_id, description AS item, weight, price, price / weight AS average_price FROM transaction_purchases LEFT JOIN item_purchases ON item = item_purchases.id LEFT JOIN item_categories ON item_purchases.category = item_categories.id ORDER BY year DESC, month, item_id;
        DROP VIEW IF EXISTS sales;
        CREATE VIEW sales AS SELECT `date`, CAST(strftime('%Y', `date`) AS INTEGER) AS year, CAST(strftime('%m', `date`) AS INTEGER) AS month, item_categories.id AS category_id, name AS category, item AS item_id, description AS item, weight, price, price * weight AS selling_price FROM transaction_sales LEFT JOIN item_sales ON item = item_sales.id LEFT JOIN item_categories ON item_sales.category = item_categories.id ORDER BY year DESC, month, item_id;
        DROP VIEW IF EXISTS yearly_purchases;
        CREATE VIEW yearly_purchases AS SELECT year, sum(weight) AS weight, sum(price) AS price, sum(price) / sum(weight) AS average_price FROM purchases GROUP BY year ORDER BY year DESC;
        DROP VIEW IF EXISTS yearly_sales;
        CREATE VIEW yearly_sales AS SELECT CAST(strftime('%Y', `date`) AS INTEGER) AS year, sum(weight) AS weight, sum(price * weight) AS price, sum(price * weight) / weight AS average_price FROM sales GROUP BY year ORDER BY year DESC;
        DROP VIEW IF EXISTS monthly_purchases;
        CREATE VIEW monthly_purchases AS SELECT year, month, sum(weight) AS weight, sum(price) AS price, sum(price) / sum(weight) AS average_price FROM purchases GROUP BY year, month ORDER BY year DESC, month;
        DROP VIEW IF EXISTS monthly_sales;
        CREATE VIEW monthly_sales AS SELECT CAST(strftime('%Y', `date`) AS INTEGER) AS year, CAST(strftime('%m', `date`) AS INTEGER) AS month, sum(weight) AS weight, sum(price * weight) AS price, sum(price * weight) / sum(weight) AS average_price FROM sales GROUP BY year, month ORDER BY year DESC, month;
        DROP VIEW IF EXISTS categorical_purchases;
        CREATE VIEW categorical_purchases AS SELECT `date`, year, month, name AS category, sum(weight) AS weight, sum(price) AS price, sum(price) / sum(weight) AS average_price FROM item_categories LEFT JOIN purchases ON id = category_id GROUP BY year, month, category ORDER BY year DESC, month, category;
        DROP VIEW IF EXISTS categorical_sales;
        CREATE VIEW categorical_sales AS SELECT `date`, CAST(strftime('%Y', `date`) AS INTEGER) AS year, CAST(strftime('%m', `date`) AS INTEGER) AS month, category, sum(weight) AS weight, sum(price * weight) AS price, sum(price * weight) / sum(weight) AS average_price FROM item_categories LEFT JOIN sales ON id = category_id GROUP BY year, month, category ORDER BY year DESC, month, category;
        DROP VIEW IF EXISTS overview;
        CREATE VIEW overview AS SELECT `date`, CAST(strftime('%Y', `date`) AS INTEGER) AS year, CAST(strftime('%m', `date`) AS INTEGER) AS month, ifnull(monthly_purchases.weight, 0) AS buy_weight, ifnull(monthly_purchases.price, 0) AS buy_price, ifnull(monthly_purchases.average_price, 0) AS buy_average_price, ifnull(monthly_sales.weight, 0) AS sell_weight, ifnull(monthly_sales.price, 0) AS sell_price, ifnull(monthly_sales.average_price, 0) AS sell_average_price, salary, expenses, petty_cash, ifnull(monthly_sales.price, 0) - ifnull(monthly_purchases.price, 0) - salary - expenses - petty_cash AS profit_loss FROM cash_flow LEFT JOIN monthly_purchases ON CAST(strftime('%Y', `date`) AS INTEGER) = monthly_purchases.year AND CAST(strftime('%m', `date`) AS INTEGER) = monthly_purchases.month LEFT JOIN monthly_sales ON CAST(strftime('%Y', `date`) AS INTEGER) = monthly_sales.year AND CAST(strftime('%m', `date`) AS INTEGER) = monthly_sales.month ORDER BY year DESC, month;
        DROP VIEW IF EXISTS overview_categories;
        CREATE VIEW overview_categories AS SELECT cash_flow.`date`, CAST(strftime('%Y', cash_flow.`date`) AS INTEGER) AS year, CAST(strftime('%m', cash_flow.`date`) AS INTEGER) AS month, transactions.category, ifnull(buy_weight, 0) AS buy_weight, ifnull(buy_price, 0) AS buy_price, ifnull(buy_average_price, 0) AS buy_average_price, ifnull(sell_weight, 0) AS sell_weight, ifnull(sell_price, 0) AS sell_price, ifnull(sell_average_price, 0) AS sell_average_price FROM cash_flow
        LEFT JOIN
        (
        SELECT categorical_purchases.`date`, categorical_purchases.year, categorical_purchases.month, name AS category, categorical_purchases.weight AS buy_weight, categorical_purchases.price AS buy_price, categorical_purchases.average_price AS buy_average_price, categorical_sales.price AS sell_price, categorical_sales.weight AS sell_weight, categorical_sales.average_price AS sell_average_price
        FROM item_categories
        LEFT JOIN categorical_purchases
        ON name = categorical_purchases.category
        FULL JOIN categorical_sales
        ON name = categorical_sales.category AND categorical_purchases.year = categorical_sales.year AND categorical_purchases.month = categorical_sales.month
        GROUP BY categorical_purchases.year, categorical_purchases.month, name
        ) transactions
        ON cash_flow.`date` = transactions.`date` WHERE transactions.category IS NOT NULL ORDER BY year DESC, month, category;",
      kind: MigrationKind::Up
    },
    Migration {
      version: 4,
      description: "enhance_overview_views",
      sql: r"DROP VIEW IF EXISTS overview;
        CREATE VIEW overview AS SELECT `date`, CAST(strftime('%Y', `date`) AS INTEGER) AS year, CAST(strftime('%m', `date`) AS INTEGER) AS month, ifnull(monthly_purchases.weight, 0) AS buy_weight, ifnull(monthly_purchases.price, 0) AS buy_price, ifnull(monthly_purchases.average_price, 0) AS buy_average_price, ifnull(monthly_sales.weight, 0) AS sell_weight, ifnull(monthly_sales.price, 0) AS sell_price, ifnull(monthly_sales.average_price, 0) AS sell_average_price, salary, expenses, petty_cash, ifnull(monthly_sales.price, 0) - ifnull(monthly_purchases.price, 0) - salary - expenses - petty_cash AS profit_loss FROM cash_flow FULL JOIN monthly_purchases ON CAST(strftime('%Y', `date`) AS INTEGER) = monthly_purchases.year AND CAST(strftime('%m', `date`) AS INTEGER) = monthly_purchases.month FULL JOIN monthly_sales ON CAST(strftime('%Y', `date`) AS INTEGER) = monthly_sales.year AND CAST(strftime('%m', `date`) AS INTEGER) = monthly_sales.month ORDER BY year DESC, month;
        DROP VIEW IF EXISTS overview_categories;
        CREATE VIEW overview_categories AS SELECT cash_flow.`date`, CAST(strftime('%Y', cash_flow.`date`) AS INTEGER) AS year, CAST(strftime('%m', cash_flow.`date`) AS INTEGER) AS month, name AS category, ifnull(buy_weight, 0) AS buy_weight, ifnull(buy_price, 0) AS buy_price, ifnull(buy_average_price, 0) AS buy_average_price, ifnull(sell_weight, 0) AS sell_weight, ifnull(sell_price, 0) AS sell_price, ifnull(sell_average_price, 0) AS sell_average_price 
        FROM cash_flow FULL JOIN
        (SELECT * FROM item_categories
        LEFT JOIN (SELECT categorical_purchases.year AS buy_year, categorical_purchases.month AS buy_month, categorical_sales.year AS sell_year, categorical_sales.month AS sell_month, categorical_purchases.category AS buy_category, categorical_sales.category AS sell_category, categorical_purchases.weight AS buy_weight, categorical_purchases.price AS buy_price, categorical_purchases.average_price AS buy_average_price, categorical_sales.price AS sell_price, categorical_sales.weight AS sell_weight, categorical_sales.average_price AS sell_average_price 
        FROM categorical_purchases FULL JOIN categorical_sales USING (year, month, category)) ON name = buy_category OR name = sell_category
        GROUP BY buy_year, buy_month, buy_category, sell_category)
        ON (CAST(strftime('%Y', cash_flow.`date`) AS INTEGER) = buy_year AND CAST(strftime('%m', cash_flow.`date`) AS INTEGER) = buy_month) OR (CAST(strftime('%Y', cash_flow.`date`) AS INTEGER) = sell_year AND CAST(strftime('%m', cash_flow.`date`) AS INTEGER) = sell_month)
        GROUP BY year, month, category
        HAVING category IS NOT NULL
        ORDER BY year DESC, month, category;",
      kind: MigrationKind::Up
    },
    Migration {
      version: 5,
      description: "optimize_sales_views",
      sql: r"DROP VIEW IF EXISTS yearly_sales;
        CREATE VIEW yearly_sales AS SELECT year, sum(weight) AS weight, sum(price * weight) AS price, sum(price * weight) / weight AS average_price FROM sales GROUP BY year ORDER BY year DESC;
        DROP VIEW IF EXISTS monthly_sales;
        CREATE VIEW monthly_sales AS SELECT year, month, sum(weight) AS weight, sum(price * weight) AS price, sum(price * weight) / sum(weight) AS average_price FROM sales GROUP BY year, month ORDER BY year DESC, month;
        DROP VIEW IF EXISTS categorical_sales;
        CREATE VIEW categorical_sales AS SELECT `date`, year, month, category, sum(weight) AS weight, sum(price * weight) AS price, sum(price * weight) / sum(weight) AS average_price FROM item_categories LEFT JOIN sales ON id = category_id GROUP BY year, month, category ORDER BY year DESC, month, category;",
      kind: MigrationKind::Up
    }
  ];

  tauri::Builder::default()
    .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
        println!("{}, {argv:?}, {cwd}", app.package_info().name);

        app.emit_all("single-instance", Payload { args: argv, cwd }).unwrap();
    }))
    .plugin(Builder::default().add_migrations("sqlite:pl_analyzer.sqlite", migrations).build())
    .invoke_handler(tauri::generate_handler![close_splashscreen])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}