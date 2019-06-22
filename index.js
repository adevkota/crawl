const got = require("got");

const target = "https://www.apple.com";
const crawl = async () => {
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
      console.log(response.body);
   } catch (e) {
      console.log(e.response.body);
   }
}


crawl();