import ProductGrid from "./ProductGrid.js";

$(document).ready(function () {
  let options = {
    jsonUrl: "data/product.json",
    footerContainer: "footer",
    mainContainer: "#display",
    filterContainer: "#filterhead",
    displayContainer: "#result",
    styleClassName:   "card",
  }

  let shop = new ProductGrid(options);
  shop.init();
});
