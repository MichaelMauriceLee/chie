import wordList from '../../src/utils/wordList';

describe('access site', () => {
  it('gets words', () => {
    const url = 'https://www.chie.app';
    cy.visit(url);
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    wordList.forEach((word) => {
      cy.visit(`${url}/results/${encodeURIComponent(word)}`);
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000);
    });
  });
});
