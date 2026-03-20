
// Add this function to populate schema
function updateGallerySchema(gallery) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `https://hentyx.vercel.app/?id=${gallery.id}`,
    "name": gallery.title,
    "image": gallery.images?.[0] || "https://hentyx.vercel.app/og-image.svg",
    "numberOfPages": gallery.pages,
    "keywords": (gallery.tags || []).join(", "),
    "inLanguage": "en"
  };
  
  const schemaEl = document.getElementById('gallery-schema');
  if (schemaEl) {
    schemaEl.textContent = JSON.stringify(schema);
  }
}

// Call updateGallerySchema(galleryData) when you fetch gallery data
