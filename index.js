const {
  join: pathJoin
} = require("path");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const logger = require("morgan");
const bodyParser = require("body-parser");
const axios = require("axios");
const { SitemapStream, streamToPromise } = require("sitemap");
const { createGzip } = require("zlib");
const { Readable } = require("stream");
const cookieParser = require("cookie-parser");
const { getMeta } = require("./lib");	
const mailer = require("nodemailer");
const fs = require("fs");
let transporter = mailer.createTransport({
      host: "YOUR_SMTP",
      port: 465,
      secure: true,
      auth: {
        user: "YOUR_EMAIL",
        pass: "YOUR_PASSWD",
      },
    });
const ROOT = pathJoin(__dirname, "views");
const STATIC_ROOT = pathJoin(__dirname, "public");
var useragent = require('express-useragent');
 
app.use(useragent.express());
app.set("views", ROOT);
app.set("view engine", "ejs");
app.set("trust proxy", true);
app.set("json spaces", 2);
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(STATIC_ROOT));
app.use(async (req, res, next) => {
  res.locals.titleweb = "Tikly";
  res.locals.req = req;
  res.locals.ipAddr = req.headers["cf-connecting-ip"] || req.ip;
  res.locals.ua = req.useragent;
  res.locals.speeds = Date.now();
  next();
});

app.get(["/", "/index.html"], async (req, res) => {
  try {
    let cookie = req.cookies["lang"];
    let cloudflareipcountry = req.headers["cf-ipcountry"] || req.headers["x-vercel-ip-country"];
    let lang = cookie || cloudflareipcountry || "en";
    let countryCode = lang;
    if (countryCode == "ID") {
      res.redirect("/id");
    } else {
      res.redirect("/en");
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.get("/headers", (req, res) => {
res.send(req.headers);
})

app.get("/ua", (req, res) => {
res.send(req.useragent);
})

app.get("/id", async (req, res) => {
  res.cookie("lang", "ID", { maxAge: 900000, httpOnly: true });
  res.render("id")
});

app.get("/en", async (req, res) => {
  res.cookie("lang", "EN", { maxAge: 900000, httpOnly: true });
  res.render("en");
});

app.get("/about", async (req, res) => {
  res.render("about");
});

app.get("/contact", async (req, res) => {
  res.render("contact");
});

app.get("/privacy", async (req, res) => {
  res.render("privacy");
});

app.get("/terms", async (req, res) => {
  res.render("terms");
});

app.post("/contact", async (req, res) => {
  try {
    let { name, email, message } = req.body;

    let mail = {
      from: `"${name}" <${email}>`,
      to: "EMAIL_RECEIVER",
      subject: "Tikly Contact",
      text: `===== Tikly Contacts =====\n\nFrom: ${email}\nName: ${name}\nMessage: ${message}\n\n===== Automated Send Mail =====`,	
    };

    await transporter.sendMail(mail);
    res.render("contact", { success: true })
  } catch (err) {
    console.log(err);
    res.render("contact", { success: false })
  }
});

app.post("/download", async (req, res) => {
  let url = req.body._qgB
  if (!url) {
    res.render("id", { error: "Please enter a valid URL" });
  } else {
    try {
      let meta = await getMeta(url);
      res.render("download", { result: meta });
    } catch (err) {
      res.render("id", { error: err.message });
    }
  }
});
app.get("/sitemap.xml", async (req, res) => {
  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Content-Encoding", "gzip");
  let pathall = [];
  app._router.stack.forEach(function (r) {
    if (r.route && r.route.path) {
      if (typeof r.route.path == "object") {
        r.route.path.map((path) => {
          pathall.push(path);
        });
      } else {
        pathall.push(r.route.path);
      }
    }
  });
  const smStream = new SitemapStream({
    hostname: req.protocol + "://" + req.host,
  });
  const pipeline = smStream.pipe(createGzip());
  pathall.filter((path) => {
    if (path !== "/sitemap.xml" && path !== "/allpathroute" && path !== "/download" && path !== "/robots.txt" && path !== "/headers" && path !== "/ua" && path !== "/index.html") {
      smStream.write({ url: path, changefreq: "daily", priority: 0.9 });
    }
  });
  smStream.end();
  streamToPromise(pipeline).then((sm) => res.send(sm));
});

app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send(
    "User-agent: *\nAllow: /\nSitemap: " +
      req.protocol +
      "://" +
      req.host +
      "/sitemap.xml"
  );
});

app.use((req, res) => res.status(404).render("404"))


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
