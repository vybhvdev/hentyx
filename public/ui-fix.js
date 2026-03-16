function toggleMenu(){
 const drawer=document.getElementById("drawer")

 if(!drawer) return

 if(drawer.classList.contains("open")){
  drawer.classList.remove("open")
 }else{
  drawer.classList.add("open")
 }
}
