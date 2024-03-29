const got = require("got");
const htmlparser = require ("htmlparser2");
const pages = {};
const pagesWithKeyword = {};
// const samePageTest = {};
// let count = 0;
const initialTarget = "https://www.apple.com";
let currentTarget = "";
const maxDepth = 1;
let currentDepth = 0;
const keyWord = "iPhone"

const handleOpenTag= (name, attribs) => {
   if (name==="a") {
      let destination = attribs.href;
      if (destination.includes(currentTarget) ) {
         pages[destination] = null;
      } else if (destination[0] === "/" && destination.length > 0 ) {
         pages[`${initialTarget}${destination}`] = null;
      } 
      // else samePageTest[destination] = destination;

   }
}

const handleText = (text) => {
   const targetIndex = text.indexOf(keyWord);
   if (targetIndex >=0 ) {
      const startingPos = Math.max(0, targetIndex - 3);
      const endingPos = Math.min(text.length, targetIndex + keyWord.length + 3);
      pagesWithKeyword[currentTarget] = text.slice(startingPos, endingPos);
   }
}
const parser = new htmlparser.Parser({
   onopentag: handleOpenTag,
   ontext: handleText
})

const crawl = async (target, depth) => {
   currentDepth = depth;
   try {
      const response = await got(target);
      /**
       * STEPS (possible approach): 
       * 1) find all links in this page in the same domain (and may be subdomain?)
       * 2) save them in a object in format {link : null}
       * 3) check if the current page has the target keyword. Save in a separate object in format {link : keyword}
       * 4) crawl each of those links to find more links that does not link back to the main site
       */
      currentTarget = target;
      parser.write(response.body);
      parser.end();
      if (depth < maxDepth) {
         for (let key in pages) {
            await crawl(key, depth + 1);
         }
      }

      // if (depth < maxDepth) {
      //    const crawlers = Promise.all(
      //       Object.keys(pages).map(async page => {
      //             crawl(page, depth + 1);
      //       })
      //    );
      // }
      // await crawlers;
      // console.log("depth:",  depth);
      
   } catch (e) {
      // console.log(e && e.response && e.response.body);
   }
}

const start = async () => {
   await crawl(initialTarget, 0);
   console.log("pages crawled: ", Object.keys(pages).length);
   // console.log(Object.keys(samePageTest).length);
   console.log("pages with results: ", Object.keys(pagesWithKeyword).length);
   for (var key in pagesWithKeyword) {
      console.log(`${key} : ${pagesWithKeyword[key]}`)
   }
}

start();