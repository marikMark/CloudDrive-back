require('dotenv').config();
const PORT = process.env.PORT;
const express = require('express');
const app = express();
const cors = require('cors');
const fileUpload = require('express-fileupload');
const sequelize = require('./db');
const router = require('./routes/index');

app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use('/api', router);
app.use('/', router);

(async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();

        app.listen(PORT, () => {
            console.log(`Server's started on port ${PORT}`);
        })
    } catch(e) {
        console.log('An exception was detected:\n' + e);
    }
})();