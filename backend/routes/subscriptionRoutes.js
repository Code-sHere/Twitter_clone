const express = require("express");

const router = express.Router();

const {
    createSubscription,
} = require("../Controllers/subsxcriptioncontroller");

router.post("/create", createSubscription);

module.exports = router;