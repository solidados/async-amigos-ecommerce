import { CartPagedQueryResponse, LineItem } from '@commercetools/platform-sdk';
import Page from '../../components/templates/Page';
import { ProjectPages } from '../../types/Enums';
import CustomerCart from '../../backend/cart/CustomerCart';
import LocalStorage from '../../utils/LocalStorage';
import Constants from '../../utils/Constants';
import DOMHelpers from '../../utils/DOMHelpers';
import PromiseHelpers from '../../utils/PromiseHelpers';
import ProductCardBuilder from '../catalog-page/ProductCardBuilder';
import TostifyHelper from '../../utils/TostifyHelper';

class CartPage extends Page {
  private CART_PAGE_MARKUP = `
    <div class="cart-container">
      <h1 class='cart-page-title'>Your Cart</h1>
      <button class='clear-cart explore-button' disabled>Clear Your Cart</button>
      <div class='cart-items'></div>
      <div class="promo-container">
        <label for="promo">Enter your Promo code here:</label>
        <input type="text" name="promo" id="promo" class="promo-input" autofocus maxlength="4" placeholder="••••">
        <button type="submit" class="promo-button">GO PROMO</button>
      </div>
      <div class='total-cart-price-container'></div>
    </div>`;

  private LOCAL_STORAGE: LocalStorage;

  private CUSTOMER_CART: CustomerCart;

  constructor() {
    super(ProjectPages.Cart);
    this.LOCAL_STORAGE = new LocalStorage();
    this.CUSTOMER_CART = new CustomerCart();
  }

  private buildCartItems(cartResponse: CartPagedQueryResponse): void {
    const itemContainer = this.CONTAINER.querySelector('.cart-items') as HTMLElement;
    const usLocaleKey = 'en-US';
    cartResponse.results[0].lineItems.forEach((cartItem) => {
      const cartItemTitle = cartItem.name[usLocaleKey];
      const cartItemPrice = cartItem.price.discounted?.value.centAmount
        ? cartItem.price.discounted?.value.centAmount
        : cartItem.price.value.centAmount;
      const modifiedPriceByItemQuantity = ProductCardBuilder.convertProductPrice(
        Number(cartItemPrice) * cartItem.quantity,
      );
      const cartItemImg = cartItem.variant.images?.[0].url ?? Constants.IMAGE_NOT_FOUND_MOCK_IMAGE;
      const itemQuantity = cartItem.quantity;
      const lineItemId = cartItem.id;

      const cartElement = DOMHelpers.createElement(
        'div',
        { className: `${cartItem.productId} cart-item` },
        itemContainer,
      );
      cartElement.setAttribute('data-product-id', `${cartItem.productId}`);
      cartElement.innerHTML = `<div class="remove-cart-item-button ${lineItemId} ${
        cartItem.productId
      }" data-product-id="${cartItem.productId}"></div>
           <img class="cart-item-img" src="${cartItemImg}" alt="${cartItem.productKey as string}">
           <h2 class='cart-item-title'>${cartItemTitle}</h2> 
           <div class="cart-item-quantity-container ${cartItem.productId}">
              <button class="cart-item-quantity-minus ${lineItemId} ${cartItem.productId}">-</button>
              <input type="number" class="cart-item-quantity-value ${
                cartItem.productId
              }" value=${itemQuantity} disabled>
              <button class="cart-item-quantity-plus ${cartItem.productId}">+</button>
           </div>
           <div class='cart-item-price'>${modifiedPriceByItemQuantity}</div>
<span class="cart-item-price-std"></span>`;
    });
    this.increaseItemQuantity();
    this.decreaseItemQuantity();
  }

  private disableQuantityMinusButton(): void {
    const quantityContainers = this.CONTAINER.querySelectorAll('.cart-item-quantity-container');

    quantityContainers.forEach((container) => {
      const quantityValue = (container.querySelector('.cart-item-quantity-value') as HTMLInputElement).value;
      const minusButton = container.querySelector('.cart-item-quantity-minus') as HTMLButtonElement;
      minusButton.disabled = Number(quantityValue) === 1;
    });
  }

  private handleClearCartButtonState(): void {
    const itemsNumber = this.CONTAINER.querySelectorAll('.cart-item').length;
    const clearCartButton = this.CONTAINER.querySelector('.clear-cart') as HTMLButtonElement;
    if (itemsNumber > 0) {
      clearCartButton.disabled = false;
      clearCartButton.addEventListener('click', this.handleCartCleanProcess);
    }
  }

