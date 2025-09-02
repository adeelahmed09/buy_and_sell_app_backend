import express from"express"
import cors from "cors";
import dotenv  from "dotenv";
import {authenticateUser} from "./middleware/auth.js";

dotenv.config();

const app = express();
const prot = process.env.PORT || 3001;

app.use(express.json())
app.use(cors())

import userRouter from "./routes/user.route.js"
app.use("/api/user",userRouter)

import listingRouter from "./routes/listing.route.js"
app.use("/api/listings",listingRouter)

app.listen(prot,()=>{
    console.log(`Server is running on http://localhost:${prot}`);
})