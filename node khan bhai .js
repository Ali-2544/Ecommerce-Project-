const express = require('express')
const app = express()
const port = 3007;

app.get('/user', (re1, res) => {
    res.send('Hello Mehtab!');
})

app.listen(port, () => {
    console.log(`http://localhost::${port}`);
})