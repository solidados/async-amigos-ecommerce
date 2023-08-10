import Page from '../../components/templates/Page';
import { ProjectPages } from '../../types/Enums';
import Constants from '../../utils/Constants';

class LoginPage extends Page {
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

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validatePassword(password: string): boolean {
    const passwordRegex = /[A-Za-z\d\-!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
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
    const emailInputs: NodeListOf<Element> = this.CONTAINER.querySelectorAll('input[name="email"]');
    emailInputs.forEach((emailInput: Element): void => {
      emailInput.addEventListener('input', (): void => {
        const email: string = (emailInput as HTMLInputElement).value.trim();
        const isValid: boolean = this.validateEmail(email);
        (emailInput as HTMLInputElement).setCustomValidity(
          isValid ? '' : 'Invalid email format\nExample: name@domain.com',
        );
      });
    });

    const passInputs: NodeListOf<Element> = this.CONTAINER.querySelectorAll('input[name="password"]');
    passInputs.forEach((passInput: Element): void => {
      passInput.addEventListener('input', (): void => {
        const password: string = (passInput as HTMLInputElement).value.trim();
        const isValid: boolean = this.validatePassword(password);
        (passInput as HTMLInputElement).setCustomValidity(
          isValid
            ? ''
            : `Invalid password format\n
          Your password must contain at least:\n
    • 8 characters (both letters and numbers),\n
    • include symbols: -!@#$%^&*`,
        );
      });
    });
  }

  public renderPage(): HTMLElement {
    this.CONTAINER.innerHTML = this.LOGIN_PAGE_MARKUP;
    this.assignLoginPageEventListeners();
    this.setupRealTimeValidation();
    return this.CONTAINER;
  }
}

export default LoginPage;
