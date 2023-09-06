import { CartPagedQueryResponse } from '@commercetools/platform-sdk';
import Page from '../../components/templates/Page';
import { ProjectPages } from '../../types/Enums';
import CustomerCart from '../../backend/cart/CustomerCart';
import LocalStorage from '../../utils/LocalStorage';
import Constants from '../../utils/Constants';
import DOMHelpers from '../../utils/DOMHelpers';
import PromiseHelpers from '../../utils/PromiseHelpers';
import ProductCardBuilder from '../catalog-page/ProductCardBuilder';

class CartPage extends Page {
  private CART_PAGE_MARKUP = `
    <div class="cart-container">
      <h1 class='cart-page-title'>Your Cart</h1>
      <div class='cart-items'></div>
      <div class='total-cart-price-container'></div>
    </div>`;

  private LOCAL_STORAGE: LocalStorage;

  constructor() {
    super(ProjectPages.Cart);
    this.LOCAL_STORAGE = new LocalStorage();
  }

  private buildCartItem(cartResponse: CartPagedQueryResponse): void {
    const itemContainer = this.CONTAINER.querySelector('.cart-items') as HTMLElement;
    const usLocaleKey = 'en-US';
    cartResponse.results[0].lineItems.forEach((cartItem) => {
      const cartItemTitle = cartItem.name[usLocaleKey];
      const cartItemPrice = cartItem.price.discounted?.value.centAmount
        ? ProductCardBuilder.convertProductPrice(Number(cartItem.price.discounted?.value.centAmount))
        : ProductCardBuilder.convertProductPrice(Number(cartItem.price.value.centAmount));
      const cartItemImg = cartItem.variant.images?.[0].url ?? Constants.IMAGE_NOT_FOUND_MOCK_IMAGE;

      const cartElement = DOMHelpers.createElement(
        'div',
        { className: `${cartItem.productId} cart-item` },
        itemContainer,
      );
      cartElement.innerHTML = `<img class="cart-item-img" src="${cartItemImg}" alt="${cartItem.productKey as string}">
           <h2 class='cart-item-title'>${cartItemTitle}</h2> 
           <div class="cart-item-quantity">
              <button class="cart-item-quantity-button">-</button>
              <input type="number" class="cart-item-quantity-value" value="1">
              <button class="cart-item-quantity-button">+</button>
           </div>
           <div class='cart-item-price'>${cartItemPrice}</div>`;
    });
  }

  private calculateCartTotalPrice(cartResponse: CartPagedQueryResponse): void {
    const container = this.CONTAINER.querySelector('.total-cart-price-container') as HTMLDivElement;
    const totalCartPrice = ProductCardBuilder.convertProductPrice(
      Number(cartResponse.results[0].totalPrice.centAmount),
    );
    container.innerHTML = `<div class='total-cart-price-label'>Total cart price:</div> <span class='total-cart-price'>${totalCartPrice}</span>`;
  }

  private showCartProducts(): void {
    new CustomerCart()
      .getMyActiveCart(this.LOCAL_STORAGE.getLocalStorageItem(Constants.ACCESS_TOKEN_KEY) as string)
      .then((activeCart) => {
        this.buildCartItem(activeCart);
        this.calculateCartTotalPrice(activeCart);
        new CustomerCart().getCartInformation(activeCart).catch((error: Error): void => {
          PromiseHelpers.catchBlockHelper(error, error.message);
        });
      })
      .catch((error: Error): void => {
        PromiseHelpers.catchBlockHelper(error, error.message);
      });
  }

  private showEmptyCartMessage(): void {
    const parent = this.CONTAINER.querySelector('.cart-items') as HTMLDivElement;
    const element = DOMHelpers.createElement('div', { className: `empty-cart` }, parent);
    element.innerText = 'CART IS EMPTY!';
  }

  public renderPage(): HTMLElement {
    this.CONTAINER.innerHTML = this.CART_PAGE_MARKUP;
    new CustomerCart()
      .handleCartCreation()
      .then(() => {
        this.showCartProducts();
      })
      .catch((error: Error): void => {
        PromiseHelpers.catchBlockHelper(error, error.message);
      });
    return this.CONTAINER;
  }
}

export default CartPage;
