const got = require("got");
const htmlparser = require ("htmlparser2");
const pages = {};
const pagesWithKeyword = {};
const samePageTest = {};
let count = 0;
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
      } else if (destination[0] === "/"  ) {
         pages[`${currentTarget}${destination}`] = null;
      } else samePageTest[destination] = destination;

   }
}

const handleText = (text) => {
   const targetIndex = text.indexOf(keyWord);
   if (currentDepth >=1 && targetIndex >=0 ) {
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
       * 2) save them in a array (or better some kind of a set) in format {link : html}
       * 3) crawl each of those links to find more links that does not link back to the main site
       * 4) repeat 1-3 for a given depth (start with depth = 2, i.e. repeat the steps 2 more times in addition) 
       * 5) now that we have all the pages 2 levels deep with their respective content, loop through the array/set
       *    and filter pages that has our target keyword.
       */
      currentTarget = target;
      parser.write(response.body);
      parser.end();

      if (depth < maxDepth) {
         for (let key in pages) {
            await crawl(key, depth + 1);
         }
      }
      console.log("depth:",  depth);
      
   } catch (e) {
      // console.log(e && e.response && e.response.body);
   }
}

const start = async () => {
   await crawl(initialTarget, 0);
   console.log(Object.keys(pages).length);
   console.log(Object.keys(samePageTest).length);
   console.log(Object.keys(pagesWithKeyword).length);
   for (var key in pagesWithKeyword) {
      console.log(`${key} : ${pagesWithKeyword[key]}`)
   }
}

start();