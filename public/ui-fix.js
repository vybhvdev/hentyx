document.addEventListener("DOMContentLoaded",()=>{

 const btn=document.querySelector(".menu") || document.querySelector("#menu")
 const drawer=document.querySelector(".drawer")

 if(!btn || !drawer) return

 btn.onclick=()=>{
  if(drawer.style.left==="0px"){
   drawer.style.left="-260px"
  }else{
   drawer.style.left="0px"
  }
 }

})
