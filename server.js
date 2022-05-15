const express = require("express");
const app = express();
const mysql = require("mysql");
const bodyParser = require("body-parser");

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: true });

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "product",
});

app.set("view engine", "ejs");

app.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

app.get("/database", (req, res) => {
  con.query("SELECT * FROM products", (err, result) => {
    if (err) throw err;
    res.render("products", { data: result });
  });
});

app.get("/insert", (req, res) => {
  res.render("insert");
});

app.post("/insert", urlencodedParser, (req, res) => {
  const values = Object.values(req.body);
  const sql =
    "INSERT INTO `products`(`Name`, `Description`, `Price`, `Image`) VALUES (?)";
  con.query(sql, [values], (err, result) => {
    if (err) throw err;
    res.redirect("/database");
  });
});

app.get("/edit/:id", (req, res) => {
  res.render("edit", { id: req.params.id });
});

app.post("/edit/:id", urlencodedParser, (req, res) => {
  const id = req.params.id;
  const sql = "UPDATE products SET ? WHERE ID= ?";
  const values = req.body;
  con.query(sql, [values, id], (err, result) => {
    if (err) throw err;
    res.redirect("/database");
  });
});

app.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM products WHERE ID = ${id}`;
  con.query(sql, (err, result) => {
    if (err) throw err;
    res.redirect("/database");
  });
});

app.get("/v/all", (req, res) => {
  const sql = `SELECT * FROM products`;
  con.query(sql, (err, result) => {
    if (!result) {
      res.json({ status: "Not found!" });
    } else {
      res.json(result);
    }
  });
});

app.listen(3000);
