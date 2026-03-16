function toggleMenu(){
  const drawer=document.getElementById("drawer")
  const overlay=document.getElementById("overlay")

  const open=drawer.classList.contains("open")

  if(open){
    drawer.classList.remove("open")
    overlay.classList.remove("show")
    document.body.style.overflow=""
  }else{
    drawer.classList.add("open")
    overlay.classList.add("show")
    document.body.style.overflow="hidden"
  }
}
