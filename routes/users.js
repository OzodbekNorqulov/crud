const express = require("express");
const { getAllUsers, allAnn, getUserAds } = require("./fs");
const fs = require("fs/promises");
const path = require("path");
const dbPath = path.join(__dirname, "..", "data.json");
let userData = {};

const router = express.Router();

router.get("/form", (req, res) => {
    res.render("create", { title: "fer" });
});

router.get("/login", (req, res) => {
    res.render("login");
});

router.get("/", async (req, res) => {
    console.log(userData);
    const allAnns = await allAnn();
    res.render("home", { user: allAnns, userName: userData.userName, });
});

// ============================= START ADVERTISEMENTS SECTION ===================================

router.get("/ads", async (req, res) => {
    const user = await getAllUsers();
    console.log(`user data, ${userData.userName}`);
    const ads = await getUserAds(userData.userName);

    console.log(ads);

    res.render("ads", { ads });
});

// ============================= END ADVERTISEMENTS SECTION ===================================

// ============================= START ADVERTISEMENTS UPDATE SECTION ===================================

// router.post('/ads', (req, res) => {

// })

// ============================= END ADVERTISEMENTS UPDATE SECTION ===================================


// ============================= START ADDING NEW ADVERTISEMENT SECTION ===================================

router
    .get("/ads/create", (req, res) => {
        
        res.render("create-ads");
    })
    .post("/ads/create", async (req, res) => {
        const allUsers = await getAllUsers()
        const users = await allAnn();

        const newUser = {
            userName: userData.userName,
            ...req.body,
            messages: {
                fromMe: [],
                fromOutside: []
            }
        };

        const concatted = [...users, newUser]
        await fs.writeFile(path.join(dbPath), JSON.stringify({ users: allUsers, allAnnouncements: concatted }));
        console.log(req.body);

        res.send(`
    <h2>Product added successfully, you can back to home by clicking button below</h2>
    <button class="btn btn-success" type="button">
        <a href="/login">Back to Home</a>
    </button>`);
    });

// ============================= END ADDING NEW ADVERTISEMENT SECTION ===================================


//  ==================== CHAT SECTION ===============

let paramsId;
let owner;

router.get(`/chat/:id`, async(req, res) => {
    paramsId = req.params.id
    const allAds = await allAnn();
    const findedAds = allAds.find(i => i.userName == userData.userName);

    res.render("chat", { userName: findedAds.userName, id: paramsId, fromOutSide: allAds.userName == findedAds.userName ? findedAds.messages.fromOutside : allAds[paramsId].messages.fromOutside, owner})
    
})

router.post("/chat/:id", async(req, res) => {
    owner = req.body.owner

    const users = await getAllUsers()
    const allAds = await allAnn()
    const findedAds = allAds.find(i => i.userName == userData.userName);
    console.log(findedAds);
    allAds[paramsId].messages.fromOutside.push(req.body.text)
    await fs.writeFile(path.join(dbPath), JSON.stringify({ users: users, allAnnouncements: allAds }));

    res.render("chat", { userName: findedAds.userName, fromOutSide: allAds.userName == findedAds.userName ? findedAds.messages.fromOutside : allAds[paramsId].messages.fromOutside, owner})

    res.redirect(`/chat/${paramsId}`)
})


router.post("/login", async (req, res) => {
    const { userEmail, userPassword } = req.body;
    
    // console.log(req.body);
    // console.log(userData);

    const users = await getAllUsers();
    const allAnns = await allAnn();
    console.log(allAnns);
    // const userAnn = await annUsers();

    const finded = users.find(
        (i) => {
            return i.userEmail.toLowerCase().trim() == userEmail.toLowerCase().trim() &&
                i.userPassword.toLowerCase().trim() == userPassword.toLowerCase().trim()
        }

    );

    userData = { ...finded };

    // agar email teng bo'lsa

    if (
        !users.find(
            (i) => i.userEmail.toLowerCase().trim() == userEmail.toLowerCase().trim()
        )
    ) {
        res.render("login", { check: "You should Sign In" });
        console.log("ro'yxatdan o'tilmagan ekan!");
    }

    // email teng bo'lsa-yu lekin password teng bo'lmasa
    else if (
        users.find(
            (i) =>
                i.userEmail.toLowerCase().trim() == userEmail.toLowerCase().trim() &&
                i.userPassword.toLowerCase() !== userPassword.toLowerCase()
        )
    ) {
        res.render("login", { check: "invalid password" });
    }

    // agar password va email teng bo'lsa
    else if (
        users.find(
            (i) =>
                i.userEmail.toLowerCase().trim() == userEmail.toLowerCase().trim() &&
                i.userPassword.toLowerCase().trim() == userPassword.toLowerCase().trim()
        )
    ) {
        const finded = users.find(
            (i) =>
                i.userEmail.toLowerCase().trim() == userEmail.toLowerCase().trim() &&
                i.userPassword.toLowerCase().trim() == userPassword.toLowerCase().trim()
        );
        console.log(`You Signed In successfully, congratulations!!!`);

        res.render("home", {
            user: allAnns,
            userName: finded.userName,
        });
    }

    // boshqa holatlarda
    else {
        res.render("login", { check: "" });
    }
});

router.post("/form", async (req, res) => {
    const { userName, userEmail, userPassword, repeatPassword } = req.body;

    const newUser = {
        userName,
        userEmail,
        userPassword
    };

    const users = [...(await getAllUsers()), newUser];
    const allAnns = await allAnn();

    const allUsers = await getAllUsers();
    
    if (!userName || !userEmail || !userPassword) {
        return res.status(400).json({
            ok: false,
            message: "Input fields are must be full !!!",
        });
    }

    if (
        allUsers.find(
            (i) =>
                (i.userEmail.toLowerCase().trim() == userEmail.toLowerCase().trim() &&
                    i.userPassword.toLowerCase().trim() ==
                    userPassword.toLowerCase().trim()) ||
                i.userEmail.toLowerCase().trim() == userEmail.toLowerCase().trim()
        )
    ) {
        return res.status(400).json({
            ok: false,
            message: "this user already exists!",
        });
    } else {
        if (
            userPassword.toLowerCase().trim() == repeatPassword.toLowerCase().trim()
        ) {
            await fs.writeFile(path.join(dbPath), JSON.stringify({ users, allAnnouncements: allAnns }));
            res.status(200).json({
                ok: true,
                message: "CREATED",
                user: newUser,
            });
        } else {
            res.render("create", { check: "password doesn't the same!" });
        }


        // const user = await createUser(userName, userEmail, userPassword)
    }
});



module.exports = router;
