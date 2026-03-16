const express=require("express"),compression=require("compression"),rateLimit=require("express-rate-limit"),fs=require("fs"),app=express();
app.use(compression());
app.use(rateLimit({windowMs:60000,max:100}));
app.use(express.static("public"));
const getLocal=()=>{try{return JSON.parse(fs.readFileSync("data/galleries.json","utf8"))}catch(e){return []}};
async function safeFetch(url){try{const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}});return r.ok?await r.json():null}catch(e){return null}}
app.get("/api/galleries",async(req,res)=>{
const page=parseInt(req.query.page||"1"),data=await safeFetch("https://nhentai.net/api/galleries/search?page="+page);
if(!data||!data.result) return res.json({page:1,totalPages:1,items:getLocal().slice(0,25)});
res.json({page,totalPages:500,items:data.result.map(g=>({id:g.id,title:g.title.pretty,pages:g.num_pages,images:[`https://t.nhentai.net/galleries/${g.media_id}/cover.jpg`]}))});
});
app.get("/api/gallery/:id",async(req,res)=>{
const id=req.params.id,g=await safeFetch("https://nhentai.net/api/gallery/"+id);
if(!g){const l=getLocal().find(x=>x.id==id);return l?res.json(l):res.status(404).json({err:"not found"})}
res.json({id:g.id,title:g.title.pretty,pages:g.num_pages,images:g.images.pages.map((p,i)=>`https://i.nhentai.net/galleries/${g.media_id}/${i+1}.${p.t==="p"?"png":"jpg"}`)});
});
app.listen(3000,()=>console.log("Hentyx Optimized on :3000"));
