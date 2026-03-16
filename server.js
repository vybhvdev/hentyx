const express=require("express"),compression=require("compression"),fs=require("fs"),app=express();
app.use(compression()); app.use(express.static("public"));
const localData=JSON.parse(fs.readFileSync("data/galleries.json","utf8"));
app.get("/api/galleries",(req,res)=>{
  const q=req.query.q?.toLowerCase();
  let results=localData;
  if(q) results=localData.filter(g=>g.title.toLowerCase().includes(q)||g.tags.some(t=>t.toLowerCase().includes(q)));
  const page=parseInt(req.query.page||"1"),per=25;
  res.json({items:results.slice((page-1)*per,page*per),totalPages:Math.ceil(results.length/per)});
});
app.get("/api/gallery/:id",(req,res)=>{
  const g=localData.find(x=>x.id==req.params.id);
  g?res.json(g):res.status(404).send("Not Found");
});
app.listen(process.env.PORT||3000);
