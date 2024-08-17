import database from "./database.js";
import { formatSQLString, parseDate } from "./utils.js";

export class AnalysisService {
    async getOverviewRange() {
        try {
            const result = await database.select("SELECT MIN(`date`) AS min_date, MAX(`date`) AS max_date FROM cash_flow");
            return {success: true, data: {min_date: parseDate(result[0].min_date).getTime() ? parseDate(result[0].min_date) : null, max_date: parseDate(result[0].max_date).getTime() ? parseDate(result[0].max_date) : null}}
        } catch (err) {
            return {success: false, error: err}
        }
    }

    async getOverview(period) {
        try {
            if (period[0]) {
                const params = period[1] ? period : [period[0].getFullYear(), period[0].getMonth() + 1];
                const result = await database.select(`SELECT * FROM overview WHERE ${period[1] ? "\`date\` BETWEEN $1 AND $2" : "year = $1 AND month = $2"}`, params);
                return {success: true, data: result}
            } else {
                throw new Error("No records found");
            }
        } catch (err) {
            return {success: false, error: err}
        }
    }

    async getOverviewCategories(transaction, period) {
        try {
            if (period[0]) {
                const sql = formatSQLString(`SELECT category, SUM(weight) AS weight, SUM(price) AS price FROM categorical_${transaction} WHERE \`date\` BETWEEN ? AND ? GROUP BY category`, period[1] ? period : [period[0], new Date(period[0].getFullYear(), period[0].getMonth() + 1, 0)]);
                const result = await database.select(sql);
                return {success: true, data: result}
            } else {
                throw new Error("No records found");
            }
        } catch (err) {
            return {success: false, error: err}
        }
    }

    async getYears(transaction) {
        try {
            const result = await database.select(`SELECT * FROM yearly_${transaction}`);
            let nodes = [];

            if (transaction === "purchases") {
                for (let year of result) {
                    nodes.push({
                        key: year.year,
                        data: {
                            year: year.year,
                            month: "-",
                            category: "-",
                            item: "-",
                            weight: year.weight,
                            price: year.price,
                            average_price: year.average_price
                        },
                        children: [],
                        leaf: false
                    });
                }
            } else {
                for (let year of result) {
                    nodes.push({
                        key: year.year,
                        data: {
                            year: year.year,
                            month: "-",
                            category: "-",
                            item: "-",
                            weight: year.weight,
                            price: "-",
                            selling_price: year.price,
                            average_price: year.average_price
                        },
                        children: [],
                        leaf: false
                    });
                }
            }

            return {success: true, data: nodes}
        } catch (err) {
            return {success: false, error: err}
        }
    }

    async getMonths(transaction, year) {
        try {
            const params = [year];
            const result = await database.select(`SELECT * FROM monthly_${transaction} WHERE year = $1`, params);
            let nodes = [];

            if (transaction === "purchases") {
                for (let month of result) {
                    nodes.push({
                        key: [month.year, month.month].join("-"),
                        data: {
                            month: month.month,
                            category: "-",
                            item: "-",
                            weight: month.weight,
                            price: month.price,
                            average_price: month.average_price
                        },
                        children: [],
                        leaf: false
                    });
                }
            } else {
                for (let month of result) {
                    nodes.push({
                        key: [month.year, month.month].join("-"),
                        data: {
                            month: month.month,
                            category: "-",
                            item: "-",
                            weight: month.weight,
                            price: "-",
                            selling_price: month.price,
                            average_price: month.average_price
                        },
                        children: [],
                        leaf: false
                    });
                }
            }

            return {success: true, data: nodes}
        } catch (err) {
            return {success: false, error: err}
        }
    }

    async getCategories(transaction, year, month) {
        try {
            const params = [year, month];
            const result = await database.select(`SELECT year, month, category, weight, price, average_price FROM categorical_${transaction} WHERE year = $1 AND month = $2`, params);
            let nodes = [];

            if (transaction === "purchases") {
                for (let category of result) {
                    nodes.push({
                        key: [category.year, category.month, category.category].join("-"),
                        data: {
                            category: category.category,
                            item: "-",
                            weight: category.weight,
                            price: category.price,
                            average_price: category.average_price
                        },
                        children: [],
                        leaf: false
                    });
                }
            } else {
                for (let category of result) {
                    nodes.push({
                        key: [category.year, category.month, category.category].join("-"),
                        data: {
                            category: category.category,
                            item: "-",
                            weight: category.weight,
                            price: "-",
                            selling_price: category.price,
                            average_price: category.average_price
                        },
                        children: [],
                        leaf: false
                    });
                }
            }

            return {success: true, data: nodes}
        } catch (err) {
            return {success: false, error: err}
        }
    }

