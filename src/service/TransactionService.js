import database from "./database.js";
import { formatSQLString, parseDate, parseFile } from "./utils.js";
import { toTitleCase } from "@/utils/text.js";

export class TransactionService {
    async getTransactions(transaction) {
        try {
            const result = await database.select(`SELECT * FROM ${transaction} ORDER BY \`date\` DESC, item ASC`);
            result.map(transaction => transaction.date = parseDate(transaction.date));
            return {success: true, data: result}
        } catch (err) {
            return {success: false, error: err}
        }
    }

    async addTransaction(transaction, record) {
        try {
            const sql = formatSQLString(`INSERT INTO transaction_${transaction} (\`date\`, item, weight, price) VALUES (?, ?, ?, ?)`, [record.date, record.item, record.weight, record.price]);
            const result = await database.execute(sql);
            return {success: true, data: result}
        } catch (err) {
            return {success: false, error: err}
        }
    }

    async importTransactions(transaction, file, fields, options) {
        try {
            const fileData = parseFile(file, fields, options).filter(record => ((record.year && record.month != -1) || record.date) && record.item && record.category);
            let categories = await database.select("SELECT id, name FROM item_categories");
            const newCategories = fileData.map(record => {
                const newCategory = record.category.trim().localeCompare("Aluminimium", "en", {sensitivity: "accent"}) === 0 ? "Aluminium" : toTitleCase(record.category.trim());

                if (newCategory) {
                    return {name: newCategory}
                }
            }).filter((record, index, records) => index === records.findIndex(category => category.name === record.name)).filter(record => !categories.map(category => category.name).includes(record.name)).map(record => [record.name]);
            const sqlNewCategories = formatSQLString("INSERT INTO item_categories (name) VALUES ?", [newCategories]);

            if (newCategories.length) {
                await database.execute(sqlNewCategories);
            }

            categories = await database.select("SELECT id, name FROM item_categories");
            let items = await database.select(`SELECT id, description FROM ${transaction}_items`);
            const newItems = fileData.map(record => {
                record.category = record.category.trim().localeCompare("Aluminimium", "en", {sensitivity: "accent"}) === 0 ? "Aluminium" : record.category.trim();
                const newItemCategory = categories.filter(category => category.name.localeCompare(record.category, "en", {sensitivity: "accent"}) === 0);

                if (newItemCategory[0]) {
                    return {description: record.item.trim(), category: newItemCategory[0].id}
                }
            }).filter((record, index, records) => index === records.findIndex(item => item.description === record.description)).filter(record => !items.map(item => item.description).includes(record.description)).map(record => [record.description, record.category]);
            const sqlNewItems = formatSQLString(`INSERT INTO item_${transaction} (description, category) VALUES ?`, [newItems]);            

            if (newItems.length) {
                await database.execute(sqlNewItems);
            }

            items = await database.select(`SELECT id, description FROM ${transaction}_items`);
            await database.execute("BEGIN");

            try {
                if (options.overwrite) {
                    await database.execute(`DELETE FROM transaction_${transaction}`);
                }
                
                const newTransactions = fileData.map(record => {
                    const newTransactionItem = items.filter(item => item.description.localeCompare(record.item, "en", {sensitivity: "accent"}) === 0);

                    if (newTransactionItem[0] && record.weight && record.price) {
                        return [transaction === "purchases" ? new Date(record.year, record.month) : record.date, newTransactionItem[0].id, record.weight, record.price];
                    }
                }).filter(record => record);
                const sqlNewTransactions = formatSQLString(`INSERT OR ROLLBACK INTO transaction_${transaction} (\`date\`, item, weight, price) VALUES ?`, [newTransactions]);
                const result = await database.execute(sqlNewTransactions);
                await database.execute("COMMIT");

                return {success: true, data: result}
            } catch (err) {
                await database.execute("ROLLBACK");
                throw new Error(err);
            }
        } catch (err) {
            return {success: false, error: err}
        }
    }

    async editTransaction(transaction, key, record) {
       try {
        const values = {date: record.date, item: record.item_id, weight: record.weight, price: record.price};
        const sql = formatSQLString(`UPDATE transaction_${transaction} SET ? WHERE ?`, [values, key]);
        const result = await database.execute(sql);
        return {success: true, data: result}
        } catch (err) {
            return {success: false, error: err}
        }
    }

    async deleteTransactions(transaction, keys) {
        try {
            keys.map(key => [key.date, key.item]);
            const sql = formatSQLString(`DELETE FROM transaction_${transaction} WHERE (\`date\`, item) IN (?)`, [keys]);
            const result = await database.execute(sql);
            return {success: true, data: result}
        } catch (err) {
            return {success: false, error: err}
        }
    }
}