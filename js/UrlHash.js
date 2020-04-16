export default class UrlHash
{
  constructor(urlHash, productGrid)
  {
    this.url = new URLSearchParams(urlHash.replace("#", ""));
    this.productGrid = productGrid;

    this.pageSize = Number(this.url.get("pageSize")) || 3;
    this.selectedIndex = this.pageSize/3 - 1;
    this.brandFilter = this.url.get("brand") ? new Set(this.url.get("brand").split(",")) : new Set();
    this.colorFilter = this.url.get("color") ? new Set(this.url.get("color").split(",")) : new Set();
    this.showAvailable = this.url.get("showAvailable") || "false";
    this.displayPage = this.url.get("displayPage") || 1;
  }

  applyInputFilter()
  {
    this.productGrid.pageSize = this.pageSize;

    this.productGrid.$paginationSelect.prop("selectedIndex", this.selectedIndex);

    this.productGrid.showAvailable = this.showAvailable;
    if(this.productGrid.showAvailable == "true")
    {
      this.productGrid.$showAllLabelElement.trigger("click")
    }

    this.productGrid.filteredColor = this.colorFilter;
    this.productGrid.filteredBrand = this.brandFilter;  

    for(let brand of this.productGrid.filteredBrand)
    {
      $(`label[for="${brand}"]`).trigger("click")
    }
    for(let color of this.productGrid.filteredColor)
    {
      $(`label[for="${color}"]`).trigger("click")
    }

    this.productGrid.displayPage = this.displayPage;

  }

  refreshURL()
  {
    this.url.set("pageSize", this.productGrid.pageSize);
    this.url.set("showAvailable", this.productGrid.showAvailable);
    this.url.set("color", Array.from(this.productGrid.filteredColor));
    this.url.set("brand", Array.from(this.productGrid.filteredBrand));
    this.url.set("displayPage", this.productGrid.displayPage);
    window.location.hash = this.url.toString()
  }
}