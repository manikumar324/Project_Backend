const express = require('express');
const cors=require('cors');
const mongoose = require('mongoose');
const app = express();
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');


const secretKey="Manikumar@123"
//middlewares
app.use(express.json());
app.use(cors());

//token verification middleware

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log(token);

    if (!token) {
        return res.status(401).json({ message: "Access Denied. Token Not Provided" });
    }

    try {
        const decoded = await jwt.verify(token, secretKey);
        req.user = decoded;
        next();
    } catch (err) {
        console.error(err);
        res.status(403).json({ message: "Token Verification failed" });
    }
};

app.get("/",async(req,res)=>{
    res.send("Server Running Successfully !!")
})

//To know the errors

// process.on('unhandledRejection', (reason, promise) => {
//     console.error('Unhandled Rejection at:', promise, 'reason:', reason);
//     // Handle the error appropriately, e.g., log it or terminate the process
// });


//This is a URL which is usedd to connect withmongodb database 
const mongoUrl = "mongodb+srv://Manikumar:Manikumar@cluster0.lf64vd1.mongodb.net/?retryWrites=true&w=majority";

//connecting mongodb with node.js
async function connectToMongo() {
    try {
        await mongoose.connect(mongoUrl);
        console.log("Database Connected Successfully ..");
    } catch (error) {
        console.log("Error Occurred While Connecting to Database");
    }
}

connectToMongo();

//server ruuning on this port
app.listen(4000, () => console.log("Server Running on Port 4000 ....."));


// Schema Creation
const UserSchema =new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    pass:{
        type:String,
        require:true
    }
})

const RecipeSchema=new mongoose.Schema({
    name:String,
    rating:Number,
    price:Number,
    imageUrl:String
})

const ItemSchema=new mongoose.Schema({
    itemId:Number,
    name:String,
    rating:Number,
    price:Number,
    imageUrl:String
})

const MenuList=new mongoose.Schema({
    carousalImg:String,
    itemId:Number,
    name:String,
    rating:Number,
    price:Number,
    imageUrl:String
})

const OrderSchema=new mongoose.Schema({
    name:String,
    number:Number,
    address:String,
    pincode:Number
})
//model creation based on schema:
const SampleDetails=mongoose.model("SampleDetails",UserSchema)
const Recipe=mongoose.model("Recipe",RecipeSchema)
const RecipeList=mongoose.model("RecipeList",ItemSchema)
const RecipeMenuListDetails=mongoose.model("RecipeMenuListDetails",MenuList)
const OrderDetailsList=mongoose.mongoose.model("OrderDetailsList",OrderSchema)

//Creation of POST METHOD  (SIGN UP API) connect to form
app.post("/signup",async(req,res)=>{
    const{name,email,pass}=req.body;
   
    try{
        if(!name || !email || !pass){
            return res.status(400).send({ message: "All Fields Required" });
        }
        let existUser=await SampleDetails.findOne({email})
        if(existUser){
            return res.status(400).send({message:"User Alreday Exists"})
        }
        let hashedPassword=await bcrypt.hash(pass,10)
        console.log(hashedPassword)
        const newUser=new SampleDetails({name,email,pass:hashedPassword})
        const result=await newUser.save()
        res.status(200).send({message:"User Created Successfully"})
    }
    catch(error){
        return res.status(400).send({message:"Network Error"})
    }
})

//Creation Of POST METHOD (LOG IN API) connect to form

app.post("/login",async(req,res)=>{
    const{mail,password}=req.body;
    try{
        if(!mail || !password){
            return res.status(400).send({message:"*Required All Fields"})
        }
        let alreadyUser=await SampleDetails.findOne({email:mail})
        if(!alreadyUser){
            return res.status(400).send({message:"*Invalid Email"})
        }
        const comparePass= await bcrypt.compare(password,alreadyUser.pass)
        if(comparePass){
            const token=jwt.sign({usermail :mail},secretKey,{expiresIn:"30"})
            console.log("JWT Token :",token)
            return res.status(200).send({message:"Log in Successfully !!",token})
        }
        else{
            return res.status(401).send({message:"*Invalid Password"})
        }

    }
    catch(error){
        res.status(401).send({message:"Internal Error"})
    }
})

//Creation Of POST METHOD (ITEM ORDER API) connect to form
app.post("/order-details-list",async(req,res)=>{
    const {name,number,address,pincode}=req.body;

    try{
        if(!name || !number || !address || !pincode){
            return res.status(400).send({message :"All Fields Required"})
        }
        else{
            const newOrder=new OrderDetailsList({name,number,address,pincode})
            const confirm=newOrder.save()
            return res.status(200).send({message:"Order Placed Successfully !!"})
        }
    }
    catch(error){
            return res.status(404).send({message:"network Error"})
    }
})

//Also need to create API's using Query parameters.

//API Creation for updating the password

