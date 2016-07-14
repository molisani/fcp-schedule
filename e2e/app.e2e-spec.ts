import { FcpSchedulePage } from './app.po';

describe('fcp-schedule App', function() {
  let page: FcpSchedulePage;

  beforeEach(() => {
    page = new FcpSchedulePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
