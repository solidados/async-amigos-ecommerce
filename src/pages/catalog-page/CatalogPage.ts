import {
  CartPagedQueryResponse,
  LineItem,
  Product,
  ProductPagedQueryResponse,
  ProductType,
  ProductTypePagedQueryResponse,
} from '@commercetools/platform-sdk';
import Page from '../../components/templates/Page';
import { ProjectPages } from '../../types/Enums';
import QueryProducts from '../../backend/products/QueryProducts';
import Constants from '../../utils/Constants';
import PromiseHelpers from '../../utils/PromiseHelpers';
import CatalogPageFilters from './CatalogPageFilters';
import ProductCardBuilder from './ProductCardBuilder';
import CatalogPageSort from './CatalogPageSort';
import Breadcrumbs from '../../components/breadcrumbs/Breadcrumbs';
import DOMHelpers from '../../utils/DOMHelpers';
import CustomerCart from '../../backend/cart/CustomerCart';
import LocalStorage from '../../utils/LocalStorage';
import TostifyHelper from '../../utils/TostifyHelper';

class CatalogPage extends Page {
  private CATALOG_PAGE_MARKUP = `
    <div class="catalog__container">
      <div class='breadcrumb'></div>
      <div class='categories-container'>
        <h2 class='categories-header'>Our Categories:</h2>
        <div class='categories-links'></div>
      </div>
      <div class='catalog-filters'>
      <div class='filters-wrapper'>
        <div class="price-filter filter">
          <h2 class='filter-header'>Price range</h2>
          <div class='price-wrapper'>
          <input type="number" class="price-min price-inp" min='0' max='9999' placeholder='Min'>
          <input type="number" class="price-max price-inp" min='0' max='9999' placeholder='Max'>
            </div>
       </div>
       <div class="brand-filter filter">
          <h2 class='filter-header'>Brand</h2>
          <select class="brand-select filter-select">
            <option value="brand-default" selected disabled>Select brand</option>
          </select>
        </div>
        <div class="type-filter filter">
          <h2 class='filter-header'>Type</h2>
          <select class="type-select filter-select">
            <option value="type-default" selected disabled>Select type</option>
         </select>
        </div>
        <div class="launch-date-filter filter">
          <h2 class='filter-header'>Launch date</h2>
          <select class="type-launch-date filter-select">
            <option value="type-default" selected disabled>Select Launch date</option>
         </select>
        </div>
        <div class="on-sale-filter filter">
          <h2 class='filter-header'>On sale</h2>
          <input class='on-sale-checkbox' type='checkbox'>
        </div>
        <button class='reset-filter-button'>Reset Filter/Sort</button>
        </div>
      </div>
       <div class="sorting-block">
          <div class="sorting-options">
            <select class="sort-by">
              <option class='sort-option' value="price-def" selected disabled>Sort Catalog By</option>
              <option class='sort-option' value="price asc">Price (ascending)</option>
              <option class='sort-option' value="price desc">Price (descending)</option>
              <option class='sort-option' value="name.en-us asc">Name (alphabetically)</option>
              <option class='sort-option' value="name.en-us desc">Name (alphabetically reversed)</option>
            </select>
           </div>
           <div class="search-container">
              <input class='search-field' type="text" placeholder="Search...">
           </div>
         </div>
      <div class='product-container'></div>
      <div class='pag-pages'></div>
    </div>`;

  constructor() {
    super(ProjectPages.Catalog);
  }

  private fillProductCatalog = (page = 1): void => {
    const productContainer = this.CONTAINER.querySelector('.product-container') as HTMLDivElement;
    new QueryProducts()
      .queryProductList(page, 9)
      .then((queriedProductList: ProductPagedQueryResponse): void => {
        queriedProductList.results.forEach((product: Product): void => {
          ProductCardBuilder.buildProductCard(product, productContainer);
        });
      })
      .then(() => CatalogPage.restoreButtonState())
      .catch((error: Error): void => {
        PromiseHelpers.catchBlockHelper(error, Constants.FETCH_CATALOG_ERROR);
      });
  };

  private initPagination(): void {
    const productContainer = this.CONTAINER.querySelector('.product-container') as HTMLDivElement;
    setTimeout(() => {
      (this.CONTAINER.querySelector('.page-1') as HTMLSpanElement).classList.add('pag-active');
      this.CONTAINER.querySelectorAll('.pag-page').forEach((page) => {
        page.addEventListener('click', () => {
          productContainer.innerHTML = '';
          const pageNumber = (page as HTMLSpanElement).innerText;
          this.clearPaginationPageStyle();
          (this.CONTAINER.querySelector(`.page-${pageNumber}`) as HTMLSpanElement).classList.add('pag-active');
          this.fillProductCatalog(Number(pageNumber));
        });
      });
    }, 500);
  }

  private clearPaginationPageStyle(): void {
    this.CONTAINER.querySelectorAll('.pag-active').forEach((item) => {
      item.classList.remove('pag-active');
    });
  }

  private generateProductPages(): void {
    let pages: number;
    const parent = this.CONTAINER.querySelector('.pag-pages') as HTMLDivElement;
    new QueryProducts()
      .queryProductList()
      .then((products) => {
        pages = Math.ceil((products.total || 0) / 9);
        for (let i = 1; i <= pages; i += 1) {
          DOMHelpers.createElement('span', { className: `page-${i} pag-page`, innerText: `${i}` }, parent);
        }
      })
      .catch((error: Error): void => {
        PromiseHelpers.catchBlockHelper(error, Constants.FETCH_CATALOG_ERROR);
      });
  }

