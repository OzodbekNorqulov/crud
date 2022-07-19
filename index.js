const express = require("express");
const router = require("./routes/users");

require("dotenv").config()

const app = express()
app.set("view engine", "ejs")


app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use('/', router)

app.listen(process.env.PORT || 8000, () => console.log("started..."))