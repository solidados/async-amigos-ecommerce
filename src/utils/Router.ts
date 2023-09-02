import Page from '../components/templates/Page';
import { ProjectPages } from '../types/Enums';
import HomePage from '../pages/home-page/HomePage';
import LoginPage from '../pages/login-page/LoginPage';
import RegistrationPage from '../pages/registration-page/RegistrationPage';
import NotFoundPage from '../pages/not-found-page/NotFoundPage';
import DOMHelpers from './DOMHelpers';
import Constants from './Constants';
import CatalogPage from '../pages/catalog-page/CatalogPage';
import MyProfilePage from '../pages/my-profile-page/MyProfilePage';
import CartPage from '../pages/cart-page/CartPage';
import AboutUsPage from '../pages/about-us-page/AboutUsPage';
import LocalStorage from './LocalStorage';
import ProductDetailsPage from '../pages/product-details-page/ProductDetailsPage';
import CategoryPage from '../pages/category-page/CategoryPage';

class Router {
  public renderSpecificPage(pageID: string): void {
    const DynamicPages = {
      ProductDetails: /^product\/[\w-]+$/,
      Category: /^category\/[a-f0-9-]+$/,
    };
    let currentPage: Page;
    DOMHelpers.getElement(`${Constants.PAGE_CONTAINER_SELECTOR}`).innerHTML = ''; // remove content before next page loading

    switch (pageID) {
      case ProjectPages.Home:
        currentPage = new HomePage();
        break;
      case ProjectPages.Login:
        if (new LocalStorage().isLocalStorageItemExists(Constants.SUCCESSFUL_REGISTRATION_LOCAL_STORAGE_KEY)) {
          window.location.href = '#';
          currentPage = new HomePage();
        } else {
          currentPage = new LoginPage();
        }
        break;
      case ProjectPages.Registration:
        if (new LocalStorage().isLocalStorageItemExists(Constants.SUCCESSFUL_REGISTRATION_LOCAL_STORAGE_KEY)) {
          window.location.href = '#';
          currentPage = new HomePage();
        } else {
          currentPage = new RegistrationPage();
        }
        break;
      case ProjectPages.Catalog:
        currentPage = new CatalogPage();
        break;
      case ProjectPages.MyProfile:
        if (new LocalStorage().isLocalStorageItemExists(Constants.SUCCESSFUL_REGISTRATION_LOCAL_STORAGE_KEY)) {
          currentPage = new MyProfilePage();
        } else {
          window.location.replace(`#${ProjectPages.Login}`);
          currentPage = new LoginPage();
        }
        break;
      case ProjectPages.Cart:
        currentPage = new CartPage();
        break;
      case ProjectPages.AboutUs:
        currentPage = new AboutUsPage();
        break;
      default:
        if (DynamicPages.ProductDetails.test(pageID)) {
          const extractedProductId = pageID.split('/')[1];
          currentPage = new ProductDetailsPage(extractedProductId);
        } else if (DynamicPages.Category.test(pageID)) {
          const extractedCategoryId = pageID.split('/')[1];
          currentPage = new CategoryPage(extractedCategoryId);
        } else {
          currentPage = new NotFoundPage();
        }
        break;
    }

    DOMHelpers.appendChildToElement(
      DOMHelpers.getElement(`${Constants.PAGE_CONTAINER_SELECTOR}`),
      currentPage.renderPage(),
    );
  }

  private handleHashChange(): void {
    const pageHash = window.location.hash.slice(1);
    this.renderSpecificPage(pageHash);
  }

  private setupRouteChangeListener(initialPage?: ProjectPages): void {
    if (initialPage) {
      this.renderSpecificPage(initialPage);
    }
    window.addEventListener('hashchange', () => {
      this.handleHashChange();
    });
    window.addEventListener('load', () => {
      this.handleHashChange();
    });
  }

  public init(): void {
    this.setupRouteChangeListener(ProjectPages.Home);
  }
}

export default Router;
