const { parse } = require("csv-parse/sync");
const { stringify } = require("csv-stringify/sync");

/**
 * Converts a readable stream into a Buffer.
 */
function streamToBuffer(stream) {

    return new Promise((resolve, reject) => {

        const chunks = [];

        stream.on("data", chunk => chunks.push(chunk));

        stream.on("end", () => {

            resolve(Buffer.concat(chunks));

        });

        stream.on("error", reject);

    });

}

/**
 * Detect the delimiter used in the CSV.
 *
 * Supported delimiters:
 *  - Comma (,)
 *  - Semicolon (;)
 *  - Pipe (|)
 *  - Tab (\t)
 *
 * Default delimiter is comma.
 */
function detectDelimiter(headerLine) {

    const delimiters = [",", ";", "|", "\t"];

    let detectedDelimiter = ",";
    let maxOccurrences = 0;

    for (const delimiter of delimiters) {

        const occurrences = headerLine.split(delimiter).length - 1;

        if (occurrences > maxOccurrences) {

            maxOccurrences = occurrences;
            detectedDelimiter = delimiter;

        }

    }

    return detectedDelimiter;

}


//   Merge multiple CSV files into a single CSV.

const mergeCsvFiles = async (files) => {

    // Stores all unique headers across every file.
    const allHeaders = [];

    // Used to avoid duplicate headers.
    const headerSet = new Set();

    // Stores every parsed row.
    const mergedRows = [];

    for (const file of files) {

        if (!file.ErrorDetailsFile)
            continue;

        // Convert HANA stream into Buffer.
        const buffer = await streamToBuffer(file.ErrorDetailsFile);

        const csv = buffer.toString("utf8");

        // Ignore completely empty files.
        if (!csv.trim())
            continue;

        // Read first line to detect delimiter.
        const firstLine = csv.split(/\r?\n/, 1)[0];

        const delimiter = detectDelimiter(firstLine);

        /**
         * Parse CSV.
         *
         * columns:true
         *      Converts each row into an object.
         *
         * skip_empty_lines
         *      Ignores blank rows.
         *
         * trim
         *      Removes surrounding spaces.
         *
         * relax_column_count
         *      Allows rows having fewer/more columns.
         *
         * delimiter
         *      Auto detected delimiter.
         */
        const records = parse(csv, {

            columns: true,
            skip_empty_lines: true,
            trim: true,
            relax_column_count: true,
            delimiter

        });

        // Read all headers from current file.
        const headers = Object.keys(records[0] || {});

        // Build master header list.
        headers.forEach(header => {

            if (!headerSet.has(header)) {

                headerSet.add(header);
                allHeaders.push(header);

            }

        });

        // Add every record to merged collection.
        mergedRows.push(...records);

    }

    /**
     * Convert merged object array back to CSV.
     *
     * csv-stringify automatically:
     *  - Quotes fields containing commas
     *  - Escapes quotes
     *  - Produces valid CSV
     */
    const mergedCsv = stringify(mergedRows, {

        header: true,

        columns: allHeaders,

        // Standard output delimiter.
        delimiter: ","

    });

    return Buffer.from(mergedCsv, "utf8");

};


// old working 
// function streamToBuffer(stream) {

//     return new Promise((resolve, reject) => {

//         const chunks = [];

//         stream.on("data", chunk => chunks.push(chunk));

//         stream.on("end", () => {

//             resolve(Buffer.concat(chunks));

//         });

//         stream.on("error", reject);

//     });

// }
// const mergeCsvFiles = async (files) => {

//     const allHeaders = [];
//     const headerSet = new Set();

//     const mergedRows = [];

//     for (const file of files) {

//         if (!file.ErrorDetailsFile)
//             continue;

//         const buffer = await streamToBuffer(file.ErrorDetailsFile);

//         const csv = buffer.toString("utf8");

//         const lines = csv
//             .split(/\r?\n/)
//             .filter(x => x.trim() !== "");

//         if (lines.length === 0)
//             continue;

//         const headers = lines[0]
//             .split(",")
//             .map(h => h.trim());

//         headers.forEach(h => {

//             if (!headerSet.has(h)) {

//                 headerSet.add(h);

//                 allHeaders.push(h);

//             }

//         });

//         for (let i = 1; i < lines.length; i++) {

//             const values = lines[i].split(",");

//             const row = {};

//             headers.forEach((header, index) => {

//                 row[header] = values[index] ?? "";

//             });

//             mergedRows.push(row);

//         }

//     }

//     const csvLines = [];

//     csvLines.push(allHeaders.join(","));

//     for (const row of mergedRows) {

//         const values = [];

//         for (const header of allHeaders) {

//             values.push(row[header] ?? "");

//         }

//         csvLines.push(values.join(","));

//     }

//     return Buffer.from(csvLines.join("\n"), "utf8");

// }

// old

// function getCsvText(value) {
//     if (!value) return "";

//     if (Buffer.isBuffer(value)) return value.toString("utf8");
//     if (typeof value === "string") return value;

//     if (Array.isArray(value)) return Buffer.from(value).toString("utf8");

//     if (value?.data && Array.isArray(value.data)) {
//         return Buffer.from(value.data).toString("utf8");
//     }

//     if (value?.value?.data && Array.isArray(value.value.data)) {
//         return Buffer.from(value.value.data).toString("utf8");
//     }

//     return String(value);
// }

// function parseCsvLine(line) {
//     const result = [];
//     let current = "";
//     let inQuotes = false;

//     for (let i = 0; i < line.length; i++) {
//         const ch = line[i];

//         if (ch === '"') {
//             if (inQuotes && line[i + 1] === '"') {
//                 current += '"';
//                 i++;
//             } else {
//                 inQuotes = !inQuotes;
//             }
//         } else if (ch === "," && !inQuotes) {
//             result.push(current);
//             current = "";
//         } else {
//             current += ch;
//         }
//     }

//     result.push(current);
//     return result.map(v => v.trim());
// }

// function escapeCsvValue(value) {
//     const s = value == null ? "" : String(value);
//     if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
//     return s;
// }

// const mergeCsvFiles = async (files) => {
//     const allHeaders = [];
//     const headerSet = new Set();
//     const mergedRows = [];

//     for (const file of files) {
//         const csv = getCsvText(file.ErrorDetailsFile);
//         if (!csv.trim()) continue;

//         const lines = csv.split(/\r?\n/).filter(x => x.trim() !== "");
//         if (!lines.length) continue;

//         const headers = parseCsvLine(lines[0]);

//         for (const h of headers) {
//             if (!headerSet.has(h)) {
//                 headerSet.add(h);
//                 allHeaders.push(h);
//             }
//         }

//         for (let i = 1; i < lines.length; i++) {
//             const values = parseCsvLine(lines[i]);
//             const row = {};
//             headers.forEach((header, index) => {
//                 row[header] = values[index] ?? "";
//             });
//             mergedRows.push(row);
//         }
//     }

//     const csvLines = [];
//     csvLines.push(allHeaders.map(escapeCsvValue).join(","));

//     for (const row of mergedRows) {
//         const values = allHeaders.map(header => escapeCsvValue(row[header] ?? ""));
//         csvLines.push(values.join(","));
//     }

//     return Buffer.from(csvLines.join("\r\n"), "utf8");
// };


module.exports = {
    mergeCsvFiles
}
