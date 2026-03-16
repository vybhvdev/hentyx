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

app.get("/api/galleries", async (req,res)=>{
 const page=parseInt(req.query.page||"1")
 const r=await fetch("https://nhentai.net/api/galleries/search?page="+page)
 const data=await r.json()

 const items=data.result.map(g=>({
  id:g.id,
  title:g.title.pretty,
  pages:g.num_pages,
  tags:g.tags.map(t=>t.name),
  images:["https://t.nhentai.net/galleries/"+g.media_id+"/cover.jpg"]
 }))

 res.json({
  page,
  totalPages:500,
  items
 })
}))

 res.json({
  page,
  totalPages:500,
  items
 })
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


app.get("/api/tag/:tag", async (req,res)=>{
 const tag=req.params.tag
 const page=parseInt(req.query.page||"1")

 const r=await fetch(
  "https://nhentai.net/api/galleries/search?query="+tag+"&page="+page
 )

 const data=await r.json()

 const items=data.result.map(g=>({
  id:g.id,
  title:g.title.pretty,
  pages:g.num_pages,
  tags:g.tags.map(t=>t.name),
  images:["https://t.nhentai.net/galleries/"+g.media_id+"/cover.jpg"]
 }))

 res.json({
  page,
  totalPages:500,
  items
 })
})


app.get("/api/tag/:tag", async (req,res)=>{
 const tag=req.params.tag
 const page=parseInt(req.query.page||"1")

 const r=await fetch(
  "https://nhentai.net/api/galleries/search?query="+tag+"&page="+page
 )

 const data=await r.json()

 const items=data.result.map(g=>({
  id:g.id,
  title:g.title.pretty,
  pages:g.num_pages,
  tags:g.tags.map(t=>t.name),
  images:["https://t.nhentai.net/galleries/"+g.media_id+"/cover.jpg"]
 }))

 res.json({
  page,
  totalPages:500,
  items
 })
})
