import dontenv from "dotenv";
dontenv.config();
import express from "express";
import cors from "cors";
const app = express();
import bodyParser from "body-parser";

import { Url } from "./model/urlModel.js";
import dns from "dns/promises";
import { nanoid } from "nanoid";

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", async (req, res) => {
  console.log(req.body);
  const { url } = req.body;
  if (url) {
    try {
      let host = new URL(url).hostname;
      console.log("host", host);
      let reply = await dns.lookup(host);
      console.log("lookup response", reply);
      if (reply.address) {
        let shortId = nanoid(5);
        let _url = await Url.findOne({ originalUrl: url });
        if (!_url) {
          _url = await Url.create({
            originalUrl: url,
            short_url: shortId,
            requestCount: 0,
          });
          res.status(200);
          res.json({ original_url: url, short_url: shortId });
        } else {
          res.status(200);
          res.json({ original_url: url, short_url: _url.short_url });
        }
      }
    } catch (error) {
      console.log("error", error);
      res.json({ error: "invalid URL" });
    }
  } else res.json({ error: "invalid URL" });
});

app.get("/api/shorturl/:short_url", async (req, res) => {
  const { short_url } = req.params;
  if (short_url) {
    let _url = await Url.findOne({ short_url });
    if (_url) {
      res.redirect(301, _url.originalUrl);
    }
  } else {
    res.json({ error: "invalid URL" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
