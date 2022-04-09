describe("settings", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get("[data-cy=settings-button]").click();
  });

  it("opens and displays right message with no connection", () => {
    cy.get("[data-cy=no-connection-title]").contains("No connection");
    cy.get("[data-cy=no-connection-info]").contains(
      "You must connect Anki in order to access settings. Find out more "
    );
    cy.get("[data-cy=link-to-setup-page]").contains("here.");
  });
});