    async getCategoriesByPeriod(transaction, period) {
        try {
            if (period[0]) {
                const sql = formatSQLString(`SELECT \`date\`, category, SUM(weight) AS weight, SUM(price) AS price, SUM(price) / SUM(weight) AS average_price FROM categorical_${transaction} WHERE date BETWEEN ? AND ? GROUP BY category`, period[1] ? period : [period[0], new Date(period[0].getFullYear(), period[0].getMonth() + 1, 0)]);
                const result = await database.select(sql);
                return {success: true, data: result}
            } else {
                throw new Error("No records found");
            }
        } catch (err) {
            return {success: false, error: err}
        }
    }

    async getItems(transaction, year, month, category) {
        try {
            const params = [year, month, category];
            const result = await database.select(`SELECT ${transaction === "purchases" ? "year, month, category, item, weight, price, price / weight AS average_price" : "strftime('%Y', date) AS year, CAST(strftime('%m', date) AS INTEGER) AS month, category, item, weight, price, price * weight AS selling_price"} FROM ${transaction} WHERE ${transaction === "purchases" ? "year = $1 AND month = $2" : "CAST(strftime('%Y', date) AS INTEGER) = $1 AND CAST(strftime('%m', date) AS INTEGER) = $2"} AND category = $3`, params);
            let nodes = [];

            if (transaction === "purchases") {
                for (let item of result) {
                    nodes.push({
                        key: [item.year, item.month, item.category, item.item].join("-"),
                        data: {
                            item: item.item,
                            weight: item.weight,
                            price: item.price,
                            average_price: item.average_price
                        },
                        children: [],
                        leaf: true
                    });
                }
            } else {
                for (let item of result) {
                    nodes.push({
                        key: [item.year, item.month, item.category, item.item].join("-"),
                        data: {
                            item: item.item,
                            weight: item.weight,
                            average_price: item.price,
                            selling_price: item.selling_price
                        },
                        children: [],
                        leaf: true
                    });
                }
            }

            return {success: true, data: nodes}
        } catch (err) {
            return {success: false, error: err}
        }
    }

    async getComparisonRange(transaction) {
        try {
            const result = await database.select(`SELECT MIN(date) AS min_date, MAX(date) AS max_date FROM ${transaction}`);
            return {success: true, data: {min_date: parseDate(result[0].min_date).getTime() ? parseDate(result[0].min_date) : null, max_date: parseDate(result[0].max_date).getTime() ? parseDate(result[0].max_date) : null}}
        } catch (err) {
            return {success: false, error: err}
        }
    }

    async getPeriodComparison(transaction, period1, period2) {        
        try {
            if (period1[0] && period2[0]) {
                const categories = await database.select("SELECT name FROM item_categories");
                const sql1 = formatSQLString(`SELECT ${period1[1] ? "date" : "\`year\`, month"}, category, SUM(weight) AS weight, SUM(price) AS price, ${transaction === "purchases" ? "SUM(price) / SUM(weight)" : "SUM(price) / SUM(weight)"} AS average_price FROM categorical_${transaction} WHERE date BETWEEN ? AND ? GROUP BY category`, period1[1] ? period1 : [period1[0], new Date(period1[0].getFullYear(), period1[0].getMonth() + 1, 0)]);
                const sql2 = formatSQLString(`SELECT ${period2[1] ? "date" : "\`year\`, month"}, category, SUM(weight) AS weight, SUM(price) AS price, ${transaction === "purchases" ? "SUM(price) / SUM(weight)" : "SUM(price) / SUM(weight)"} AS average_price FROM categorical_${transaction} WHERE date BETWEEN ? AND ? GROUP BY category`, period2[1] ? period2 : [period2[0], new Date(period2[0].getFullYear(), period2[0].getMonth() + 1, 0)]);
                const result1 = await database.select(sql1);
                const result2 = await database.select(sql2);
                let data = categories.map(category => {return {category: category.name}});
                result1.forEach(category => {
                    data[data.map(record => record.category).indexOf(category.category)].weight1 = category.weight;
                    data[data.map(record => record.category).indexOf(category.category)].price1 = category.price;
                    data[data.map(record => record.category).indexOf(category.category)].average_price1 = category.average_price;
                });
                result2.forEach(category => {
                    data[data.map(record => record.category).indexOf(category.category)].weight2 = category.weight;
                    data[data.map(record => record.category).indexOf(category.category)].price2 = category.price;
                    data[data.map(record => record.category).indexOf(category.category)].average_price2 = category.average_price;
                });
                data.forEach(record => {
                    record.weight1 = record.weight1 || 0;
                    record.price1 = record.price1 || 0;
                    record.average_price1 = record.average_price1 || 0;
                    record.weight2 = record.weight2 || 0;
                    record.price2 = record.price2 || 0;
                    record.average_price2 = record.average_price2 || 0;
                });
                return {success: true, data: data}
            } else {
                throw new Error("No records found");
            }
        } catch (err) {
            return {success: false, error: err}
        }
    }
}