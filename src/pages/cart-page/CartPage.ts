import Page from '../../components/templates/Page';
import { ProjectPages } from '../../types/Enums';

class CartPage extends Page {
  private CART_PAGE_MARKUP = `
    <div class="cart__container">
      <h1 class='page-title'>Cart Page</h1>
    </div>`;

  constructor() {
    super(ProjectPages.Cart);
  }

  public renderPage(): HTMLElement {
    this.CONTAINER.innerHTML = this.CART_PAGE_MARKUP;
    return this.CONTAINER;
  }
}

export default CartPage;
