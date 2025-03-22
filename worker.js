// worker.js
self.addEventListener('message', (event) => {
  const jsonData = event.data;
  // Elabora il JSON (es. funzione exploreObject)
  const result = exploreObject(jsonData);
  self.postMessage(result);
});

function exploreObject(obj) {
  let results = [];
  function recurse(o) {
    if (o && typeof o === 'object') {
      if (Array.isArray(o)) {
        o.forEach(item => recurse(item));
      } else {
        const keys = Object.keys(o);
        for (const key of keys) {
          if (key.toLowerCase() === 'descriptionmerchant') {
            results.push(o[key]);
          }
          recurse(o[key]);
        }
      }
    }
  }
  recurse(obj);
  return results;
}
