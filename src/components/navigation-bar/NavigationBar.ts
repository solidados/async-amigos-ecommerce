import { Customer } from '../../backend/configure/Customer';
import Component from '../templates/Component';
import Constants from '../../utils/Constants';

class NavigationBar extends Component {
  private NAVIGATION_BAR_MARKUP = `
    <a href='#'>Home</a>
    <a href='#catalog'>Catalog</a>
    <a href='#about-us'>About Us</a>
    <a href='#cart'>Cart</a>
    <a href='#my-profile'>My Profile</a>
    <a class='login' href='#login'>Login</a>
    <a class='registration' href='#registration'>Registration</a>
`;

  private NAVIGATION_BAR_MARKUP_LOGIN = `
      <a href='#'>Home</a>
      <a href='#catalog'>Catalog</a>
      <a href='#about-us'>About Us</a>
      <a href='#cart'>Cart</a>
      <a href='#my-profile'>My Profile</a>
  `;

  constructor() {
    super('nav', `${Constants.NAVIGATION_BAR_SELECTOR}`);
  }

  public renderComponent(): HTMLElement {
    if (Customer.login) {
      this.CONTAINER.innerHTML = this.NAVIGATION_BAR_MARKUP_LOGIN;
    } else {
      this.CONTAINER.innerHTML = this.NAVIGATION_BAR_MARKUP;
    }
    return this.CONTAINER;
  }
}

export default NavigationBar;
