const express=require("express")
const {Low}=require("lowdb")
const {JSONFile}=require("lowdb/node")
const compression=require("compression")
const rateLimit=require("express-rate-limit")

const app=express()

const adapter=new JSONFile("data/galleries.json")
const db=new Low(adapter,[])

async function init(){
 await db.read()
 if(!db.data) db.data=[]
}
init()

app.use(compression())

app.use(rateLimit({
 windowMs:60*1000,
 max:100
}))

app.use(express.static("public"))

const PAGE_SIZE=40

app.get("/api/galleries",async(req,res)=>{
 await db.read()

 const page=parseInt(req.query.page||"1")
 const start=(page-1)*PAGE_SIZE
 const end=start+PAGE_SIZE

 const total=db.data.length

 res.json({
  page,
  totalPages:Math.ceil(total/PAGE_SIZE),
  items:db.data.slice(start,end)
 })
})

app.get("/api/gallery/:id",async(req,res)=>{
 await db.read()
 const g=db.data.find(x=>x.id==req.params.id)
 res.json(g)
})

app.listen(process.env.PORT||3000,()=>{
 console.log("Hentyx running")
})
