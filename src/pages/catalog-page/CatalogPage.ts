import { Product, ProductPagedQueryResponse } from '@commercetools/platform-sdk';
import Page from '../../components/templates/Page';
import { ProjectPages } from '../../types/Enums';
import QueryProducts from '../../backend/products/QueryProducts';
import Constants from '../../utils/Constants';
import DOMHelpers from '../../utils/DOMHelpers';
import PromiseHelpers from '../../utils/PromiseHelpers';
import CatalogPageFilters from './CatalogPageFilters';

class CatalogPage extends Page {
  private CATALOG_PAGE_MARKUP = `
    <div class="catalog__container">
      <h1 class='page-title'>Search results:</h1>
      <div class='catalog-filters'>
      <div class='filters-wrapper'>
        <div class="price-filter filter">
          <h2 class='filter-header'>Price range</h2>
          <input type="range" class="price-slider" min="0" max="2000" value="0">
          <output for="price-slider" class="price-output">0</output>
       </div>
       <div class="brand-filter filter">
          <h2 class='filter-header'>Brand</h2>
          <select class="brand-select filter-select">
            <option value="brand-default" selected>Select brand</option>
          </select>
        </div>
        <div class="type-filter filter">
          <h2 class='filter-header'>Type</h2>
          <select class="type-select filter-select">
            <option value="type-default" selected>Select type</option>
         </select>
        </div>
        <div class="launch-date-filter filter">
          <h2 class='filter-header'>Launch date</h2>
          <select class="type-launch-date filter-select">
            <option value="type-default" selected>Select Launch date</option>
         </select>
        </div>
        <div class="on-sale-filter filter">
          <h2 class='filter-header'>On sale</h2>
          <input type='checkbox' class='input-on-sale'>
        </div>
        </div>
      </div>
      <div class='product-container'></div>
    </div>`;

  constructor() {
    super(ProjectPages.Catalog);
  }

  static convertProductPrice(price: number): string {
    if (price !== undefined) {
      const dollars = Math.floor(price / 100);
      const cents = (price % 100).toString().padStart(2, '0');
      return `${dollars}.${cents}$`;
    }
    return '0';
  }

  static getProductPrice(product: Product): string {
    const priceInCents = product.masterData.current.masterVariant.prices?.[0].value.centAmount as number;
    return this.convertProductPrice(priceInCents);
  }

  static getProductDiscountedPrice(product: Product): string {
    const discountedPriceInCents = product.masterData.current.masterVariant.prices?.[0].discounted?.value
      .centAmount as number;
    return this.convertProductPrice(discountedPriceInCents);
  }

  static buildPriceContainer(productPrice: string, productDiscountedPrice: string): string {
    if (productPrice && Number(productDiscountedPrice.split('$')[0]) > 0) {
      return `<span class='product-price price-strikethrough'>${productPrice}</span>
              <span class='product-discounted-price'>${productDiscountedPrice}</span>`;
    }
    return `<span class='product-price'>${productPrice}</span>`;
  }

  private buildProductCard(product: Product, parentContainer: HTMLDivElement): void {
    const usLocaleKey = 'en-US';
    const productElement = DOMHelpers.createElement('div', {
      className: `${product.id} ${Constants.PRODUCT_ITEM_CLASSNAME}`,
    }) as Element;
    const productKey = product.key as string;
    const productName = product.masterData.current.name[usLocaleKey];
    const productDescription = product.masterData.current.description?.[usLocaleKey];
    const { url: imageURL, label: imageLabel } = product.masterData.current.masterVariant.images?.[0] ?? {
      url: Constants.IMAGE_NOT_FOUND_MOCK_IMAGE,
      label: Constants.IMAGE_NOT_FOUND_LABEL,
    };
    const productPriceContainer = CatalogPage.buildPriceContainer(
      CatalogPage.getProductPrice(product),
      CatalogPage.getProductDiscountedPrice(product),
    );
    productElement.innerHTML = `
            <img class="${productKey} ${Constants.PRODUCT_IMAGE_CLASSNAME}" src="${imageURL}" alt="${
              imageLabel || Constants.IMAGE_NOT_FOUND_LABEL
            }">
            <h2 class="${productKey} ${Constants.PRODUCT_TITLE_CLASSNAME}">${productName}</h2>
            <p class="${productKey} ${Constants.PRODUCT_DESCRIPTION_CLASSNAME}">${
              productDescription || Constants.PRODUCT_DESCRIPTION_NOT_FOUND
            }</p> 
            <div class='${Constants.PRICE_CONTAINER_CLASSNAME}'>${productPriceContainer}</div>
            <a class=${Constants.PRODUCT_BUTTON_CLASSNAME} href='#product/${productKey}'>${
              Constants.CART_BUTTON_TEXT
            }</a>`;
    parentContainer.appendChild(productElement);
  }

  private fillProductCatalog(): void {
    const productContainer = this.CONTAINER.querySelector('.product-container') as HTMLDivElement;
    new QueryProducts()
      .queryProductList(30)
      .then((queriedProductList: ProductPagedQueryResponse): void => {
        queriedProductList.results.forEach((product: Product): void => {
          this.buildProductCard(product, productContainer);
        });
      })
      .catch((error: Error): void => {
        PromiseHelpers.catchBlockHelper(error, Constants.FETCH_CATALOG_ERROR);
      });
  }

  private onProductClick(): void {
    this.CONTAINER.addEventListener('click', (event: Event): void => {
      const productClicked = event.target as Element | null;
      const productItem = productClicked?.closest('.product-item') as Element | null;

      if (productItem) {
        const productId = productItem.classList[0];
        window.location.hash = `#product/${productId}`;
      }
    });
  }

  public renderPage(): HTMLElement {
    this.CONTAINER.innerHTML = this.CATALOG_PAGE_MARKUP;
    this.fillProductCatalog();
    this.onProductClick();
    CatalogPageFilters.initAllFilters(this.CONTAINER);
    return this.CONTAINER;
  }
}

export default CatalogPage;
