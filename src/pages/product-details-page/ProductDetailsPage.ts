import { Image, Product } from '@commercetools/platform-sdk';
import Page from '../../components/templates/Page';
import { ProjectPages } from '../../types/Enums';
import Constants from '../../utils/Constants';
import QueryDetails from '../../backend/products/QueryProductDetails';
import ToastifyHelper from '../../utils/TostifyHelper';
import DOMHelpers from '../../utils/DOMHelpers';
import CatalogPage from '../catalog-page/CatalogPage';
import Slider from '../../components/slider/Slider';

class ProductDetailsPage extends Page {
  private readonly PRODUCT_PAGE_ID: string;

  private PRODUCT_PAGE_MARKUP = `
    <h1 class="page-title">Product page</h1>
    <div class="product-details-container"></div>
  `;

  constructor(pageId: string) {
    super(ProjectPages.ProductDetails);
    this.PRODUCT_PAGE_ID = pageId;
  }

  private buildProductDetails(product: Product, parentContainer: HTMLDivElement): void {
    const productElement: HTMLElement = DOMHelpers.createElement('div', {
      className: `${this.PRODUCT_PAGE_ID} ${Constants.PRODUCT_CONTENT_CLASSNAME}`,
    });
    const usLocaleKey = 'en-US';
    const productKey: string = product.key as string;
    const productName: string = product.masterData.current.name[usLocaleKey];
    const productDescription: string | undefined = product.masterData.current.description?.[usLocaleKey];
    const productImages = product.masterData.current.masterVariant.images as Image[];
    const productPriceContainer: string = CatalogPage.buildPriceContainer(
      CatalogPage.getProductPrice(product),
      CatalogPage.getProductDiscountedPrice(product),
    );

    const slider: Slider = new Slider(productImages);
    productElement.innerHTML = `
      <div class="${productKey} ${Constants.PRODUCT_TEXT_CLASSNAME}">
        <h2 class="${productKey} ${Constants.PRODUCT_TITLE_CLASSNAME}">${productName}</h2>
        <p class="${productKey} ${Constants.PRODUCT_DESCRIPTION_CLASSNAME}">  ${
          productDescription || Constants.PRODUCT_DESCRIPTION_NOT_FOUND
        }</p>
        <div class="${Constants.PRICE_CONTAINER_CLASSNAME}">${productPriceContainer}</div>
        <a class=${Constants.PRODUCT_BUTTON_CLASSNAME} href='#product/${productKey}'>${Constants.CART_BUTTON_TEXT}</a>
      </div>
    `;
    productElement.prepend(slider.render());
    parentContainer.appendChild(productElement);
  }

  private fillProductDetails(): void {
    const productContainer = this.CONTAINER.querySelector('.product-details-container') as HTMLDivElement;
    new QueryDetails()
      .queryProductDetails(this.PRODUCT_PAGE_ID)
      .then((queriedProductDetails: Product): void => {
        this.buildProductDetails(queriedProductDetails, productContainer);
      })
      .catch((error: Error): void => {
        const errorMessage: string =
          error.message === Constants.FAILED_TO_FETCH_ERROR_MESSAGE ? Constants.FETCH_CATALOG_ERROR : error.message;
        ToastifyHelper.showToast(errorMessage, Constants.TOAST_COLOR_RED);
      });
  }

  public renderPage(): HTMLElement {
    this.CONTAINER.innerHTML = this.PRODUCT_PAGE_MARKUP;
    this.fillProductDetails();
    return this.CONTAINER;
  }
}

export default ProductDetailsPage;
