import Page from '../../components/templates/Page';
import { ProjectPages } from '../../types/Enums';

class MyProfilePage extends Page {
  private MY_PROFILE_PAGE_MARKUP = `
     <h1 class='page-title'>My Profile Page</h1>`;

  constructor() {
    super(ProjectPages.MyProfile);
  }

  public renderPage(): HTMLElement {
    this.CONTAINER.innerHTML = this.MY_PROFILE_PAGE_MARKUP;
    return this.CONTAINER;
  }
}

export default MyProfilePage;