app.put("/update-user-password/:email", async (req, res) => {
    const { email: paramEmail } = req.params;
    const { email: bodyEmail, password, confirmPassword } = req.body;
  
    if (!paramEmail || !password || !confirmPassword) {
      return res.status(400).send({ message: "*Require All Fields" });
    }
  
    if (password !== confirmPassword) {
      return res.status(400).send({ message: "*Passwords do not match" });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const updatedUser = await SampleDetails.findOneAndUpdate(
        { email: paramEmail },
        { $set: { password: hashedPassword } },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(400).send({ message: "*Invalid Email" });
      }
  
      res.status(200).send({ message: "Password Updated Successfully !!" });
    } catch (error) {
      console.log(error.message);
      res.status(500).send({ message: "*Internal Server Error" });
    }
  });


//creation of sample data

app.post("/Recipes",async(req,res)=>{
    const SampleData=[
        {
            name:"Dosa",
            rating:4.8,
            price:50,
            imageUrl:"https://foodiewish.com/wp-content/uploads/2020/05/Masala-Dosa-Recipe.jpg",
        },
        {
            name:"Chicken Biryani",
            rating:4.5,
            price:199,
            imageUrl:"https://wallpaperaccess.com/full/1972917.jpg",
        },
        {
            name:"Fish Curry",
            rating:4.1,
            price:179,
            imageUrl:"https://th.bing.com/th/id/OIP.FZbJsA1zCAK6KeMpsLcceQHaE8?rs=1&pid=ImgDetMain",
        },
        {
            name:"Pizza",
            rating:4.1,
            price:249,
            imageUrl:"https://th.bing.com/th/id/OIP.olSHgC58bgAYbeFtqYH6mQHaEo?rs=1&pid=ImgDetMain",
        },
        {
            name:"Idly",
            rating:4.6,
            price:50,
            imageUrl:"https://static.toiimg.com/photo/68631114.cms",
        },
        {
            name:"Chicken Curry",
            rating:4.0,
            price:200,
            imageUrl:"https://th.bing.com/th/id/OIP.lkB2tV6WcqAi6eowamXXiQHaHa?rs=1&pid=ImgDetMain",
        },
        {
            name:"Fish Fry",
            rating:3.9,
            price:120,
            imageUrl:"https://c.ndtvimg.com/2020-01/op8grfc_fish_625x300_11_January_20.jpg",
        },
        {
            name:"Rice and Dal",
            rating:4.0,
            price:150,
            imageUrl:"https://i.ytimg.com/vi/oT30M4Syc3k/maxresdefault.jpg",
        },
        {
            name:"Soups",
            rating:3.6,
            price:129,
            imageUrl:"https://images4.alphacoders.com/808/thumb-1920-808165.jpg",
        },
        {
            name:"Coconut Rice",
            rating:3.9,
            price:149,
            imageUrl:"https://food.fnr.sndimg.com/content/dam/images/food/fullset/2011/7/13/0/FNM_100109-Coconut-Rice_s4x3.jpg.rend.hgtvcom.756.567.suffix/1371599944258.jpeg",
        },
        {
            name:"Burger",
            rating:4.3,
            price:249,
            imageUrl:"https://th.bing.com/th/id/OIP.z75_bsjBKSBeC22Ndugf4AHaE8?rs=1&pid=ImgDetMain",
        },
        {
            name:"Egg Curry",
            rating:4.1,
            price:199,
            imageUrl:"https://th.bing.com/th/id/OIP.ZEcKH4ovI_LUf_Ik6wnTeAHaHa?w=500&h=500&rs=1&pid=ImgDetMain",
        },
        {
            name:"Aalu masala",
            rating:4.0,
            price:149,
            imageUrl:"https://i.ytimg.com/vi/dh8zaocvuKk/maxresdefault.jpg",    
        },
        {
            name:"Chicken Pakoda",
            rating:4.2,
            price:149,
            imageUrl:"https://i.pinimg.com/originals/36/73/5b/36735b47d9cde582596f4c9423e5f1bf.jpg",
        },
        {
            name:"Noodles",
            rating:3.9,
            price:99,
            imageUrl:"https://www.indianhealthyrecipes.com/wp-content/uploads/2021/07/hakka-noodles-recipe.jpg",
        },
        {
            name:"Desserts",
            rating:3.9,
            price:149,
            imageUrl:"https://images5.alphacoders.com/341/thumb-1920-341445.jpg",
        },
        {
            name:"Salads",
            rating:4.0,
            price:5,
            imageUrl:"https://th.bing.com/th/id/OIP.kwlAl2AvktnWyl2NAzcRZgHaEp?rs=1&pid=ImgDetMain",
        },
        {
            name:"Chapathi and Curry",
            rating:4.1,
            price:129,
            imageUrl:"https://th.bing.com/th/id/OIP.yNytxdO-DjA4hjQBXhBkvQAAAA?rs=1&pid=ImgDetMain",
        },
        {
            name:"Tomato Curry",
            rating:3.9,
            price:149,
            imageUrl:"https://zenaskitchen.com/wp-content/uploads/2022/02/tomato-and-red-pepper-sauce-700x700.jpg",
        },
        {
            name:"Lemon Rice",
            rating:3.8,
            price:129,
            imageUrl:"https://i.pinimg.com/originals/31/7c/d6/317cd62849557d086aafbdeecc29db70.jpg",
        }
    ];
    try{
        const result=await Recipe.insertMany(SampleData)
        res.status(200).send(result)
        console.log(result)
    }
    catch(error){
        res.status(400).send(error.message)
    }
})

