const express = require("express");
const app = express();
const mysql = require("mysql");

const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: true });
const { createTokens, validateToken } = require("./JWT");

require("dotenv").config({ path: "user.env" });

const con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.json());

app.get("/home", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/trending", (req, res) => {
  res.sendFile(__dirname + "/public/trending.html");
});

app.get("/product", (req, res) => {
  res.sendFile(__dirname + "/public/product.html");
});

app.get("/discounts", (req, res) => {
  res.sendFile(__dirname + "/public/discounts.html");
});

app.get("/err", (req, res) => {
  res.render("err");
});

app.get("/apn", (req, res) => {
  res.render("auth", { err: "" });
});

app.get("/apn/dashboard", validateToken, (req, res) => {
  res.render("dashboard", { data: "" });
});

app.post("/apn/auth", urlencodedParser, async (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    con.query(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password],
      (error, results, fields) => {
        if (error) throw error;
        if (results.length > 0) {
          const accessToken = createTokens(results);
          res.cookie("access-token", accessToken, { maxAge: 3600000 });
          res.redirect("/apn/products");
        } else {
          res.render("auth", { err: "Incorrect Username and/or Password!" });
        }
      }
    );
  } else {
    res.render("auth", { err: "Please enter Username and Password!" });
  }
});

app.get("/apn/products", validateToken, (req, res) => {
  con.query("SELECT * FROM productsDB", (err, result) => {
    if (err) throw err;
    res.render("products", { data: result });
  });
});

app.get("/apn/search", validateToken, (req, res) => {
  const term = req.query.term.toLowerCase();
  const sql = `SELECT * FROM productsdb WHERE ID LIKE '%${term}%' OR LOWER(Name) LIKE '%${term}%' OR LOWER(Description) LIKE '%${term}%'`;
  con.query(sql, (err, result) => {
    if (err) throw err;
    res.render("search", { data: result });
  });
});

app.get("/apn/insert", validateToken, (req, res) => {
  res.render("insert");
});

app.post("/apn/insert", urlencodedParser, validateToken, (req, res) => {
  const values = Object.values(req.body);
  if (req.body.instock === 0 || req.body.instock === "") {
    values[values.length - 1] = 1;
  }
  const sql =
    "INSERT INTO `productsDB`(`Name`, `Description`, `Price`, `Images`, `Stock`) VALUES (?)";
  con.query(sql, [values], (err, result) => {
    if (err) throw err;
    res.redirect("/apn/products");
  });
});

app.get("/apn/edit/:data", validateToken, (req, res) => {
  const dataObj = JSON.parse(req.params.data);
  res.render("edit", { data: dataObj });
});

app.post("/apn/edit/:id", urlencodedParser, validateToken, (req, res) => {
  const id = req.params.id;
  const sql = "UPDATE productsDB SET ? WHERE ID= ?";
  const values = req.body;
  con.query(sql, [values, id], (err, result) => {
    if (err) res.redirect("/err");
    res.redirect("/apn/products");
  });
});

app.get("/apn/delete/:ID", validateToken, (req, res) => {
  const id = req.params.ID;
  const sql = `DELETE FROM productsDB WHERE ID = ${id}`;
  con.query(sql, (err, result) => {
    if (err) throw err;
    res.redirect("/apn/products");
  });
});

app.get("/v/all", (req, res) => {
  const sql = `SELECT * FROM productsDB`;
  con.query(sql, (err, result) => {
    if (!result) {
      res.json({ status: "Not Found!" });
    } else {
      result.forEach((e) => {
        e.Images = e.Images.split(",");
      });
      res.json(result);
    }
  });
});

app.get("/v/stock", (req, res) => {
  const sql = `SELECT * FROM productsDB WHERE Stock = 1`;
  con.query(sql, (err, result) => {
    if (!result) {
      res.json({ status: "Not Found!" });
    } else {
      result.forEach((e) => {
        e.Images = e.Images.split(",").map((i) => i.replace(/ /g, ""));
      });
      res.json(result);
    }
  });
});

app.get("/v/:id", (req, res) => {
  const id = req.params.id;
  const sql = `SELECT * FROM productsDB WHERE ID = ?`;
  con.query(sql, id, (err, result) => {
    !result ? res.json({ status: "Not Found!" }) : res.json(result);
  });
});

app.listen(3000);
console.log(`Server is running on localhost:3000`);
