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

  it("selects a new deck and saves the selection when Anki is connected", () => {
    cy.intercept("POST","http://localhost:8765", (req) => {
      const data = JSON.parse(req.body)
      if (data.action === "deckNames") {
        req.reply({
          statusCode: 200,
          body: {
            result: [
              "Default",
              "\u65e5\u672c\u8a9e",
              "\u65e5\u672c\u8a9e::Steins;Gate",
              "\u65e5\u672c\u8a9e::VR\u304a\u3058\u3055\u3093\u306e\u521d\u604b",
              "\u65e5\u672c\u8a9e::\u200e\u30d5\u30a1\u30a4\u30ca\u30eb\u30d5\u30a1\u30f3\u30bf\u30b8\u30fc",
              "\u65e5\u672c\u8a9e::\u3068\u304d\u3081\u304d\u30e1\u30e2\u30ea\u30a2\u30eb",
              "\u65e5\u672c\u8a9e::\u30a2\u30a4\u30c9\u30eb\u30de\u30b9\u30bf\u30fc",
              "\u65e5\u672c\u8a9e::\u30b4\u30d6\u30ea\u30f3\u30b9\u30ec\u30a4\u30e4\u30fc",
              "\u65e5\u672c\u8a9e::\u30be\u30f3\u30d3\u30e9\u30f3\u30c9\u30b5\u30ac",
              "\u65e5\u672c\u8a9e::\u30cb\u30e5\u30fc\u30b9",
              "\u65e5\u672c\u8a9e::\u4e94\u7b49\u5206\u306e\u82b1\u5ac1",
              "\u65e5\u672c\u8a9e::\u4eba\u3092\u52d5\u304b\u3059",
              "\u65e5\u672c\u8a9e::\u5a18\u3058\u3083\u306a\u304f\u3066\u79c1\u304c\u597d\u304d\u306a\u306e\uff01\uff1f",
              "\u65e5\u672c\u8a9e::\u6226\u5834\u306e\u30f4\u30a1\u30eb\u30ad\u30e5\u30ea\u30a2",
              "\u65e5\u672c\u8a9e::\u9f8d\u304c\u5982\u304f",
            ],
            error: null,
          },
        });
      } else {
        req.reply({
          statusCode: 200,
          body: {
            result: [],
            error: null,
          },
        });
      }
    }).as("getAnkiInfo");

    cy.get("[data-cy=current-deck-title]").contains("Current Deck");
    cy.get("[data-cy=deck-name-button]").should("have.length", 15);
    cy.get("[data-cy=deck-name-button]").eq(2).click();
    cy.get("[data-cy=save-button]").contains("Save").click();
    cy.get("[data-cy=settings-button]").click();
    cy.get("[data-cy=deck-name-button").eq(2).should("be.disabled");
  });
});