//get recipes data

app.get("/RecipeData",async(req,res)=>{
    try{
        const data=await Recipe.find({})
        res.status(200).send(data)
        console.log("Data Fetched Successfully !!")
    }
    catch(error){
        res.status(400).send({message:"Network Error"})
        console.log("Network Error")
    }
})

//second schema

app.post("/RecipeListData",async(req,res)=>{
    const SampleRecipesData=[
        {
            itemId:1,
            name:"Dosa",
            rating:4.8,
            price:50,
            imageUrl:"https://foodiewish.com/wp-content/uploads/2020/05/Masala-Dosa-Recipe.jpg",
        },
        {
            itemId:2,
            name:"Chicken Biryani",
            rating:4.5,
            price:199,
            imageUrl:"https://wallpaperaccess.com/full/1972917.jpg",
        },
        {
            itemId:3,
            name:"Fish Curry",
            rating:4.1,
            price:179,
            imageUrl:"https://th.bing.com/th/id/OIP.FZbJsA1zCAK6KeMpsLcceQHaE8?rs=1&pid=ImgDetMain",
        },
        {
            itemId:4,
            name:"Pizza",
            rating:4.1,
            price:249,
            imageUrl:"https://th.bing.com/th/id/OIP.olSHgC58bgAYbeFtqYH6mQHaEo?rs=1&pid=ImgDetMain",
        },
        {
            itemId:5,
            name:"Idly & Sambar",
            rating:4.6,
            price:50,
            imageUrl:"https://static.toiimg.com/photo/68631114.cms",
        },
        {
            itemId:6,
            name:"Chicken Curry",
            rating:4.0,
            price:200,
            imageUrl:"https://th.bing.com/th/id/OIP.lkB2tV6WcqAi6eowamXXiQHaHa?rs=1&pid=ImgDetMain",
        },
        {
            itemId:7,
            name:"Fish Fry",
            rating:3.9,
            price:120,
            imageUrl:"https://c.ndtvimg.com/2020-01/op8grfc_fish_625x300_11_January_20.jpg",
        },
        {
            itemId:8,
            name:"Rice & Dal",
            rating:4.0,
            price:150,
            imageUrl:"https://i.ytimg.com/vi/oT30M4Syc3k/maxresdefault.jpg",
        },
        {
            itemId:9,
            name:"Soups",
            rating:3.6,
            price:129,
            imageUrl:"https://images4.alphacoders.com/808/thumb-1920-808165.jpg",
        },
        {
            itemId:10,
            name:"Coconut Rice",
            rating:3.9,
            price:149,
            imageUrl:"https://food.fnr.sndimg.com/content/dam/images/food/fullset/2011/7/13/0/FNM_100109-Coconut-Rice_s4x3.jpg.rend.hgtvcom.756.567.suffix/1371599944258.jpeg",
        },
        {
            itemId:11,
            name:"Burger",
            rating:4.3,
            price:249,
            imageUrl:"https://th.bing.com/th/id/OIP.z75_bsjBKSBeC22Ndugf4AHaE8?rs=1&pid=ImgDetMain",
        },
        {
            itemId:12,
            name:"Egg Curry",
            rating:4.1,
            price:199,
            imageUrl:"https://th.bing.com/th/id/OIP.ZEcKH4ovI_LUf_Ik6wnTeAHaHa?w=500&h=500&rs=1&pid=ImgDetMain",
        },
        {
            itemId:13,
            name:"Aalu masala",
            rating:4.0,
            price:149,
            imageUrl:"https://i.ytimg.com/vi/dh8zaocvuKk/maxresdefault.jpg",    
        },
        {
            itemId:14,
            name:"Chicken Pakoda",
            rating:4.2,
            price:149,
            imageUrl:"https://i.pinimg.com/originals/36/73/5b/36735b47d9cde582596f4c9423e5f1bf.jpg",
        },
        {
            itemId:15,
            name:"Noodles",
            rating:3.9,
            price:99,
            imageUrl:"https://www.indianhealthyrecipes.com/wp-content/uploads/2021/07/hakka-noodles-recipe.jpg",
        },
        {
            itemId:16,
            name:"Desserts",
            rating:3.9,
            price:149,
            imageUrl:"https://images5.alphacoders.com/341/thumb-1920-341445.jpg",
        },
        {
            itemId:17,
            name:"Salads",
            rating:4.0,
            price:5,
            imageUrl:"https://th.bing.com/th/id/OIP.kwlAl2AvktnWyl2NAzcRZgHaEp?rs=1&pid=ImgDetMain",
        },
        {
            itemId:18,
            name:"Chapathi & Curry",
            rating:4.1,
            price:129,
            imageUrl:"https://th.bing.com/th/id/OIP.yNytxdO-DjA4hjQBXhBkvQAAAA?rs=1&pid=ImgDetMain",
        },
        {
            itemId:19,
            name:"Tomato Curry",
            rating:3.9,
            price:149,
            imageUrl:"https://zenaskitchen.com/wp-content/uploads/2022/02/tomato-and-red-pepper-sauce-700x700.jpg",
        },
        {
            itemId:20,
            name:"Lemon Rice",
            rating:3.8,
            price:129,
            imageUrl:"https://i.pinimg.com/originals/31/7c/d6/317cd62849557d086aafbdeecc29db70.jpg",
        }
    ];
    try{
        const result=await RecipeList.insertMany(SampleRecipesData)
        res.status(200).send(result)
        console.log(result)
    }
    catch(error){
        res.status(400).send(error.message)
    }
})

