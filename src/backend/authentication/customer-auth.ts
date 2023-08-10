import { ClientResponse, CustomerDraft, CustomerSignInResult, CustomerSignin } from '@commercetools/platform-sdk';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { createApiRootPassword } from './passwordClient';
import { apiRoot } from '../ctpClient/apiRoot';

export class CustomerAuth {
  private email: string;

  private password: string;

  private apiRootPassword: ByProjectKeyRequestBuilder;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
    this.apiRootPassword = createApiRootPassword(this.email, this.password);
  }

  async createCustomer(customerData: CustomerDraft): Promise<ClientResponse<CustomerSignInResult>> {
    const response = await apiRoot
      .customers()
      .post({
        body: customerData,
      })
      .execute();
    return response;
  }

  async checkCustomerExists(): Promise<boolean> {
    const response = await this.apiRootPassword
      .customers()
      .get({
        queryArgs: {
          where: `email="${this.email}"`,
        },
      })
      .execute();
    return response.body.count > 0;
  }

  async signIn(customerLogin: CustomerSignin): Promise<ClientResponse<CustomerSignInResult>> {
    const response = await this.apiRootPassword
      .login()
      .post({
        body: customerLogin,
      })
      .execute();
    return response;
  }
}
