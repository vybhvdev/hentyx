
function toggleMenu(){
 const drawer=document.getElementById("drawer")
 drawer.classList.toggle("open")
}

document.addEventListener("DOMContentLoaded",()=>{

 const drawer=document.getElementById("drawer")
 const close=document.getElementById("drawerClose")

 if(close){
  close.onclick=()=>drawer.classList.remove("open")
 }

 document.addEventListener("click",(e)=>{
  const menu=document.querySelector(".menu")
  if(!drawer.contains(e.target) && !menu.contains(e.target)){
   drawer.classList.remove("open")
  }
 })

 const random=document.getElementById("randomGallery")

 if(random){
  random.onclick=async (e)=>{
   e.preventDefault()
   const r=await fetch("/api/galleries?page="+(Math.floor(Math.random()*50)+1))
   const d=await r.json()
   const g=d.items[Math.floor(Math.random()*d.items.length)]
   location.href="/gallery.html?id="+g.id
  }
 }

})
