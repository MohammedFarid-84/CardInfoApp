const express = require('express');
const cors = require('cors');
const app = express();

// configration secur connection with node.js library
const corsOptions = {
  origin: '../libs/sql-wasm.wasm',
  methods: 'GET, POST, PUT, DELETE',
  allowedHeaders: 'Content-Type, Authorization',
  credentials: true
};

app.use(cors(corsOptions));

// create connection
async function loadDatabase() {
    const SQL = await initSqlJs({ locateFile: file => '../libs/sql-wasm.wasm' });
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "../database/cardinfo.db", true);
    xhr.responseType = "arraybuffer";
    xhr.onload = () => {
        const uInt8Array = new Uint8Array(xhr.response);
        db = new SQL.Database(uInt8Array);
        console.log("Database loaded successfully!");
    };
    xhr.send();
}