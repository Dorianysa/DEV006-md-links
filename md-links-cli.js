#!/usr/bin/env node

const mdLinks = require('./md-links');
const { program } = require('commander');


function printLinks(links, isValidated) {
  links.forEach(link => {
    const { href, text, file, status, ok } = link;
    if(isValidated){
      console.log(`${file} ${href} ${ok} ${status} ${text}`);
    } else {
      console.log(`${file} ${href} ${text}`);
    }
  });
}

function printStats(links) {
  const total = links.length;
  const unique = getUniqueLinks(links);
  const broken = getBrokenLinks(links);
  console.log(`Total: ${total}`);
  console.log(`Unicos: ${unique}`);
  console.log(`Rotos: ${broken}`);
}

function getUniqueLinks(links){
  const uniqueUrls = [];
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    if (!uniqueUrls.includes(link.href)) {
      uniqueUrls.push(link.href);
    }
  }
  return uniqueUrls.length;
}

function getBrokenLinks(links){
  let broken = 0;
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    if (link.ok === 'fail') {
      broken++;
    }
  }
  return broken;
}

program
  .arguments('<path-to-file>')
  .option('--validate', 'Validate the links')
  .option('--stats', 'Show link statistics')
  .action((filePath, options) => {
    mdLinks(filePath, options)
      .then(links => {
        if (options.stats) {
          printStats(links);
        } else {
          printLinks(links, options.validate);
        }
      })
      .catch(console.error);
  });

program.parse(process.argv);
