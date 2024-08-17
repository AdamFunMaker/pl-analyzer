import { utils, writeXLSX } from "xlsx";
import { save } from "@tauri-apps/api/dialog";
import { writeBinaryFile } from "@tauri-apps/api/fs";

async function exportXLSX(table, fileName) {
    const workbook = utils.book_new();
    const sheet = utils.table_to_sheet(table, {cellDates: true});
    const sheetData = utils.sheet_to_json(sheet);
    const columns = sheetData.map(row => Object.keys(row))[0];
    sheet["!cols"] = [
        {}, 
        ...columns.map(column => {
            if (!column.match(/^_/)) {
                return {wch: Object.values(sheetData).reduce((max, row) => Math.max(max, row[column] instanceof Date ? 10 : String(row[column]).length), column.length)}
            }
        })
    ];
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
        writeBinaryFile(filePath, fileData);
    }
}


export {exportXLSX}