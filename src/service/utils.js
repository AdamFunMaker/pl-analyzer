import { utils, read } from "xlsx";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ID_GLOBAL_REGEXP    = /`/g;
const QUAL_GLOBAL_REGEXP  = /\./g;
const CHARS_GLOBAL_REGEXP = /[\0\b\t\n\r\x1a\"\'\\]/g;
const CHARS_ESCAPE_MAP    = {
  '\0'   : '\\0',
  '\b'   : '\\b',
  '\t'   : '\\t',
  '\n'   : '\\n',
  '\r'   : '\\r',
  '\x1a' : '\\Z',
  '"'    : '\\"',
  '\''   : '\\\'',
  '\\'   : '\\\\'
};

function formatSQLString(sql, values, stringifyObjects) {
    if (values == null) {
        return sql;
    }

    if (!Array.isArray(values)) {
        values = [values];
    }

    let chunkIndex = 0;
    let placeholdersRegex = /\?+/g;
    let result = "";
    let valuesIndex = 0;
    let match;

    while (valuesIndex < values.length && (match = placeholdersRegex.exec(sql))) {
        let len = match[0].length;

        if (len > 2) {
            continue;
        }

        let value = len === 2 ? escapeId(values[valuesIndex]) : escapeValue(values[valuesIndex], stringifyObjects);

        result += sql.slice(chunkIndex, match.index) + value;
        chunkIndex = placeholdersRegex.lastIndex;
        valuesIndex++;
    }

    if (chunkIndex === 0) {
        return sql;
    }

    if (chunkIndex < sql.length) {
        return result + sql.slice(chunkIndex);
    }

    return result;
}

function escapeValue(value, stringifyObjects) {
    if (value === undefined || value === null) {
        return "NULL";
    }
    
    switch (typeof value) {
        case "boolean": 
            return (value) ? 1 : 0;
        case "number": 
            return value + "";
        case "object":
            if (value instanceof Date) {
                return parseDate(value);
            } else if (Array.isArray(value)) {
                return parseArray(value);
            } else if (typeof value.toSqlString === "function") {
                return String(value.toSqlString());
            } else if (stringifyObjects) {
                return escapeString(value.toString());
            } else {
                return parseObject(value);
            }
        default: 
            return escapeString(value);
    }
}

function parseDate(date) {
    if (date instanceof Date) {
        if (isNaN(date.getTime())) {
            return "NULL";
        }

        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let string = zeroPad(year, 4) + "-" + zeroPad(month, 2) + "-" + zeroPad(day, 2);

        return escapeString(string);
    } else {
        return new Date(date);
    }
}

function parseArray(array) {
    let sql = "";

    for (let i = 0; i < array.length; i++) {
        let value = array[i];

        if (Array.isArray(value)) {
            sql += (i === 0 ? "" : ", ") + "(" + parseArray(value) + ")";
        } else {
            sql += (i === 0 ? "" : ", ") + escapeValue(value, true);
        }
    }

    return sql;
}

function parseObject(object) {
    let sql = "";

    for (let key in object) {
        let value = object[key];

        if (typeof value === "function") {
            continue;
        }

        sql += (sql.length === 0 ? "" : ", ") + escapeId(key) + " = " + escapeValue(value, true);
    }

    return sql;
}

function parseFile(file, fields, options) {
    const workbook = read(file.data, {sheets: options.worksheet, cellDates: true});
    const sheet = utils.sheet_to_json(workbook.Sheets[options.worksheet]);
    let newRecords = [];

    sheet.forEach(record => {
        let data = {};

        fields.forEach(field => {
            switch (field.type) {
                case "date":
                    data[field.name] = record[field.mapping];
                    break;
                case "month":
                    data[field.name] = typeof(record[field.mapping]) === "string" ? MONTHS.findIndex(month => month === record[field.mapping].trim()) : -1;
                    break;
                case "numeric":
                    data[field.name] = record[field.mapping] || 0;
                    break;
                case "string":
                    data[field.name] = typeof(record[field.mapping]) === "string" ? record[field.mapping].trim() : "";
                    break;
                default:
                    data[field.name] = record[field.mapping] || null;
            }
        });

        if (!Object.values(data).some(field => field === null || field === "")) {
            newRecords.push(data);
        }
    });
    
    return newRecords    
}

function escapeString(value) {
    let chunkIndex = CHARS_GLOBAL_REGEXP.lastIndex = 0;
    let escapedValue = "";
    let match;
  
    while ((match = CHARS_GLOBAL_REGEXP.exec(value))) {
      escapedValue += value.slice(chunkIndex, match.index) + CHARS_ESCAPE_MAP[match[0]];
      chunkIndex = CHARS_GLOBAL_REGEXP.lastIndex;
    }
  
    if (chunkIndex === 0) {
      return "'" + value + "'";
    }
  
    if (chunkIndex < value.length) {
      return "'" + escapedValue + value.slice(chunkIndex) + "'";
    }
  
    return "'" + escapedValue + "'";
}

function zeroPad(number, length) {
    number = number.toString();

    while (number.length < length) {
        number = "0" + number;
    }

    return number;
}

function escapeId(value, forbidQualified) {
    if (Array.isArray(value)) {
        let sql = "";
    
        for (let i = 0; i < value.length; i++) {
          sql += (i === 0 ? "" : ", ") + escapeId(value[i], forbidQualified);
        }
    
        return sql;
    } else if (forbidQualified) {
        return "`" + String(value).replace(ID_GLOBAL_REGEXP, "``") + "`";
    } else {
        return "`" + String(value).replace(ID_GLOBAL_REGEXP, "``").replace(QUAL_GLOBAL_REGEXP, "`.`") + "`";
    }
}

export {formatSQLString, parseDate, parseFile}