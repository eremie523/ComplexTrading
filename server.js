const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const connectToDatabase = require('./Database/conn')
const router = require('./router/route')
// const protectedrouter = require('./router/protectedRoute')
const corsOptions = require('./config/corsOptions')
const https = require('https')
const dotenv = require("dotenv");
// const coinbaseapi = require('./coinbase_pay/payment')

// Load environment variables from .env file
dotenv.config({ path: ".env" });



const app = express();

app.use(express.json())

app.use(cors(corsOptions))
app.use(morgan('tiny'))
app.disable('x-powered-by')

connectToDatabase();
// coinbaseapi();
const port = 8080 


// HTTP GET request

app.get('/', (req, res) => {
    res.status(201).json('Home Get Request')
});

// api route

app.use('/api', router)


// app.get('/getCoinbaseCharges', (req, res) => {
//     const options = {
//       method: 'GET',
//       hostname: 'api.commerce.coinbase.com',
//       path: '/charges',
//       headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//         'X-CC-Api-Key': '2994289c-faac-42e4-a7ae-7df75d719820',
//         'X-CC-Version': '2018-03-22' 
//       }
//     };
  
//     const apiRequest = https.request(options, (apiResponse) => {
//       let data = '';
  
//       apiResponse.on('data', (chunk) => {
//         data += chunk;
//       });
  
//       apiResponse.on('end', () => {
//         res.json(JSON.parse(data));
//       });
//     });
  
//     apiRequest.on('error', (error) => {
//       console.error(error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     });
  
//     apiRequest.end();
//   });


  
// Start Server 

app.listen(port, () => {
    console.log(`Server connected to http://localhost:${port}`)
})