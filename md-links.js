const fs = require('fs');
const path = require('path');
const axios = require('axios');

function mdLinks(filePath, options = { validate: false }) {
  const absolutePath = path.resolve(filePath);
  
  return new Promise((resolve, reject) => {
    fs.stat(absolutePath, (err, stats) => {
      if (err) {
        reject(err);
        return;
      }

      if (stats.isDirectory()) {
        const files = getMdFilesFromDirectory(absolutePath);
        
        const promises = files.map(file => readMdFile(file, options));
        Promise.all(promises)
          .then(results => {
            const links = results.reduce((acc, result) => acc.concat(result), []);

            resolve(links);
          })
          .catch(reject);
      } else {
        readMdFile(absolutePath, options)
          .then(resolve)
          .catch(reject);
      }
    });
  });
}

function getMdFilesFromDirectory(directory) {
  return fs.readdirSync(directory).filter(file => path.extname(file) === '.md')
    .map(file => path.join(directory, file));
}

function readMdFile(filePath, options) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      const links = extractLinks(data, filePath);
      if (!options.validate && !options.stats) {
        resolve(links);
        return;
      }

      const linkPromises = links.map(link => validateLink(link));
      Promise.all(linkPromises)
        .then(validatedLinks => resolve(validatedLinks))
        .catch(reject);
    });
  });
}


function extractLinks(data, file) {
  const regex = /\[([^\]]+)\]\((http[s]?:\/\/[^\)]+)\)/g;
  const links = [];
  let match;
  while ((match = regex.exec(data)) !== null) {
    const [, text, href] = match;
    links.push({ href, text, file });
  }
  return links;
}

function validateLink(link) {
  return new Promise((resolve, reject) => {
    axios.head(link.href)
      .then(response => {
        const { status } = response;
        link.status = status;
        link.ok = status >= 200 && status < 400 ? 'ok' : 'fail';
        resolve(link);
      })
      .catch(error => {
        if (error.response) {
          const { status } = error.response;
          link.status = status;
          link.ok = 'fail';
          resolve(link);
        } else {
          link.status = 404;
          link.ok = 'fail';
          resolve(link);
        }
      });
  });
}

module.exports = mdLinks;