  static onAddToCartButtonClick = (productId: string, product: HTMLElement): void => {
    const customerToken = new LocalStorage().getLocalStorageItem(Constants.ACCESS_TOKEN_KEY) as string;
    const cartButton = product.querySelector(`.${Constants.CART_BUTTON_CLASSNAME}`) as HTMLElement;

    let activeCartResponse: CartPagedQueryResponse | undefined;
    let lineItemId = '';

    new CustomerCart()
      .getMyActiveCart(customerToken)
      .then((response): void => {
        activeCartResponse = response;
        if (activeCartResponse) {
          new CustomerCart().getCartInformation(activeCartResponse).catch((error: Error): void => {
            PromiseHelpers.catchBlockHelper(error, Constants.FETCH_CART_TYPES_ERROR);
          });
        }
      })
      .then((): void => {
        const cartId = new LocalStorage().getLocalStorageItem('cart-id') as string;

        const lineItem = activeCartResponse?.results[0]?.lineItems.find((item): boolean => {
          lineItemId = item.id;
          return item.productId === productId;
        });

        if (lineItem) {
          new CustomerCart()
            .removeCartItem(cartId, lineItemId)
            .then((): void => {
              cartButton.innerText = Constants.CART_BUTTON_ADD_TEXT;
              cartButton.style.backgroundColor = '';
              TostifyHelper.showToast(`${Constants.CART_PRODUCT_REMOVE_MESSAGE}`, Constants.TOAST_COLOR_DARK_BLUE);
            })
            .catch((error: Error): void => {
              PromiseHelpers.catchBlockHelper(error, Constants.FETCH_PRODUCT_TYPES_ERROR);
            });
        } else {
          new CustomerCart()
            .addCartItem(cartId, productId)
            .then((): void => {
              cartButton.innerText = Constants.CART_BUTTON_REMOVE_TEXT;
              cartButton.style.backgroundColor = '#5e5e5e';
              TostifyHelper.showToast(`${Constants.CART_PRODUCT_ADD_MESSAGE}`, Constants.TOAST_COLOR_DARK_GREEN);
            })
            .catch((error: Error): void => PromiseHelpers.catchBlockHelper(error, Constants.FETCH_PRODUCT_TYPES_ERROR));
        }
      })
      .catch((error: Error): void => {
        PromiseHelpers.catchBlockHelper(error, Constants.FETCH_CART_TYPES_ERROR);
      });
  };

  static restoreButtonState(): void {
    const productItems = document.querySelectorAll('.product-item');
    const productIds: string[] = [];

    new CustomerCart()
      .getMyActiveCart(new LocalStorage().getLocalStorageItem(Constants.ACCESS_TOKEN_KEY) as string)
      .then((response): void => {
        response?.results[0]?.lineItems.forEach((lineItem: LineItem): void => {
          productIds.push(lineItem.productId);
        });
      })
      .then((): void => {
        productItems.forEach((productItem): void => {
          const cartButton = productItem.querySelector(`.${Constants.CART_BUTTON_CLASSNAME}`) as HTMLElement;
          const productId = productItem.classList[0];

          if (productIds.includes(productId)) {
            cartButton.innerText = Constants.CART_BUTTON_REMOVE_TEXT;
            cartButton.style.backgroundColor = '#5e5e5e';
          }
        });
      })
      .catch((error: Error): void => {
        PromiseHelpers.catchBlockHelper(error, Constants.FETCH_PRODUCT_TYPES_ERROR);
      });
  }

  static onProductClick(container: HTMLElement): void {
    container.addEventListener('click', (event: Event): void => {
      const clickedElement = event.target as Element;
      const productItem = clickedElement.closest('.product-item') as HTMLElement;

      if (
        clickedElement instanceof HTMLAnchorElement &&
        clickedElement.classList.contains(`${Constants.CART_BUTTON_CLASSNAME}`)
      ) {
        event.preventDefault();
        const productId: string | null = clickedElement.getAttribute('data-product-id');

        if (productId) {
          CatalogPage.onAddToCartButtonClick(productId, productItem);
        }
        return;
      }

      if (productItem) {
        const productId = productItem.classList[0];
        window.location.hash = `#product/${productId}`;
      }
    });
  }

  private onResetFiltersButtonClick(): void {
    (this.CONTAINER.querySelector('.reset-filter-button') as HTMLButtonElement).addEventListener('click', () => {
      this.renderPage();
    });
  }

  private createCategoriesLinks(): void {
    const categoriesContainer = this.CONTAINER.querySelector('.categories-links') as HTMLSelectElement;
    new QueryProducts()
      .queryProductTypes()
      .then((queriedProductTypes: ProductTypePagedQueryResponse) => {
        queriedProductTypes.results.forEach((type: ProductType) => {
          const categoryLink = DOMHelpers.createElement(
            'a',
            { className: 'category-link', textContent: type.name },
            categoriesContainer,
          ) as HTMLAnchorElement;
          categoryLink.href = `#category/${type.id}`;
        });
      })
      .catch((error: Error): void => {
        PromiseHelpers.catchBlockHelper(error, Constants.FETCH_PRODUCT_TYPES_ERROR);
      });
  }

  public renderPage(): HTMLElement {
    this.CONTAINER.innerHTML = this.CATALOG_PAGE_MARKUP;
    this.fillProductCatalog();
    CatalogPage.onProductClick(this.CONTAINER);
    CatalogPageFilters.initAllFilters(this.CONTAINER, this.fillProductCatalog);
    CatalogPageSort.initSort(this.CONTAINER);
    this.onResetFiltersButtonClick();
    Breadcrumbs.setCatalogBreadcrumb(this.CONTAINER);
    this.createCategoriesLinks();
    this.generateProductPages();
    this.initPagination();
    return this.CONTAINER;
  }
}

export default CatalogPage;
