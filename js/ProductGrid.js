import Product from './Product.js';
import Display from './Display.js';
import UrlHash from './UrlHash.js';

export default class ProductGrid {
  constructor(options) {
    this.data    = [];
    this.productList = [];
    this.uniqueColor = [];
    this.uniqueBrand = [];
    // this.showAvailable = false;
    this.filteredColor = new Set();
    this.filteredBrand = new Set();
    this.jsonUrl = options.jsonUrl;
    this.$mainContainer    = $(options.mainContainer);
    this.$footerContainer  = $(options.footerContainer);
    this.$filterContainer  = this.$mainContainer.find($(options.filterContainer));
    this.$displayContainer = this.$mainContainer.find($(options.displayContainer));
    this.styleClassName    = options.styleClassName;
    this.filterByAttribute = options.filterByAttribute;
    this.itemToDisplay     = [];
    this.urlHash = new UrlHash(window.location.hash);
  }

  init() {
    $.ajax({
      url: this.jsonUrl,
      type: "get",
      dataType: "json",
      error: function(){
        window.alert("Page not found #404!!!!!!!!");
      },
      success: (data) => {
        this.data = data;
        this.makePagination();
        this.createProducts();
        this.createFilterArrays();
        this.applyCustomFilter();
        this.filterItems();
        $("a#"+this.urlHash.displayPage).trigger("click");
      }
    });
  }

  applyCustomFilter()
  {
    this.pageSize = this.urlHash.pageSize;
    $("select").prop("selectedIndex", this.urlHash.selectedIndex);

    this.showAvailable = this.urlHash.showAvailable;
    if(this.showAvailable == "true")
    {
      $("label[for=sold_out]").trigger("click")
    }

    this.filteredColor = this.urlHash.colorFilter;
    this.filteredBrand = this.urlHash.brandFilter;  

    for(let brand of this.urlHash.brandFilter)
    {
      $(`label[for="${brand}"]`).trigger("click")
    }
    for(let color of this.urlHash.colorFilter)
    {
      $(`label[for="${color}"]`).trigger("click")
    }

  }

  makePagination()
  {
    let pages = [3,6,9];
    let $paginationSelect = $("<select id=pagination></select>");
    pages.forEach((item) => {
      let pagination =
      $("<option>", {id: item}).text(item)
        .on("click", () => {
          this.pageSize = item;
          this.urlHash.url.delete("pageSize");
          this.urlHash.url.set("pageSize", item);
          window.location.hash = this.urlHash.url.toString()
          this.filterItems();
        })

      $paginationSelect.append(pagination)
    })

    this.$filterContainer
      .append("<br>")
      .append($paginationSelect);

  }

  filterItems()
  {
    this.itemToDisplay = this.productList;
    if(this.showAvailable == "true")
    {
      this.urlHash.url.set("showAvailable", "true");
      this.itemToDisplay = this.productList.filter((item) => { return (item.sold_out == 0) })
    }
    else
    {
      this.urlHash.url.set("showAvailable", "false");
    }
    window.location.hash = this.urlHash.url.toString();

    if(this.filteredColor.size > 0)
    {
      this.urlHash.url.delete("color");
      this.urlHash.url.append("color", Array.from(this.filteredColor));
      this.itemToDisplay = this.itemToDisplay.filter((item) => { return this.filteredColor.has(item.color)} )
    }
    else
    {
      this.urlHash.url.delete("color");
    }
    window.location.hash = this.urlHash.url.toString();
    if(this.filteredBrand.size > 0)
    {
      this.urlHash.url.delete("brand");
      this.urlHash.url.append("brand", Array.from(this.filteredBrand));
      this.itemToDisplay = this.itemToDisplay.filter((item) => { return this.filteredBrand.has(item.brand)} )
    }
    else
    {
      this.urlHash.url.delete("brand");
    }
    window.location.hash = this.urlHash.url.toString();

    this.addPagination();
  }

  addPagination()
  {
    let pagewiseProducts = [];
    let count = 1;

    this.$footerContainer.children().detach();
    for(let index = 0; index < this.itemToDisplay.length; index += this.pageSize, count++)
    {
      pagewiseProducts.push(this.itemToDisplay.slice(index, index+this.pageSize));
      let $pageIndex = $('<a>',{id: count, text: count})
      .on("click", (event) => {
        this.urlHash.url.delete("displayPage");
        this.urlHash.url.set("displayPage", event.target.text);
        window.location.hash = this.urlHash.url.toString()
        Display.show(pagewiseProducts[event.target.text-1], this.$displayContainer, this.styleClassName);
        $(event.target).addClass("highlight").siblings().removeClass("highlight");
      })

      this.$footerContainer.append($pageIndex);
    }

    this.$footerContainer.children().first().addClass("highlight");
    Display.show(pagewiseProducts[0], this.$displayContainer, this.styleClassName);
  }

  createProducts()
  {
    this.data.forEach(item => {
      let product = new Product(item);
      this.productList.push(product);
    })
  }

  createFilterArrays()
  {
    this.productList.forEach((item) => {
      this.uniqueColor.push(item.color);
      this.uniqueBrand.push(item.brand);
    });

    this.uniqueBrand = this.uniqueSort(this.uniqueBrand);
    this.uniqueColor = this.uniqueSort(this.uniqueColor);
    this.addFilters(this.uniqueBrand, this.uniqueColor);
  }

  addFilters(brandArrays, colorArrays)
  {
    this.makeFilterChechboxes(brandArrays, "brand");
    this.makeFilterChechboxes(colorArrays, "color");
    this.makeShowAllToggle();
  }

  makeFilterChechboxes(categoryArray, category)
  {
    categoryArray.forEach((categoryItem) => {
      let $itemInputElement = $("<input>", { type: "checkbox", id: categoryItem, class: category })
        .on("click", () => this.addFiltering() );
      let $itemLabelElement = $("<label>", { for: categoryItem, text: categoryItem});
      this.$filterContainer
        .append($("<br>"))
        .append($itemInputElement)
        .append($itemLabelElement)
    })
  }

  makeShowAllToggle()
  {
    let $itemInputElement = $("<input>", { type: "checkbox",id: "sold_out", class: "sold_out" })
      .on("click", () => this.addFiltering() );
    let $itemLabelElement = $("<label>", { for: "sold_out", text: "Show Available"});
    this.$filterContainer
      .append($("<br>"))
      .append($itemInputElement)
      .append($itemLabelElement)
  }

  addFiltering()
  {
    let checkbox = $(event.target);
    let category = checkbox.attr("id");
    let categoryType = checkbox.attr("class");
    if(categoryType == "sold_out")
    {
      checkbox.is(':checked') ? this.showAvailable = "true" : this.showAvailable = "false";
    }
    else if(categoryType == "brand")
    {
      checkbox.is(':checked') ? this.filteredBrand.add(category) : this.filteredBrand.delete(category)
    }
    else if(categoryType == "color")
    {
      checkbox.is(':checked') ? this.filteredColor.add(category) : this.filteredColor.delete(category)
    }
    this.filterItems();
  }

  uniqueSort(arrayList)
  {
    let setList = new Set();
    arrayList.forEach((item) => setList.add(item) );

    return arrayList = Array.from(setList)
      .sort( (a,b) => this.sortArrayFunction(a, b));
  }

  sortArrayFunction(a, b)
  {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  }
}