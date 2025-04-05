import xlsx from 'xlsx';
import sql from 'mssql';

// Database config
const dbConfig: sql.config = {
    user: "yasuu_SQLLogin_1",
    password: "Batatabanana00",
    server: "pfetest.mssql.somee.com",
    database: "pfetest",
    options: {
        encrypt: false,
        trustServerCertificate: true,
    }
};

// Read Excel file function
const readExcelFile = (filePath: string) => {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[2]; // Adjust the sheet index if needed
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const data = rawData.map((row: any) => ({
        designation: String(row["DESI_TYPE"]).trim(),   // Convert to string and remove spaces
        desi_marque: String(row["DESI_MARQ"]).trim(),   // Convert to string and remove spaces
    }));

    return data;
};

// Function to get marque ID from DESI_MARQ
const getMarqueId = async (designation: string): Promise<number | null> => {
    try {
        let pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('designation', sql.VarChar, designation)
            .query('SELECT id_marque FROM marque WHERE designation = @designation');

        return result.recordset.length > 0 ? result.recordset[0].id_marque : null;
    } catch (error) {
        console.error(`Error fetching id_marque for ${designation}:`, error);
        return null;
    }
};

// Insert data into type table
const insertDataToDB = async (data: { designation: string; desi_marque: string }[]) => {
    try {
        let pool = await sql.connect(dbConfig);

        for (let row of data) {
            const id_marque = await getMarqueId(row.desi_marque);
            
            if (id_marque !== null) {
                await pool.request()
                    .input('designation', sql.VarChar, row.designation)
                    .input('id_marque', sql.Int, id_marque)
                    .query('INSERT INTO type (designation, id_marque) VALUES (@designation, @id_marque)');
                console.log(`Inserted: ${row.designation} with id_marque: ${id_marque}`);
            } else {
                console.warn(`⚠️ Marque not found for: ${row.desi_marque}, skipping insert.`);
            }
        }

        console.log('✅ Data inserted successfully!');
    } catch (error) {
        console.error('❌ Error inserting data:', error);
    }
};

// Run
const filePath = "C://Users//Haki//Downloads//Données Projet Maintenance Flotte.xlsx"; 
const excelData = readExcelFile(filePath);
console.log(excelData); // Check if data is parsed correctly
insertDataToDB(excelData);
