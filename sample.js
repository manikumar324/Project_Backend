const express=require('express');
const app=express();


app.use(express.json())
app.listen(5000,()=>console.log("Server Running ......"))

app.get('/',(request,response)=>{
    response.send("<h1>Success</h1>")
})

const teams=[
    {
        id:1,
        name:"RCB"
    },
    {
        id:2,
        name:"CSK"
    },
    {
        id:3,
        name:"MI"
    },
    {
        id:4,
        name:"KKR"
    },
    {
        id:5,
        name:"GT"
    }
]

app.get('/iplteams',(request,response)=>{
    response.send(teams)
})

app.get('/iplteams/:id',(req,res)=>{
    const newData=teams.filter(item=>item.id.toString() === req.params.id)
    res.send(newData)
})

app.post('/addteam',(req,res)=>{
    const{id,name}=req.body;
    console.log(id,name);
    res.send("Data Stored")
})
