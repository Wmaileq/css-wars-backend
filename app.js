const express = require('express');
const app = express();
const getSimilarity = require('./compare');

app.get('/', async function (req, res) {
    const similarity = await getSimilarity(
        '<style>*{background-color: red}</style>',
        '<style>*{background: red}</style>',
        400,
        300
    );
     res.send(similarity)
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});