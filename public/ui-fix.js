
function toggleMenu(){
 const drawer=document.getElementById("drawer")
 drawer.classList.toggle("open")
}

/* close drawer when clicking outside */
document.addEventListener("click",(e)=>{
 const drawer=document.getElementById("drawer")
 const menu=document.querySelector(".menu")

 if(!drawer.contains(e.target) && !menu.contains(e.target)){
  drawer.classList.remove("open")
 }
})

/* random gallery */
document.addEventListener("DOMContentLoaded",()=>{
 const btn=document.getElementById("randomGallery")

 if(btn){
  btn.onclick=async ()=>{
   const r=await fetch("/api/galleries?page="+(Math.floor(Math.random()*50)+1))
   const d=await r.json()
   const g=d.items[Math.floor(Math.random()*d.items.length)]
   location.href="/gallery.html?id="+g.id
  }
 }

 /* search */
 const search=document.getElementById("searchBox")

 if(search){
  search.addEventListener("keypress",(e)=>{
   if(e.key==="Enter"){
    location.href="/?tag="+encodeURIComponent(search.value)
   }
  })
 }
})
