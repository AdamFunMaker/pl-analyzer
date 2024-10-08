import { utils, writeXLSX } from "xlsx";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";

async function exportXLSX(tableRef, fileName) {
    const exportableColumns = tableRef.value.columns.filter(column => column.props.exportable !== false);
    const headers = exportableColumns.map(column => column.props.header);
    const data = tableRef.value.selection.length ? tableRef.value.selection : tableRef.value.processedData;
    const records = [];

    data.forEach(record => {
        const recordData = {};

        exportableColumns.forEach(column => {
            tableRef.value.exportFunction ? recordData[column.props.header] = tableRef.value.exportFunction({field: column.props.field, data: record[column.props.field]}) : recordData[column.props.header] = record[column.props.field];
        });

        records.push(recordData);
    });

    const workbook = utils.book_new();
    const sheet = utils.aoa_to_sheet([headers]);
    utils.sheet_add_json(sheet, records, {header: headers, skipHeader: true, origin: -1});
    sheet["!cols"] = headers.map(header => {
        return {wch: records.reduce((max, row) => Math.max(max, row[header] ? (row[header] instanceof Date ? 10 : String(row[header]).length) : 0), header.length)}
    });
    utils.book_append_sheet(workbook, sheet);
    const fileData = writeXLSX(workbook, {type: "array", cellDates: true});
    const filePath = await save({
        title: "Export to Excel",
        filters: [
            {
                name: "Excel Spreadsheet",
                extensions: ["xlsx", "xls"]
            }
        ],
        defaultPath: fileName
    });

    if (filePath) {
        writeFile(filePath, fileData);
    }
}

async function exportTableXLSX(table, fileName) {
    const workbook = utils.book_new();
    const sheet = utils.table_to_sheet(table, {cellDates: true});
    const sheetData = utils.sheet_to_json(sheet);
    const columns = sheetData.map(row => Object.keys(row))[1];
    sheet["!cols"] = columns.map(column => {
        if (!column.match(/^_\d/)) {
            return {wch: sheetData.reduce((max, row) => Math.max(max, row[column] ? (row[column] instanceof Date ? 10 : String(row[column]).length) : 0), column.length)}
        }
    });
    utils.book_append_sheet(workbook, sheet);
    const fileData = writeXLSX(workbook, {type: "array", cellDates: true, cellStyles: true});
    const filePath = await save({
        title: "Export to Excel",
        filters: [
            {
                name: "Excel Spreadsheet",
                extensions: ["xlsx", "xls"]
            }
        ],
        defaultPath: fileName
    });

    if (filePath) {
        writeFile(filePath, fileData);
    }
}

export {exportXLSX, exportTableXLSX}