app.get("/recipeslist",async(req,res)=>{
    try{
        const data=await RecipeList.find({})
        res.status(200).send(data)
        console.log("Data Fetched Successfully !!")
    }
    catch(error){
        res.status(400).send({message:"Network Error"})
        console.log("Network Error")
    }
})

//API for list of items-menu based on their itemId

app.post("/menulistitems",async(req,res)=>{
    const MenuListData= [
        {
            carousalImg:"https://th.bing.com/th/id/OIP.ez555sVW5AZnbCAM7P0L4gHaFj?rs=1&pid=ImgDetMain",
            itemId:1,
            name:"Bahubali Dosa",
            rating:4.6,
            price:149,
            imageUrl:"https://wallpapercave.com/wp/wp6735012.jpg",
        },
        {
            carousalImg:"https://th.bing.com/th/id/R.6b7afc4e05d4b3ef3a927e6d062d8481?rik=OSi0hRIzrH5rzw&riu=http%3a%2f%2fyesofcorsa.com%2fwp-content%2fuploads%2f2018%2f04%2fMasala-Dosa-Wallpaper-Free.jpg&ehk=YSlI1hOX%2bOtRs1l9WlMeLms1GK5LJwtytwjb4cbWQ%2bU%3d&risl=&pid=ImgRaw&r=0",
            itemId:1,
            name:"Egg Dosa",
            rating:4.6,
            price:69,
            imageUrl:"https://vismaifood.com/storage/app/uploads/public/046/0dd/402/thumb__700_0_0_0_auto.jpg",
        },
        {
            carousalImg:"https://www.indianhealthyrecipes.com/wp-content/uploads/2016/03/masala-dosa.jpg",
            itemId:1,
            name:"Masala Dosa",
            rating:4.2,
            price:59,
            imageUrl:"https://www.rasoirani.com/wp-content/uploads/2020/04/masala-dosa.jpg",
        },
        {
            carousalImg:"https://th.bing.com/th/id/OIP.qOkQkAcfZdJJbBH3qu7PAwHaDz?rs=1&pid=ImgDetMain",
            itemId:1,
            name:"Plane Dosa",
            rating:3.9,
            price:39,
            imageUrl:"https://th.bing.com/th/id/OIP.rbACnNK6l8L0XG8tQavxFwHaE1?rs=1&pid=ImgDetMain",
        },
        {
            carousalImg:"https://i.pinimg.com/474x/42/dc/5c/42dc5c2a8f67bbbd10baa208f01d0be6--south-indian-foods-indian-breakfast.jpg",
            itemId:1,
            name:"Upma Dosa",
            rating:4.4,
            price:69,
            imageUrl:"https://th.bing.com/th/id/OIP.iyoXfTciB2PQtbYEoDZh_QHaE5?rs=1&pid=ImgDetMain",
        },
        {
            carousalImg:"https://foodiewish.com/wp-content/uploads/2020/05/Masala-Dosa-Recipe.jpg",
            itemId:1,
            name:"Paper Dosa",
            rating:3.6,
            price:29,
            imageUrl:"https://i.pinimg.com/originals/00/15/d0/0015d002ce7fff30c937f8dce12449b5.jpg",
        },
        {
            carousalImg:"https://th.bing.com/th/id/OIF.ylr3NRV8hJ0DvpP8nphLWA?rs=1&pid=ImgDetMain",
            itemId:2,
            name:"Hyderabad Biryani",
            rating:4.8,
            price:199,
            imageUrl:"https://th.bing.com/th/id/OIF.ylr3NRV8hJ0DvpP8nphLWA?rs=1&pid=ImgDetMain",
        },
        {
            carousalImg:"https://1.bp.blogspot.com/-vYjeiVwDkJY/VuRpY76XOwI/AAAAAAAAEGg/GU6X-_kRtc0XDOv4voSPN4tGBW0WOOYHQ/s1600/20160301_160156.jpg",
            itemId:2,
            name:"Lollipop Biryani",
            rating:4.5,
            price:229,
            imageUrl:"https://1.bp.blogspot.com/-vYjeiVwDkJY/VuRpY76XOwI/AAAAAAAAEGg/GU6X-_kRtc0XDOv4voSPN4tGBW0WOOYHQ/s1600/20160301_160156.jpg",
        },
        {
            carousalImg:"https://1.bp.blogspot.com/-cMtH2ksZYQk/X4LenHmwtiI/AAAAAAAABcc/_8YLuoLn6zEGkHtSmV_hovqkCt-1CmEmQCLcBGAsYHQ/s1080/IMG-20201002-WA0010.jpg",
            itemId:2,
            name:"Matka Biryani",
            rating:4.1,
            price:219,
            imageUrl:"https://1.bp.blogspot.com/-cMtH2ksZYQk/X4LenHmwtiI/AAAAAAAABcc/_8YLuoLn6zEGkHtSmV_hovqkCt-1CmEmQCLcBGAsYHQ/s1080/IMG-20201002-WA0010.jpg",
        },
        {
            carousalImg:"https://i.ytimg.com/vi/IvgtEKzoMvg/maxresdefault.jpg",
            itemId:2,
            name:"Roasted Biryani",
            rating:4.4,
            price:229,
            imageUrl:"https://i.ytimg.com/vi/IvgtEKzoMvg/maxresdefault.jpg",
        },
        {
            carousalImg:"https://th.bing.com/th/id/OIP.tzBO7Mih5c1nBhKjeaaHgwAAAA?rs=1&pid=ImgDetMain",
            itemId:2,
            name:"Special Dham Biryani",
            rating:4.6,
            price:209,
            imageUrl:"https://th.bing.com/th/id/OIP.tzBO7Mih5c1nBhKjeaaHgwAAAA?rs=1&pid=ImgDetMain",
        },
        {
            carousalImg:"https://th.bing.com/th/id/OIP.MagBXKknTdFuLOtJ-W5LuQHaFX?rs=1&pid=ImgDetMain",
            itemId:2,
            name:"Luknow Murgh Biryani",
            rating:4.2,
            price:259,
            imageUrl:"https://th.bing.com/th/id/OIP.MagBXKknTdFuLOtJ-W5LuQHaFX?rs=1&pid=ImgDetMain",
        },
        
        {
            carousalImg:"https://i.ndtvimg.com/i/2015-01/red-hot-chilli-fish-curry_625x350_51421930099.jpg",
            itemId:3,
            name:"Red Hot chill Fish Curry",
            rating:4.2,
            price:209,
            imageUrl:"https://i.ndtvimg.com/i/2015-01/red-hot-chilli-fish-curry_625x350_51421930099.jpg",
        },
        {
            carousalImg:"https://i.ndtvimg.com/i/2015-01/hilsa-fish-curry_625x350_61421934049.jpg",
            itemId:3,
            name:"Hilsa Fish Curry",
            rating:4.1,
            price:199,
            imageUrl:"https://i.ndtvimg.com/i/2015-01/hilsa-fish-curry_625x350_61421934049.jpg",
        },
        {
            carousalImg:"https://happymuncher.com/wp-content/uploads/2022/03/best-veggies-for-Green-Curry-500x500.png",
            itemId:3,
            name:"Green Fish Curry",
            rating:4.4,
            price:249,
            imageUrl:"https://happymuncher.com/wp-content/uploads/2022/03/best-veggies-for-Green-Curry-500x500.png",
        },
        {
            carousalImg:"https://i.ndtvimg.com/i/2015-01/fish-mappas_625x350_71421934749.jpg",
            itemId:3,
            name:"Fish Mappas Curry",
            rating:4.1,
            price:189,
            imageUrl:"https://i.ndtvimg.com/i/2015-01/fish-mappas_625x350_71421934749.jpg",
        },
        {
            carousalImg:"https://recipes.timesofindia.com/thumb/55224612.cms?imgsize=539861&width=800&height=800",
            itemId:3,
            name:"Goan Fish Curry",
            rating:4.6,
            price:199,
            imageUrl:"https://recipes.timesofindia.com/thumb/55224612.cms?imgsize=539861&width=800&height=800",
        },
        {
            carousalImg:"https://th.bing.com/th/id/R.14adc38ca7ccb35bf7564278935b346b?rik=AW0l2c%2bYI7Zcbg&riu=http%3a%2f%2fgreen-travel-blog.com%2fwp-content%2fuploads%2f2019%2f07%2fAdobeStock_229328432.jpeg&ehk=PVg0pAjizPAKmTyKMQjuEfyBh%2biQCZzlSQYiE0Du10E%3d&risl=&pid=ImgRaw&r=0",
            itemId:3,
            name:"Assamese Fish Curry",
            rating:4.2,
            price:239,
            imageUrl:"https://th.bing.com/th/id/R.14adc38ca7ccb35bf7564278935b346b?rik=AW0l2c%2bYI7Zcbg&riu=http%3a%2f%2fgreen-travel-blog.com%2fwp-content%2fuploads%2f2019%2f07%2fAdobeStock_229328432.jpeg&ehk=PVg0pAjizPAKmTyKMQjuEfyBh%2biQCZzlSQYiE0Du10E%3d&risl=&pid=ImgRaw&r=0",
        },
        
        {
            carousalImg:"https://1.bp.blogspot.com/-fU_ozvGFFG0/VlKh-powozI/AAAAAAAABVc/NR5v3vEy6h0/s1600/kerala%2Bmalabar%2Bfish%2Bcrispy%2Bfry%2Bmasala%2Bspicy%2Bcurry%2Brestaurant%2Bstyle%2Bfry.jpg",
            itemId:7,
            name:"Spicy Fried Fish",
            rating:4.2,
            price:159,
            imageUrl:"https://1.bp.blogspot.com/-fU_ozvGFFG0/VlKh-powozI/AAAAAAAABVc/NR5v3vEy6h0/s1600/kerala%2Bmalabar%2Bfish%2Bcrispy%2Bfry%2Bmasala%2Bspicy%2Bcurry%2Brestaurant%2Bstyle%2Bfry.jpg",
        },
        {
            carousalImg:"https://th.bing.com/th/id/OIP.kbe3bGupc-YQfYsbeEq2HAHaFi?rs=1&pid=ImgDetMain",
            itemId:7,
            name:" Cornmeal Fish Fry",
            rating:4.3,
            price:189,
            imageUrl:"https://th.bing.com/th/id/OIP.kbe3bGupc-YQfYsbeEq2HAHaFi?rs=1&pid=ImgDetMain",
        },
        {
            carousalImg:"https://th.bing.com/th/id/OIP._WQ4i59rT58esj2MhKLWgwHaGz?rs=1&pid=ImgDetMain",
            itemId:7,
            name:"Kerala Style Fish Fry",
            rating:4.4,
            price:249,
            imageUrl:"https://th.bing.com/th/id/OIP._WQ4i59rT58esj2MhKLWgwHaGz?rs=1&pid=ImgDetMain",
        },
        {
            carousalImg:"https://th.bing.com/th/id/OIP.KnvXXaDSRXGqMfQNT7RT6AHaE8?w=612&h=408&rs=1&pid=ImgDetMain",
            itemId:7,
            name:"Battered Fish Fry",
            rating:3.9,
            price:169,
            imageUrl:"https://th.bing.com/th/id/OIP.KnvXXaDSRXGqMfQNT7RT6AHaE8?w=612&h=408&rs=1&pid=ImgDetMain",
        },
        {
            carousalImg:"https://thumbs.dreamstime.com/b/baked-fish-salad-white-plate-79491266.jpg",
            itemId:7,
            name:"Baked Fish Fry",
            rating:4.6,
            price:199,
            imageUrl:"https://thumbs.dreamstime.com/b/baked-fish-salad-white-plate-79491266.jpg",
        },
        {
            carousalImg:"https://th.bing.com/th/id/OIP.Mj5vGFBEb1uqlA6Ox56mQgHaEL?w=852&h=480&rs=1&pid=ImgDetMain",
            itemId:7,
            name:"Roasted Sea Fish Fry",
            rating:4.2,
            price:149,
            imageUrl:"https://th.bing.com/th/id/OIP.Mj5vGFBEb1uqlA6Ox56mQgHaEL?w=852&h=480&rs=1&pid=ImgDetMain",
        },
        
        {
            carousalImg:"https://cdn.apartmenttherapy.info/image/fetch/f_auto,q_auto:eco/https://storage.googleapis.com/gen-atmedia/3/2018/10/1574959dca3fc2e4eac7eaa242745c495a0e82c9.jpeg",
            itemId:9,
            name:"Broth soup",
            rating:4.2,
            price:139,
            imageUrl:"https://cdn.apartmenttherapy.info/image/fetch/f_auto,q_auto:eco/https://storage.googleapis.com/gen-atmedia/3/2018/10/1574959dca3fc2e4eac7eaa242745c495a0e82c9.jpeg",
        },
        {
            carousalImg:"https://th.bing.com/th/id/R.124d26ea6051f5c92fd915da8f7ad632?rik=HymfP8K20zXZiA&riu=http%3a%2f%2f4.bp.blogspot.com%2f-sMaBszxQ0gU%2fVf65Aw_lF3I%2fAAAAAAAA6GY%2frkcyXmVTjBk%2fs1600%2fcreamy-chicken-soup.jpg&ehk=P9tLnG4U3h1qzlgEejhFGduSyqUNHls%2bjxaV2rf%2fogE%3d&risl=&pid=ImgRaw&r=0",
            itemId:9,
            name:"Cream Soup",
            rating:4.5,
            price:119,
            imageUrl:"https://th.bing.com/th/id/R.124d26ea6051f5c92fd915da8f7ad632?rik=HymfP8K20zXZiA&riu=http%3a%2f%2f4.bp.blogspot.com%2f-sMaBszxQ0gU%2fVf65Aw_lF3I%2fAAAAAAAA6GY%2frkcyXmVTjBk%2fs1600%2fcreamy-chicken-soup.jpg&ehk=P9tLnG4U3h1qzlgEejhFGduSyqUNHls%2bjxaV2rf%2fogE%3d&risl=&pid=ImgRaw&r=0",
        },
        {
            carousalImg:"https://www.thespruceeats.com/thmb/t0eJoJA-gycbURwSG1d-Ukw73_Y=/3000x2143/filters:fill(auto,1)/puree-of-carrot-soup-recipe-995947-hero-01-a7ffd893270d46cbb1e1602f7d076b45.jpg",
            itemId:9,
            name:"Puree Soup",
            rating:4.4,
            price:249,
            imageUrl:"https://www.thespruceeats.com/thmb/t0eJoJA-gycbURwSG1d-Ukw73_Y=/3000x2143/filters:fill(auto,1)/puree-of-carrot-soup-recipe-995947-hero-01-a7ffd893270d46cbb1e1602f7d076b45.jpg",
        },
        {
            carousalImg:"https://th.bing.com/th/id/OIP.6FeaL5xjogXeDaPGc84AfAHaE4?rs=1&pid=ImgDetMain",
            itemId:9,
            name:"Veloute Soup",
            rating:4.6,
            price:199,
            imageUrl:"https://th.bing.com/th/id/OIP.6FeaL5xjogXeDaPGc84AfAHaE4?rs=1&pid=ImgDetMain",
        },
        {
            carousalImg:"https://th.bing.com/th/id/OIP.T6aIb_MiqHCoMdSOhhIp-wFKC8?w=700&h=400&rs=1&pid=ImgDetMain",
            itemId:9,
            name:"Mushroom Soup",
            rating:4.1,
            price:159,
            imageUrl:"https://th.bing.com/th/id/OIP.T6aIb_MiqHCoMdSOhhIp-wFKC8?w=700&h=400&rs=1&pid=ImgDetMain",
        },
        {
            carousalImg:"https://frixospersonalchefing.com/wp-content/uploads/2020/01/20200113_104650000_iOS-min.jpg",
            itemId:9,
            name:"Vegetable Soup",
            rating:4.2,
            price:149,
            imageUrl:"https://frixospersonalchefing.com/wp-content/uploads/2020/01/20200113_104650000_iOS-min.jpg",
        },
        
        {
            carousalImg:"https://www.fmnfoods.com/wp-content/uploads/2021/06/EGG-JOLLOF-NOODLES-500x500.jpg",
            itemId:15,
            name:"EGG JOLLOF NOODLES",
            rating:4.2,
            price:79,
            imageUrl:"https://www.fmnfoods.com/wp-content/uploads/2021/06/EGG-JOLLOF-NOODLES-500x500.jpg",
        },
        {
            carousalImg:"https://christieathome.com/wp-content/uploads/2021/02/Hoisin-Chicken-Noodles-4-b-460x460.jpg",
            itemId:15,
            name:"Hoisin Chicken Noodles",
            rating:4.8,
            price:129,
            imageUrl:"https://christieathome.com/wp-content/uploads/2021/02/Hoisin-Chicken-Noodles-4-b-460x460.jpg",
        },
        {
            carousalImg:"https://th.bing.com/th/id/OIP.rn9J6baDvl1FavbC2ckfIQAAAA?w=320&h=320&rs=1&pid=ImgDetMain",
            itemId:15,
            name:"Gochujang Noodles",
            rating:4.1,
            price:89,
            imageUrl:"https://th.bing.com/th/id/OIP.rn9J6baDvl1FavbC2ckfIQAAAA?w=320&h=320&rs=1&pid=ImgDetMain",
        },
        {
            carousalImg:"https://th.bing.com/th/id/OIP.qzpJaJK1wTXE5Le7sZGhkwHaHa?w=480&h=480&rs=1&pid=ImgDetMain",
            itemId:15,
            name:"Mushroom Noodles",
            rating:4.3,
            price:99,
            imageUrl:"https://th.bing.com/th/id/OIP.qzpJaJK1wTXE5Le7sZGhkwHaHa?w=480&h=480&rs=1&pid=ImgDetMain",
        },
        {
            carousalImg:"https://th.bing.com/th/id/OIP.9MTqQH1w4fPYC7GEmeBWfAHaHa?w=768&h=768&rs=1&pid=ImgDetMain",
            itemId:15,
            name:"Spicy Miso Beef Noodles",
            rating:4.1,
            price:159,
            imageUrl:"https://th.bing.com/th/id/OIP.9MTqQH1w4fPYC7GEmeBWfAHaHa?w=768&h=768&rs=1&pid=ImgDetMain",
        },
        {
            carousalImg:"https://th.bing.com/th/id/R.77702b288e79617b9b986dddbbd24fd5?rik=IM8JGbWMCqIbNw&riu=http%3a%2f%2fi2.wp.com%2fwww.carveyourcraving.com%2fwp-content%2fuploads%2f2016%2f01%2fhakkanoodles2.jpg&ehk=BcI4ZPXoVqgpDt78%2fipyMrwuTehhT2COuiDQMbrXKcA%3d&risl=&pid=ImgRaw&r=0",
            itemId:15,
            name:"Veg Noodles",
            rating:4.2,
            price:69,
            imageUrl:"https://th.bing.com/th/id/R.77702b288e79617b9b986dddbbd24fd5?rik=IM8JGbWMCqIbNw&riu=http%3a%2f%2fi2.wp.com%2fwww.carveyourcraving.com%2fwp-content%2fuploads%2f2016%2f01%2fhakkanoodles2.jpg&ehk=BcI4ZPXoVqgpDt78%2fipyMrwuTehhT2COuiDQMbrXKcA%3d&risl=&pid=ImgRaw&r=0",
        },
        
        {
            carousalImg:"https://th.bing.com/th/id/OIP.j6Psxcnr-Qi95BOtJlv0_AHaE8?w=1500&h=1000&rs=1&pid=ImgDetMain",
            itemId:17,
            name:"Strawberry Yogurt Salad",
            rating:4.3,
            price:129,
            imageUrl:"https://th.bing.com/th/id/OIP.j6Psxcnr-Qi95BOtJlv0_AHaE8?w=1500&h=1000&rs=1&pid=ImgDetMain",
        },
        {
            carousalImg:"https://www.thegraciouspantry.com/wp-content/uploads/2020/06/spinach-salad-recipe-v-2-copy-400x400.jpg",
            itemId:17,
            name:"Spinach Salad",
            rating:4.1,
            price:99,
            imageUrl:"https://www.thegraciouspantry.com/wp-content/uploads/2020/06/spinach-salad-recipe-v-2-copy-400x400.jpg",
        },
        {
            carousalImg:"https://thewholecook.com/wp-content/uploads/2019/04/Berry-Avocado-Salad-horizontal-by-The-Whole-Cook-500x500.jpg",
            itemId:17,
            name:"Berry Avocado Salad",
            rating:4.5,
            price:119,
            imageUrl:"https://thewholecook.com/wp-content/uploads/2019/04/Berry-Avocado-Salad-horizontal-by-The-Whole-Cook-500x500.jpg",
        },
        {
            carousalImg:"https://th.bing.com/th/id/OIP.FNjVoCfdXzJOst83VYxwlQHaG7?w=800&h=748&rs=1&pid=ImgDetMain",
            itemId:17,
            name:"Summer Berry Salad",
            rating:4.3,
            price:99,
            imageUrl:"https://th.bing.com/th/id/OIP.FNjVoCfdXzJOst83VYxwlQHaG7?w=800&h=748&rs=1&pid=ImgDetMain",
        },
        {
            carousalImg:"https://www.hauteandhealthyliving.com/wp-content/uploads/2023/08/waldorf-salad-with-grapes-4-1-700x874.jpg",
            itemId:17,
            name:"Waldorf Salad with Grapes",
            rating:4.1,
            price:129,
            imageUrl:"https://www.hauteandhealthyliving.com/wp-content/uploads/2023/08/waldorf-salad-with-grapes-4-1-700x874.jpg",
        },
        {
            carousalImg:"https://www.savorynothings.com/wp-content/uploads/2022/06/broccoli-salad-recipe-image-step-3-600x800.jpg",
            itemId:17,
            name:"Loaded Broccoli Salad",
            rating:4.2,
            price:99,
            imageUrl:"https://www.savorynothings.com/wp-content/uploads/2022/06/broccoli-salad-recipe-image-step-3-600x800.jpg",
        },
    ]
    try{
        const result=await RecipeMenuListDetails.insertMany(MenuListData)
        res.status(200).send(result)
        console.log(result)
    }
    catch(error){
        res.status(400).send(error.message)
    }
    
})

app.get("/recipeslist/:itemId",async(req,res)=>{
    const itemId = req.params.itemId;
    try{
        const data=await RecipeMenuListDetails.find({itemId : itemId})

        if(!data){
            res.status(404).send({message : "Data Not Found"})
        }
        res.status(200).send(data)
        console.log("Data Fetched Successfully !!")
    }
    catch(error){
        res.status(500).send({message:"Network Error"})
        console.log("Network Error")
    }
})