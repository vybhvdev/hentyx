const express=require("express")
const compression=require("compression")
const rateLimit=require("express-rate-limit")
const fs=require("fs")

const app=express()

app.use(compression())
app.use(rateLimit({windowMs:60000,max:100}))
app.use(express.static("public"))

const localData=JSON.parse(fs.readFileSync("data/galleries.json","utf8"))

async function safeFetch(url){
 try{
  const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}})
  if(!r.ok) throw new Error("bad")
  return await r.json()
 }catch(e){
  return null
 }
}

app.get("/api/galleries",async(req,res)=>{
 const page=parseInt(req.query.page||"1")

 const data=await safeFetch(
  "https://nhentai.net/api/galleries/search?page="+page
 )

 if(!data||!data.result){
  return res.json({page:1,totalPages:1,items:localData})
 }

 const items=data.result.map(g=>({
  id:g.id,
  title:g.title.pretty,
  pages:g.num_pages,
  tags:g.tags.map(t=>t.name),
  images:["https://t.nhentai.net/galleries/"+g.media_id+"/cover.jpg"]
 }))

 res.json({page,totalPages:500,items})
})

app.get("/api/gallery/:id",async(req,res)=>{
 const id=req.params.id

 const g=await safeFetch("https://nhentai.net/api/gallery/"+id)

 if(!g){
  const local=localData.find(x=>x.id==id)
  if(local) return res.json(local)
  return res.status(404).json({error:"not found"})
 }

 const images=g.images.pages.map((p,i)=>{
  const ext=p.t==="p"?"png":"jpg"
  return "https://i.nhentai.net/galleries/"+g.media_id+"/"+(i+1)+"."+ext
 })

 res.json({
  id:g.id,
  title:g.title.pretty,
  pages:g.num_pages,
  tags:g.tags.map(t=>t.name),
  images
 })
})

app.listen(process.env.PORT||3000,()=>console.log("Hentyx running"))
