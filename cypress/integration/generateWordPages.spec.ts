import wordList from '../../src/utils/wordList';

describe('access site', () => {
  it('gets words', () => {
    const url = 'https://www.chie.app';
    cy.visit(url);
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
    wordList.forEach((word) => {
      cy.visit(`${url}/results/${word}`);
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(500);
    });
  });
});
