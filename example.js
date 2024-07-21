const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

const mongoUrl = "mongodb+srv://Manikumar:Manikumar@cluster0.lf64vd1.mongodb.net/?retryWrites=true&w=majority";

async function connectToMongo() {
    try {
        await mongoose.connect(mongoUrl);
        console.log("Database Connected Successfully ..");
    } catch (error) {
        console.log("Error Occurred While Connecting to Database");
    }
}

connectToMongo();

app.listen(4000, () => console.log("Server Running ....."));

// Schema Creation
const BrandNameSchema = new mongoose.Schema({
    brandname: {
        type: String,
        required: true  // Corrected the property name to "required"
    }
});

// Creation Of Model for schema
const BrandName = mongoose.model("BrandName", BrandNameSchema);

app.post("/addbrand", async (req, res) => {
    const { brandname } = req.body;
    try {
        const newData = new BrandName({ brandname });  // new user creation 
        await newData.save();
        console.log("Data saved successfully");
        res.status(200).send("Data Stored Successfully !!");
        
    } catch (error) {
        console.log("INTERNAL ERROR " + error.message);
        res.status(500).send("Internal Server Error");
    }
    
});

app.get("/getallbrand", async (req, res) => {
    try {
        const result = await BrandName.find();
        res.status(200).send(result);
    } catch (error) {
        console.log("INTERNAL ERROR " + error.message);
        res.status(500).send("Internal Server Error");
    }
});


app.get("/getallbrand/:id", async (req, res) => {
    const { id } = req.params;  // Use req.params to access route parameters

    try {
        const data = await BrandName.findById(id);  // Use findById for querying by ID
        if (!data) {
            return res.status(404).send("Data not found");  // Handle the case when data is not found
        }
        res.send(data);
    } catch (error) {
        console.log("INTERNAL ERROR " + error.message);
        res.status(500).send("Internal Server Error");
    }
});



//JWT TOKEN creation and Verification
// const secretKey="manikumar@123";

// const token=jwt.sign({id:"12345"},secretKey)
// console.log("token :",token)

// jwt.verify(token,secretKey,(err,decoded)=>{
//    if(err){
//     console.log("error message",err)
//    }
//    console.log("decoded::",decoded)
// })


//creation sample data schema

//Creation of DELETE METHOD
app.delete("/delete/:id",async(req,res)=>{
    const{id}=req.params
    try{
        const deleted=await SampleDetails.findByIdAndDelete(id)
        res.status(200).send("Record Deleted Succesfully !!")
        console.log("Record Deleted Succesfully !!")
    }
    catch(error){
        console.log("Internal Server Error")
        res.status(500).send("Inter Server Error")
    }
})


//Creation of GET METHOD (particular user details based on their ID) connect to form
app.get("/userdetails/:id",async(req,res)=>{
    const{id}=req.params

    try{
        const data=SampleDetails.findById(id)
        if(!data){
            res.status(401).send("Data Not Found")
        }
        res.send(data);
        console.log("Data Stored Successfully !!")
    }
    catch{
        res.status(400).send("Error Occured" + error.message)
        console.log("Error Occured while fetching the data")
    }
})

//Creation of GET METHOD (all details)
app.get("/userdetails",async(req,res)=>{
    try{
        const output=await SampleDetails.find()
        res.send(output)
        console.log("Data Fetched Succesfully !!")
    }
    catch(error){
        console.log("Failed to fetch !!")
        res.send(error.message)
    }
})

//Creation of PUT(UPDATE) METHOD connect to form
app.put("/update/:id",async(req,res)=>{
    const{id}=req.params
    const{name,email}=req.body
    try{
        const newuser=await SampleDetails.findByIdAndUpdate(
            id,
            {name,email}
        )
        if(!newuser){
            console.log("User Not Found")
            res.status(404).send("User Data Not Found")
        }
        res.status(200).send("Data Updated Succesfully !!")
    }
    catch(error){
        console.log("Error Occured : "+error.message)
        res.status(500).send("Internal Server Error")
    }
})






app.put("/update-user-password/:email",async(req,res)=>{
    const{password,confirmPassword}=req.body;
    const{email}=req.params;

    if(!email || !password || !confirmPassword){
        return res.status(400).send({message:"All Fields Required"})
    }

    if(password !== confirmPassword){
        return res.status(400).send({message:"Password Do Not Match !!"})
    }

    try{ 
            const checkMail=await SampleDetails.findOne({email:email})
            if (!checkMail) {
                return res.status(400).send({ message: "*Invalid Email" });
            }

             //hasing the password using bcrypt
             const changedHashPassword=await bcrypt.hash(password, 10);

             checkMail.password=changedHashPassword;
             await checkMail.save();
            return res.status(200).send({ message: "Password Updated Successfully !!" });
    }
    
    catch (error) {
                console.log(error.message);
                return res.status(500).send({ message: "*Internal Server Error" });
            }
})