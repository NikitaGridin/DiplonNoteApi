const searchService = require("../service/searchService");

class searchController {
  async search(req, res, next){
    const {searchQuery} = req.params;
    try {
      const search = await searchService.search(searchQuery);
      res.status(200).send(search);
    } catch (error) {
      next(error)
    }
   }  
}
module.exports = new searchController();
