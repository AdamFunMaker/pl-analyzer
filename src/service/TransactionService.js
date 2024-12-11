import database from "./database.js";
import { formatSQLString, parseDate, parseFile } from "./utils.js";
import { toTitleCase } from "@/utils/text.js";

export class TransactionService {
    async getTransactions(transaction) {
        try {
            const result = await database.select(`SELECT * FROM ${transaction}`);
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
                    return {name: newCategory, ferous: false}
                }
            }).filter((record, index, records) => index === records.findIndex(category => category.name === record.name)).filter(record => !categories.filter(category => category.name.localeCompare(record.name, "en", {sensitivity: "accent"}) === 0).length).map(record => [record.name, record.ferous]).sort();
            const sqlNewCategories = formatSQLString("INSERT INTO item_categories (name, ferous) VALUES ?", [newCategories]);

            if (newCategories.length) {
                await database.execute(sqlNewCategories);
                categories = await database.select("SELECT id, name FROM item_categories");
            }

            let items = await database.select(`SELECT id, description FROM ${transaction}_items`);
            const newItems = fileData.map(record => {
                record.category = record.category.trim().localeCompare("Aluminimium", "en", {sensitivity: "accent"}) === 0 ? "Aluminium" : record.category.trim();
                const newItemCategory = categories.filter(category => category.name.localeCompare(record.category, "en", {sensitivity: "accent"}) === 0);

                if (newItemCategory[0]) {
                    return {description: record.item.trim(), category: newItemCategory[0].id}
                }
            }).filter((record, index, records) => index === records.findIndex(item => item.description === record.description)).filter(record => !items.filter(item => item.description.localeCompare(record.description, "en", {sensitivity: "accent"}) === 0).length).map(record => [record.description, record.category]);
            const sqlNewItems = formatSQLString(`INSERT INTO item_${transaction} (description, category) VALUES ?`, [newItems]);            

            if (newItems.length) {
                await database.execute(sqlNewItems);
                items = await database.select(`SELECT id, description FROM ${transaction}_items`);
            }

            const table = `transaction_${transaction}`;

            if (options.overwrite) {
                await database.execute(`DELETE FROM ${table}`);
            }
            
            const newTransactions = fileData.map(record => {
                const newTransactionItem = items.filter(item => item.description.localeCompare(record.item, "en", {sensitivity: "accent"}) === 0);

                if (newTransactionItem[0] && record.weight && record.price) {
                    return [transaction === "purchases" ? new Date(record.year, record.month) : record.date, newTransactionItem[0].id, record.weight, record.price]
                }
            }).filter(record => record);
            const sqlNewTransactions = formatSQLString(`INSERT INTO ${table} (\`date\`, item, weight, price) VALUES ?`, [newTransactions]);
            const result = await database.execute(sqlNewTransactions);
            return {success: true, data: result}
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
            const sql = formatSQLString(`DELETE FROM transaction_${transaction} WHERE (\`date\`, item) IN (?)`, [keys.map(key => [key.date, key.item])]);
            const result = await database.execute(sql);
            return {success: true, data: result}
        } catch (err) {
            return {success: false, error: err}
        }
    }
}