const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();

// ------------------------
// STATIC FILES
// ------------------------
app.use(express.static('public'));
app.use('/pictures', express.static('pictures'));

// ------------------------
// CATALOG (JSON)
// ------------------------
app.get('/catalog', (req, res) => {
  const raw = fs.readFileSync('./data/products.json', 'utf8');
  const data = JSON.parse(raw);
  res.json(data);
});

// ------------------------
// VOTING
// ------------------------
app.post('/vote/:id', (req, res) => {
  const id = req.params.id;

  const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf8'));

  if (!products[id]) {
    return res.status(404).send("Product not found");
  }

  products[id].votes++;

  fs.writeFileSync('./data/products.json', JSON.stringify(products, null, 2));

  res.sendStatus(200);
});

// ------------------------
// LOGOUT
// ------------------------
app.get('/logout', (req, res) => {
  res.redirect('/');
});

// ------------------------
// MAIN PAGE
// ------------------------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ------------------------
// PRODUCT PAGE
// ------------------------
app.get('/product', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'product.html'));
});

// ------------------------
// UPLOAD PAGE
// ------------------------
app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

// ------------------------
// FILE UPLOAD HANDLING
// ------------------------
const upload = multer({ dest: 'uploads-temp/' });

app.post('/upload', upload.single('picture'), (req, res) => {
  const name = req.body.name;
  const description = req.body.description;
  const author = req.body.author;
  const price = Number(req.body.price);
  const minAmount = Number(req.body.min);

  const tempPath = req.file.path;
  const id = Date.now().toString();
  const targetPath = `pictures/${id}.jpg`;

  fs.renameSync(tempPath, targetPath);

  const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf8'));

  products[id] = {
    name: name,
    description: description,
    author: author,
    price: price,
    "min-amount": minAmount,
    votes: 0
  };

  fs.writeFileSync('./data/products.json', JSON.stringify(products, null, 2));

  res.redirect('/');
});

// ------------------------
// START SERVER
// ------------------------
const PORT = 8080;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server běží na http://${HOST}:${PORT}`);
});
