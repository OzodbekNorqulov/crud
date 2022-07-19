const fs = require("fs").promises;
const path = require("path");

const dbPath = path.join(__dirname, '..', 'data.json')

async function getAllUsers() {
    const data = await fs.readFile(dbPath, 'utf-8')

    return JSON.parse(data).users
}

// async function annUsers() {
//     const data = await fs.readFile(dbPath, 'utf-8')

//     return JSON.parse(data).annUsers
// }

async function allAnn() {
    const data = await fs.readFile(dbPath, 'utf-8')

    return JSON.parse(data).allAnnouncements
}

async function getUserAds(newName) {
    console.log(newName);

    const ads = await allAnn()
    return ads.filter(i => i.userName == newName)
}



module.exports = { getAllUsers, allAnn, getUserAds }