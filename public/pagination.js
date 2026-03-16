let page=1
const grid=document.getElementById("grid")

const pager=document.createElement("div")
pager.style.textAlign="center"
pager.style.padding="20px"
document.body.appendChild(pager)

function load(){

 fetch("/api/galleries?page="+page)
 .then(r=>r.json())
 .then(data=>{

  data.items.forEach(g=>{

   const el=document.createElement("div")
   el.className="card"

   el.innerHTML=
   "<a href='gallery.html?id="+g.id+"'>"+
   "<img loading='lazy' src='"+g.images[0]+"'>"+
   "<p>"+g.title+"</p>"+
   "</a>"

   grid.appendChild(el)

  })

  pager.innerHTML=""

  if(page<data.totalPages){

   const next=document.createElement("button")

   next.innerText="Next Page"

   next.style.padding="10px 16px"
   next.style.background="#222"
   next.style.color="white"
   next.style.border="0"
   next.style.borderRadius="6px"

   next.onclick=()=>{
    page++
    load()
   }

   pager.appendChild(next)

  }

 })

}

load()
