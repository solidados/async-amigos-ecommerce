import Page from '../../components/templates/Page';
import { ProjectPages } from '../../types/Enums';

class MainPage extends Page {
  private MAIN_PAGE_MARKUP = `
     <h1 class='header'>Main Page</h1>`;

  constructor() {
    super(ProjectPages.MainPage);
  }

  public renderPage(): HTMLElement {
    this.CONTAINER.innerHTML = this.MAIN_PAGE_MARKUP;
    return this.CONTAINER;
  }
}
export default MainPage;
