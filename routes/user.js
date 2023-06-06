const router = require('express').Router()
const User = require('../models/users')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { requireLogin } = require("../middleware/auth");

// Register user
router.post('/register', async (req, res) => {
    const {name, email, password} = req.body
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: "That email is already registered!"});
        }
        const hashed_password = await bcrypt.hash(password, 10)
        user = new User({
            name,
            email,
            password: hashed_password
        })
        await user.save()
        return res.status(201).json({message: "User created successfully!"});

    } catch(err) {
        console.log(err)
    }
});

// Login User
router.post("/login", async(req, res) => {
    const {email, password} = req.body
    try {
        let user = await User.findOne({email})
        if (!user) {
            return res.status(400).json({ error: "Invalid Credentails"});
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid Credentails"});
        }
        const token = jwt.sign({_id: user._id},  process.env.JWT_SECRET, 
            {
                expiresIn: "1h",
            });
            return res.json({token});
    } catch(err) {
        console.log(err.message)
    }
});

router.get('/', requireLogin, async (req, res) => {
    console.log(req.user);
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.json(user);
    } catch (err) {
        console.log(err);
    }
});

models.exports = router