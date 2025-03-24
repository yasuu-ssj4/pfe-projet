import * as xlsx from 'xlsx';
import * as sql from 'mssql';
import { log } from 'console';

// Define your database config
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

// Function to read Excel file
const readExcelFile = (filePath: string) => {
    const workbook = xlsx.readFile(filePath)
    const sheetName = workbook.SheetNames[3]; 
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]); // Convert to JSON
    return data;
};

// Function to insert data into SQL Server
const insertDataToDB = async (data: any[]) => {
    try {
        let pool = await sql.connect(dbConfig);
        for (let row of data) {
            await pool.request()
                .input('Column1', sql.VarChar, row.Column1) // Adjust column names
                .input('Column2', sql.Int, row.Column2)
                .query('INSERT INTO YourTable (Column1, Column2) VALUES (@Column1, @Column2)');
        }
        console.log('Data inserted successfully!');
    } catch (error) {
        console.error('Error inserting data:', error);
    }
};

// Run the script
const filePath = "C:\Users\Haki\Downloads\Données Projet Maintenance Flotte.xlsx"; 
const excelData = readExcelFile(filePath);
console.log(excelData);

