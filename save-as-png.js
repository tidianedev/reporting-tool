const  fs = require('fs');
const svg2png = require('svg2png');

fs.readFile('./icon.svg', (err, data) => {
  if (err) throw err;
  svg2png(data, { width: 1024, height: 1024 })
    .then(buffer => fs.writeFile('./icon.png', buffer, err => {
      if (err) throw err;
      console.log('PNG saved!');
    }))
    .catch(e => console.error(e));
});