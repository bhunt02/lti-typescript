const path = require("path");
const fs = require("fs");

data = fs.readFileSync(path.join(__dirname, "package.json"), "utf8");
data = JSON.parse(data);

data.main = 'index.js';
data.types = 'index.d.ts';
data.exports = {
  ".": './index.js',
};

fs.writeFileSync(path.join(__dirname, "dist/package.json"), JSON.stringify(data, null, 2));