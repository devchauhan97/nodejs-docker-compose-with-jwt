require('dotenv').config();
const port = 8000;
const express = require('express');
const app = express();
const apiRoutes=require('./routes');
const cors = require('cors');
const corsOptions = {
    origin: [
        'http://localhost:4200',      // Angular dev frontend
        'http://localhost:3000',      // Local frontend
        'http://localhost:54397',
        'http://localhost:5174',
        'http://localhost:5173'
            ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // Allow cookies and credentials
};
app.use(express.urlencoded({ extended: true })); 
app.use(cors(corsOptions));
app.use(express.json()); 
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});
 
// app.listen(8001,()=>{
//     console.log(`Server is running on port 8001`);
// });
// app.listen(8002,()=>{
//     console.log(`Server is running on port 8002`);
// });
