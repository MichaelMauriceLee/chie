describe('access site', () => {
  it('gets words', () => {
    const url = 'https://en.wiktionary.org/wiki/Appendix:1000_Japanese_basic_words';
    cy.visit(url);
    const results: string [] = [];
    cy.get('a').each((element) => {
      const anchor = element.get(0);
      if (anchor.title) {
        results.push(anchor.title);
      }
    // eslint-disable-next-line no-console
    }).then(() => { console.log(results); });
  });
});
