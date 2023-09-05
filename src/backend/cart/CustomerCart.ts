import { Cart, CartPagedQueryResponse } from '@commercetools/platform-sdk';
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
}

export default CustomerCart;
