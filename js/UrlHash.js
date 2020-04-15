export default class UrlHash
{
  constructor(urlHash)
  {
    this.url = new URLSearchParams(urlHash.replace("#", ""));

    this.pageSize = Number(this.url.get("pageSize")) || 3;
    this.selectedIndex = this.pageSize/3 - 1;
    this.brandFilter = this.url.get("brand") ? new Set(this.url.get("brand").split(", ")) : new Set();
    this.colorFilter = this.url.get("color") ? new Set(this.url.get("color").split(", ")) : new Set();
    this.showAvailable = this.url.get("showAvailable");
    this.displayPage = this.url.get("displayPage") || 1;
  }
}