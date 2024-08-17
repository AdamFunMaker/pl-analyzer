import database from "./database.js";
import { parseDate, parseFile, formatSQLString } from "./utils.js";

export class CashFlowService {
    async getCashFlow() {
        try {
            const result = await database.select("SELECT `date`, CAST(strftime('%Y', `date`) AS INTEGER) AS year, CAST(strftime('%m', `date`) AS INTEGER) AS month, salary, expenses, petty_cash FROM cash_flow ORDER BY `date`");
            result.map(cashFlow => cashFlow.date = parseDate(cashFlow.date));
            return {success: true, data: result}
        } catch (err) {
            return {success: false, error: err}
        }
    }

    async addCashFlow(cashFlow) {
        try {
            const sql = formatSQLString("INSERT INTO cash_flow (`date`, salary, expenses, petty_cash) VALUES (?, ?, ?, ?)", [cashFlow.date, cashFlow.salary, cashFlow.expenses, cashFlow.petty_cash]);
            const result = await database.execute(sql);
            return {success: true, data: result}
        } catch (err) {
            return {success: false, error: err}
        }
    }

    async importCashFlow(file, fields, options) {
        try {        
            const newCashFlows = parseFile(file, fields, options).map(cashFlow => [new Date(cashFlow.year, cashFlow.month), cashFlow.salary, cashFlow.expenses, cashFlow.petty_cash]);
            const sql = formatSQLString("INSERT OR ROLLBACK INTO cash_flow (`date`, salary, expenses, petty_cash) VALUES ?", [newCashFlows]);

            await database.execute("BEGIN DEFERRED");

            if (options.overwrite) {
                await database.execute("DELETE FROM cash_flow");
            }

            const result = await database.execute(sql);
            await database.execute("COMMIT");

            return {success: true, data: result}
        } catch (err) {
            return {success: false, error: err}
        }
    }

    async editCashFlow(date, record) {
        try {
            const newValues = {date: record.date, salary: record.salary, expenses: record.expenses, petty_cash: record.petty_cash};
            const sql = formatSQLString("UPDATE cash_flow SET ? WHERE `date` = ?", [newValues, date]);
            const result = await database.execute(sql);
            return {success: true, data: result}
        } catch (err) {
            return {success: false, error: err}
        }
    }

    async deleteCashFlow(dates) {
        try {
            const sql = formatSQLString("DELETE FROM cash_flow WHERE `date` IN (?)", [dates]);
            const result = await database.execute(sql);
            return {success: true, data: result}
        } catch (err) {
            return {success: false, error: err}
        }
    }
}