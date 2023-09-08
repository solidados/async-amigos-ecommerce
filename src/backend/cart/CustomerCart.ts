import { Cart, CartPagedQueryResponse, MyCartUpdate } from '@commercetools/platform-sdk';
import { CtpClient } from '../ctpClient/ctpClient';
import Authorization from '../auth/Authorization';
import LocalStorage from '../../utils/LocalStorage';
import Constants from '../../utils/Constants';

class CustomerCart {
  private CTP_CLIENT: CtpClient;

  private AUTH: Authorization;

  private LOCAL_STORAGE: LocalStorage;

  constructor() {
    this.CTP_CLIENT = new CtpClient();
    this.AUTH = new Authorization();
    this.LOCAL_STORAGE = new LocalStorage();
  }

  public async createCart(customerToken: string): Promise<Cart> {
    try {
      const response = await this.CTP_CLIENT.withAnonymousSessionFlow()
        .me()
        .carts()
        .post({
          headers: {
            Authorization: `${customerToken}`,
          },
          body: {
            currency: 'USD',
          },
        })
        .execute();
      return response.body;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async getMyActiveCart(customerToken: string): Promise<CartPagedQueryResponse> {
    try {
      const response = await this.CTP_CLIENT.withAnonymousSessionFlow()
        .me()
        .carts()
        .get({
          headers: {
            Authorization: `${customerToken}`,
          },
        })
        .execute();
      return response.body;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async handleCartCreation(): Promise<void> {
    if (this.LOCAL_STORAGE.isLocalStorageItemExists(Constants.ACCESS_TOKEN_KEY)) {
      await this.AUTH.checkTokenExpirationDate(); // checking token status here (valid or not valid)
    } else {
      await this.AUTH.saveTokenInLocalStorage(); // if localStorage doesn't have any existing data -> new token will be created here
    }

    const customerToken = this.LOCAL_STORAGE.getLocalStorageItem(Constants.ACCESS_TOKEN_KEY) as string;
    const activeCartResponse = await this.getMyActiveCart(customerToken);

    if (activeCartResponse.results.length === 0) {
      // if response 404 then we will create new active cart for user
      await this.createCart(customerToken);
    }
  }

  public async getCartInformation(cartResponse: CartPagedQueryResponse): Promise<void> {
    const cartVersion = cartResponse.results[0].version;
    const cartId = cartResponse.results[0].id;
    this.LOCAL_STORAGE.setLocalStorageItem(Constants.CART_VERSION_KEY, String(cartVersion));
    this.LOCAL_STORAGE.setLocalStorageItem(Constants.CART_ID_KEY, String(cartId));
  }

  public async addCartItem(cartId: string, productId: string): Promise<Cart> {
    try {
      const updatePayload: MyCartUpdate = {
        version: Number(this.LOCAL_STORAGE.getLocalStorageItem(Constants.CART_VERSION_KEY)),
        actions: [
          {
            action: 'addLineItem',
            productId: `${productId}`,
            variantId: 1,
            quantity: 1,
          },
        ],
      };

      const response = await this.CTP_CLIENT.withAnonymousSessionFlow()
        .me()
        .carts()
        .withId({
          ID: cartId,
        })
        .post({
          headers: {
            Authorization: `${this.LOCAL_STORAGE.getLocalStorageItem(Constants.ACCESS_TOKEN_KEY) as string}`,
          },
          body: updatePayload,
        })
        .execute();
      return response.body;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async removeCartItem(cartId: string, lineItemId: string, quantity?: number): Promise<Cart> {
    try {
      const updatePayload: MyCartUpdate = {
        version: Number(this.LOCAL_STORAGE.getLocalStorageItem(Constants.CART_VERSION_KEY)),
        actions: [
          {
            action: 'removeLineItem',
            lineItemId: `${lineItemId}`,
            quantity, // optional, if no quantity provided -> the whole LineItem is removed from the Cart
          },
        ],
      };

      const response = await this.CTP_CLIENT.withAnonymousSessionFlow()
        .me()
        .carts()
        .withId({
          ID: cartId,
        })
        .post({
          headers: {
            Authorization: `${this.LOCAL_STORAGE.getLocalStorageItem(Constants.ACCESS_TOKEN_KEY) as string}`,
          },
          body: updatePayload,
        })
        .execute();
      return response.body;
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

export default CustomerCart;
