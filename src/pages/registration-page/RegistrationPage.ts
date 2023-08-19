import { ClientResponse, CustomerDraft, CustomerSignInResult } from '@commercetools/platform-sdk';
import Page from '../../components/templates/Page';
import { ProjectPages } from '../../types/Enums';
import Constants from '../../utils/Constants';
import { CustomerRegistration } from '../../backend/registration/CustomerRegistration';
import TostifyHelper from '../../utils/TostifyHelper';
import RegistrationFormValidation from './RegistrationFormValidation';

class RegistrationPage extends Page {
  private REGISTRATION_PAGE_MARKUP = `
  <div class="container container-register">
    <div class="main-box register">
      <h2>Registration</h2>
      <div class="register">
          <p class='customer-message'>Already a Customer?<a href="#login" class="login-link">Login</a></p>
        </div>
      <form class="register-form">
        <div class="input-box">
          <span class="icon"><i class='bx bxs-envelope'></i></span>
            <input class='input-email' type="email" name="email">
            <label for="email">Email</label>
        </div>
        <div class="input-box">
          <span class="icon icon-lock"><i class='bx bxs-lock-alt'></i></span>
          <input class="input-password" type="password" autocomplete='reg-password' name="password">
          <label for="password">Password</label>
        </div>
        <div class="input-box">
          <span class="icon"><i class='bx bxs-user'></i></span>
          <input class='input-first-name' type="text" name="firstName">
          <label for="firstName">First Name</label>
        </div>
        <div class="input-box">
          <span class="icon"><i class='bx bxs-user'></i></span>
          <input class='input-last-name' type="text" name="lastName">
          <label for="lastName">Last Name</label>
        </div>
        <div class="input-box">
          <input class='input-date-of-birth' type="date" name="dob">
          <label for="dob">Date of Birth</label>
        </div>
        <div class="input-box">
          <span class="icon"><i class='bx bx-globe'></i></span>
          <select class='select-country' name="country">
            <option value="" disabled selected>Select Country</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
          </select>
          <label for="country">Country</label>
        </div>
        <div class="input-box">
          <span class="icon"><i class='bx bxs-city'></i></span>
          <input class='input-city address-part' type="text" name="city">
          <label for="city">City</label>
        </div>
        <div class="input-box">
          <span class="icon"><i class='bx bxs-traffic'></i></span>
          <input class='input-street address-part' type="text" name="street">
          <label for="street">Street</label>
        </div>
        <div class="input-box">
          <span class="icon"><i class='bx bxs-building-house'></i></span>
          <input class='input-postal-code address-part' type="text" name="postalCode">
          <label for="postalCode">Postal Code</label>
        </div>
        <div class="check">
          <label for="acceptTerms">
            <input class='accept-terms' type="checkbox" id="acceptTerms">I accept terms and conditions</input>
          </label>
        </div>
        <button class="main-btn" type="submit" disabled>Register me</button>
      </form>
    </div>
  </div>`;

  private REGISTRATION_FORM_VALIDATION: RegistrationFormValidation;

  constructor() {
    super(ProjectPages.Registration);
    this.REGISTRATION_FORM_VALIDATION = new RegistrationFormValidation();
  }

  private handleRegistrationResponse(response: ClientResponse<CustomerSignInResult>): void {
    if (response.statusCode === 201) {
      TostifyHelper.showToast(Constants.ACCOUNT_HAS_BEEN_CREATED, Constants.TOAST_COLOR_GREEN);
    } else {
      TostifyHelper.showToast(Constants.ACCOUNT_CREATION_ERROR, Constants.TOAST_COLOR_RED);
    }
  }

  public submitRegistrationForm = (event: Event): void => {
    event.preventDefault();

    const customerData: CustomerDraft = {
      email: (this.CONTAINER.querySelector('input[name="email"]') as HTMLInputElement).value.trim(),
      password: (this.CONTAINER.querySelector('input[name="password"]') as HTMLInputElement).value.trim(),
      firstName: (this.CONTAINER.querySelector('input[name="firstName"]') as HTMLInputElement).value.trim(),
      lastName: (this.CONTAINER.querySelector('input[name="lastName"]') as HTMLInputElement).value.trim(),
      dateOfBirth: (this.CONTAINER.querySelector('input[name="dob"]') as HTMLInputElement).value.trim(),
      addresses: [
        {
          streetName: (this.CONTAINER.querySelector('input[name="street"]') as HTMLInputElement).value.trim(),
          city: (this.CONTAINER.querySelector('input[name="city"]') as HTMLInputElement).value.trim(),
          postalCode: (this.CONTAINER.querySelector('input[name="postalCode"]') as HTMLInputElement).value.trim(),
          country: (this.CONTAINER.querySelector('select[name="country"]') as HTMLSelectElement).value.trim(),
        },
      ],
    };

    new CustomerRegistration(customerData)
      .createCustomer()
      .then((response): void => {
        this.handleRegistrationResponse(response);
      })
      .catch((error: Error): void => {
        const errorMessage: string =
          error.message === Constants.FAILED_TO_FETCH_ERROR_MESSAGE ? Constants.ACCOUNT_CREATION_ERROR : error.message;
        TostifyHelper.showToast(errorMessage, Constants.TOAST_COLOR_RED);
      });
  };

  public manageRegistrationFormEventListener = (add: boolean): void => {
    const form = this.CONTAINER.querySelector('.register-form') as HTMLFormElement;
    const mainButton = this.CONTAINER.querySelector('.main-btn') as HTMLButtonElement;

    if (add) {
      form.addEventListener('submit', this.submitRegistrationForm);
      mainButton.disabled = false;
    } else {
      form.removeEventListener('submit', this.submitRegistrationForm);
      mainButton.disabled = true;
    }
  };

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

  private handleTermsCheckboxChange = (): void => {
    const checkbox = this.CONTAINER.querySelector('.accept-terms') as HTMLInputElement;
    const submitButton = this.CONTAINER.querySelector('.main-btn') as HTMLButtonElement;

    submitButton.disabled = !checkbox.checked;
  };

  private assignRegistrationPageEventListeners(): void {
    const lockIcon = this.CONTAINER.querySelector(Constants.LOCK_ICON_SELECTOR) as HTMLElement;
    const termsCheckbox = this.CONTAINER.querySelector('.accept-terms') as HTMLInputElement;

    lockIcon.addEventListener('click', this.handleLockIconClick);
    (this.CONTAINER.querySelector('.register-form') as HTMLFormElement).addEventListener(
      'submit',
      this.submitRegistrationForm,
    );
    termsCheckbox.addEventListener('change', this.handleTermsCheckboxChange);
  }

  public renderPage(): HTMLElement {
    this.CONTAINER.innerHTML = this.REGISTRATION_PAGE_MARKUP;
    this.REGISTRATION_FORM_VALIDATION.validateRegistrationFormFields(
      this.CONTAINER,
      this.manageRegistrationFormEventListener,
    );
    this.assignRegistrationPageEventListeners();
    return this.CONTAINER;
  }
}

export default RegistrationPage;