  private handleCartCleanProcess = (): void => {
    // eslint-disable-next-line no-restricted-globals
    const confirmation = confirm(Constants.CONFIRM_QUESTION);

    if (confirmation) {
      this.CUSTOMER_CART.deleteCart(this.LOCAL_STORAGE.getLocalStorageItem(Constants.CART_ID_KEY) as string)
        .then(() =>
          this.CUSTOMER_CART.createCart(this.LOCAL_STORAGE.getLocalStorageItem(Constants.ACCESS_TOKEN_KEY) as string),
        )
        .then(() =>
          this.CUSTOMER_CART.getMyActiveCart(
            this.LOCAL_STORAGE.getLocalStorageItem(Constants.ACCESS_TOKEN_KEY) as string,
          ),
        )
        .then((activeCart) => this.CUSTOMER_CART.getCartInformation(activeCart))
        .then(() => {
          this.renderPage();
          TostifyHelper.showToast(Constants.CONFIRM_NOTIFICATION, Constants.TOAST_COLOR_DARK_GREEN);
        })
        .catch((error: Error): void => {
          PromiseHelpers.catchBlockHelper(error, error.message);
        });
    }
  };

  private handleClickOnRemoveCartItemButton(): void {
    const buttons = this.CONTAINER.querySelectorAll('.remove-cart-item-button');
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const lineId = button.classList[1];
        const productId = button.classList[2];
        const dataProductId = button.getAttribute('data-product-id') as string;
        this.CUSTOMER_CART.removeCartItem(
          this.LOCAL_STORAGE.getLocalStorageItem(Constants.CART_ID_KEY) as string,
          lineId,
        )
          .then(() => {
            this.updateRelatedToProductQuantityElements(productId);
            (this.CONTAINER.querySelector(`[data-product-id="${dataProductId}"]`) as HTMLDivElement).remove();
            TostifyHelper.showToast(Constants.CART_ITEM_HAS_BEEN_REMOVED, Constants.TOAST_COLOR_DARK_GREEN);
          })
          .then(() => {
            if (this.CONTAINER.querySelectorAll('.cart-item').length === 0) {
              this.showEmptyCartContainer();
            }
          })
          .catch((error: Error): void => {
            PromiseHelpers.catchBlockHelper(error, error.message);
          });
      });
    });
  }

  private increaseItemQuantity(): void {
    const buttons = this.CONTAINER.querySelectorAll('.cart-item-quantity-plus');

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const productId = button.classList[1];
        this.CUSTOMER_CART.addCartItem(
          this.LOCAL_STORAGE.getLocalStorageItem(Constants.CART_ID_KEY) as string,
          productId,
        )
          .then(() => {
            this.updateRelatedToProductQuantityElements(productId);
          })
          .catch((error: Error): void => {
            PromiseHelpers.catchBlockHelper(error, error.message);
          });
      });
    });
  }

  private decreaseItemQuantity(): void {
    const buttons = this.CONTAINER.querySelectorAll('.cart-item-quantity-minus');
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const lineItemId = button.classList[1];
        const productId = button.classList[2];

        this.CUSTOMER_CART.removeCartItem(
          this.LOCAL_STORAGE.getLocalStorageItem(Constants.CART_ID_KEY) as string,
          lineItemId,
          1,
        )
          .then(() => {
            this.updateRelatedToProductQuantityElements(productId);
          })
          .catch((error: Error): void => {
            PromiseHelpers.catchBlockHelper(error, error.message);
          });
      });
    });
  }

  private updateRelatedToProductQuantityElements(productId: string): void {
    this.CUSTOMER_CART.getMyActiveCart(this.LOCAL_STORAGE.getLocalStorageItem(Constants.ACCESS_TOKEN_KEY) as string)
      .then((activeCart) => {
        const cartTotalPrice = ProductCardBuilder.convertProductPrice(
          Number(activeCart.results[0].totalPrice.centAmount),
        );
        let itemQuantity: number;
        let itemTotalPrice: string;
        activeCart.results[0].lineItems.forEach((item) => {
          if (item.productId === productId) {
            itemQuantity = item.quantity;
            itemTotalPrice = ProductCardBuilder.convertProductPrice(item.totalPrice.centAmount);
          }
        });
        (this.CONTAINER.querySelector('.total-cart-price') as HTMLSpanElement).textContent = cartTotalPrice;
        const itemQuantityElement = this.CONTAINER.querySelectorAll('.cart-item');
        itemQuantityElement.forEach((item) => {
          if (item.classList[0] === productId) {
            const cartItemQuantityElement = item.querySelector('.cart-item-quantity-value') as HTMLInputElement;
            const cartItemPriceElement = item.querySelector('.cart-item-price') as HTMLInputElement;
            cartItemQuantityElement.value = String(itemQuantity);
            cartItemPriceElement.textContent = itemTotalPrice;
          }
        });
        this.CUSTOMER_CART.getCartInformation(activeCart)
          .then((): void => {
            this.disableQuantityMinusButton();
          })
          .catch((error: Error): void => {
            PromiseHelpers.catchBlockHelper(error, error.message);
          });
      })
      .catch((error: Error): void => {
        PromiseHelpers.catchBlockHelper(error, error.message);
      });
  }

  private populateCartTotalPriceContainer(cartResponse: CartPagedQueryResponse): void {
    const container = this.CONTAINER.querySelector('.total-cart-price-container') as HTMLDivElement;
    const totalCartPrice = ProductCardBuilder.convertProductPrice(
      Number(cartResponse.results[0].totalPrice.centAmount),
    );
    container.innerHTML = `<div class='total-cart-price-label'>Total cart price:</div> <span class='total-cart-price'>${totalCartPrice}</span>`;
  }

  public handlePromoCode(): void {
    const promoButton = this.CONTAINER.querySelector('.promo-button') as HTMLButtonElement;
    const promoInput = this.CONTAINER.querySelector('.promo-input') as HTMLInputElement;
    promoButton.addEventListener('click', (): void => {
      const enteredCode = promoInput.value;
      this.CUSTOMER_CART.applyCartPromoCode(enteredCode)
        .then((): void => {
          this.CUSTOMER_CART.getMyActiveCart(
            this.LOCAL_STORAGE.getLocalStorageItem(Constants.ACCESS_TOKEN_KEY) as string,
          )
            .then((cartResponse: CartPagedQueryResponse): void => {
              cartResponse.results[0].lineItems.forEach((item: LineItem): void => {
                this.updateRelatedToProductQuantityElements(item.productId);
                const cartItem = this.CONTAINER.querySelector(`[data-product-id="${item.productId}"]`) as HTMLElement;
                const cartItemPriceStd = cartItem.querySelector('.cart-item-price-std') as HTMLSpanElement;
                const stdPrice = item.price.value.centAmount;

                cartItemPriceStd.innerHTML = `${stdPrice}`;
              });
              this.populateCartTotalPriceContainer(cartResponse);
              TostifyHelper.showToast(Constants.PROMO_CODE_ACCEPTED, Constants.TOAST_COLOR_DARK_BLUE);
            })
            .catch((error: Error): void => {
              PromiseHelpers.catchBlockHelper(error, error.message);
            });
        })
        .catch((error: Error): void => {
          PromiseHelpers.catchBlockHelper(error, error.message);
        });
    });
  }

  private renderCart(): void {
    this.CUSTOMER_CART.getMyActiveCart(this.LOCAL_STORAGE.getLocalStorageItem(Constants.ACCESS_TOKEN_KEY) as string)
      .then((activeCart) => {
        if (activeCart.results[0].lineItems.length === 0) {
          this.showEmptyCartContainer();
        } else {
          this.buildCartItems(activeCart);
          this.populateCartTotalPriceContainer(activeCart);
          this.CUSTOMER_CART.getCartInformation(activeCart)
            .then(() => {
              this.disableQuantityMinusButton();
              this.handleClickOnRemoveCartItemButton();
              this.handleClearCartButtonState();
              this.handlePromoCode();
            })
            .then(() => {
              activeCart.results[0].lineItems.forEach((lineItem) => {
                this.updateRelatedToProductQuantityElements(lineItem.productId);
                const cartItem = this.CONTAINER.querySelector(
                  `[data-product-id="${lineItem.productId}"]`,
                ) as HTMLElement;
                const cartItemPriceStd = cartItem.querySelector('.cart-item-price-std') as HTMLSpanElement;
                const stdPrice = lineItem.price.value.centAmount;

                cartItemPriceStd.innerHTML = `${stdPrice}`;
              });
            })
            .catch((error: Error): void => {
              PromiseHelpers.catchBlockHelper(error, error.message);
            });
        }
      })
      .catch((error: Error): void => {
        PromiseHelpers.catchBlockHelper(error, error.message);
      });
  }

  private showEmptyCartContainer(): void {
    const parent = this.CONTAINER.querySelector('.cart-items') as HTMLDivElement;
    parent.innerHTML = `<div class='empty-cart-container'>
        <p class='empty-cart-message'>Cart is empty :(</p>
        <a class='empty-cart-link explore-button' href='#catalog'>Start Shopping Now</a>
      </div>`;
  }

  public renderPage(): HTMLElement {
    this.CONTAINER.innerHTML = this.CART_PAGE_MARKUP;
    this.CUSTOMER_CART.handleCartCreation()
      .then(() => {
        this.renderCart();
      })
      .catch((error: Error): void => {
        PromiseHelpers.catchBlockHelper(error, error.message);
      });
    return this.CONTAINER;
  }
}

export default CartPage;
