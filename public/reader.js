
function updateReaderSchema(title, pages) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": title,
    "numberOfPages": pages,
    "author": { "@type": "Organization", "name": "Hentyx" }
  };
  
  const schemaEl = document.getElementById('reader-schema');
  if (schemaEl) {
    schemaEl.textContent = JSON.stringify(schema);
  }
}
