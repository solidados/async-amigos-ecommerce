import Page from '../../components/templates/Page';
import { ProjectPages } from '../../types/Enums';
import Constants from '../../utils/Constants';
import EmailValidator from '../../utils/ValidateEmail';
import PasswordValidator from '../../utils/ValidatePassword';

class LoginPage extends Page {
  // private hint = `<span class="dynamic-message"></span>`;

  private LOGIN_PAGE_MARKUP = `
  <div class="container container-login">
  <div class="main-box login">
    <h2>Login</h2>
    <form id="login-form">
      <div class="input-box">
        <span class="icon"><i class='bx bxs-envelope'></i></span>
        <input type="email" autocomplete="current-email" name="email" required>
        <label for="email">Email</label>
      </div>
      <div class="input-box">
        <span class="icon icon-lock"><i class='bx bxs-lock-alt'></i></span>
        <input type="password" autocomplete="current-password" name="password" class="input-password" required>
        <label for="password">Password</label>
      </div>
      <button class="main-btn" type="submit">Login</button>
      <div class="register">
        <p>New customer?<a href="#registration" class="register-link">Register</a></p>
      </div>
    </form>
  </div>
</div>`;

  constructor() {
    super(ProjectPages.Login);
  }

  public renderPage(): HTMLElement {
    this.CONTAINER.innerHTML = this.LOGIN_PAGE_MARKUP;
    this.assignLoginPageEventListeners();
    this.setupRealTimeValidation();
    return this.CONTAINER;
  }

  private handleLockIconClick = (event: Event): void => {
    const target = event.currentTarget as HTMLElement;
    const passwordInput = this.CONTAINER.querySelector('.input-password') as HTMLInputElement;

    if (!passwordInput.value) {
      return;
    }

    if (passwordInput.type === 'password') {
      target.innerHTML = Constants.OPENED_LOCK_ICON_MARKUP;
      passwordInput.type = 'text';
    } else if (passwordInput.type === 'text') {
      target.innerHTML = Constants.CLOSED_LOCK_ICON_MARKUP;
      passwordInput.type = 'password';
    }
  };

  private assignLoginPageEventListeners(): void {
    const lockIcon = this.CONTAINER.querySelector(Constants.LOCK_ICON_SELECTOR) as HTMLElement;
    lockIcon.addEventListener('click', this.handleLockIconClick);
  }

  private setupRealTimeValidation(): void {
    const emailInput = this.CONTAINER.querySelector('input[name="email"]') as HTMLInputElement;
    emailInput.addEventListener('change', (): void => {
      const email: string = emailInput.value;
      if (typeof EmailValidator.validate(email) === 'boolean') return;
      if (typeof EmailValidator.validate(email) === 'string') {
        console.log(EmailValidator.validate(email));
      }
    });

    const passInput = this.CONTAINER.querySelector('input[name="password"]') as HTMLInputElement;
    passInput.addEventListener('change', (): void => {
      const password: string = passInput.value;
      if (typeof PasswordValidator.validate(password) === 'boolean') return;
      if (typeof PasswordValidator.validate(password) === 'string') {
        console.log(PasswordValidator.validate(password));
      }
    });
  }
}

export default LoginPage;
