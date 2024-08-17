import database from "./database.js";
import { formatSQLString } from "./utils.js";

export class ItemService {
    async getCategories() {
        try {
            const result = await database.select("SELECT * FROM item_categories");
            result.map(category => category.ferous = !!category.ferous);
            return {success: true, data: result}
        } catch (err) {
            return {success: false, error: err}
        }
    }

    async addCategory(category) {
        try {
            const sql = formatSQLString("INSERT INTO item_categories (name, ferous) VALUES (?, ?)", [category.name, category.ferous]);
            const result = await database.execute(sql);
            return {success: true, data: result}
        } catch (err) {
            return {success: false, error: err}
        }
    }

    async editCategory(id, record) {
       try {
        const sql = formatSQLString("UPDATE item_categories SET ? WHERE id = ?", [record, id]);
        const result = await database.execute(sql);
        return {success: true, data: result}
        } catch (err) {
            return {success: false, error: err}
        }
    }

    async deleteCategories(ids) {
        try {
            const sql = formatSQLString("DELETE FROM item_categories WHERE id IN (?)", [ids]);
            const result = await database.execute(sql);
            return {success: true, data: result}
        } catch (err) {
            return {success: false, error: err}
        }
     }

    async getItems(transaction) {
        try {
            const result = await database.select(`SELECT * FROM ${transaction}_items ORDER BY id`);
            return {success: true, data: result}
        } catch (err) {
            return {success: false, error: err}
        }
    }

    async addItem(transaction, item) {
        try {
            const params = [item.description, item.category];
            const result = await database.execute(`INSERT INTO item_${transaction} (description, category) VALUES ($1, $2)`, params);
            return {success: true, data: result}
        } catch (err) {
            return {success: false, error: err}
        }
    }

    async editItem(transaction, id, record) {
        try {
            const sql = formatSQLString(`UPDATE item_${transaction} SET ? WHERE id = ?`, [record, id]);
            const result = await database.execute(sql);
            return {success: true, data: result}
        } catch (err) {
            return {success: false, error: err}
        }
    }

    async deleteItems(transaction, ids) {
        try {
            const sql = formatSQLString(`DELETE FROM item_${transaction} WHERE id IN (?)`, [ids]);
            const result = await database.execute(sql);
            return {success: true, data: result}
        } catch (err) {
            return {success: false, error: err}
        }
    }
}