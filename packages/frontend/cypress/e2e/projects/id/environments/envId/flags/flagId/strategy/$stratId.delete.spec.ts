describe("/dashboard/projects/[id]/environments/[envId]/flags/[flagId]/strategies/[stratId]/delete", () => {
  before(cy.seed);
  after(cy.cleanupDb);

  describe("not authenticated", () => {
    beforeEach(() => {
      cy.visit(
        "/dashboard/projects/1/environments/1/flags/1/strategies/1/delete"
      );
    });

    it("checks that the route is protected", () => {
      cy.checkProtectedRoute();
    });
  });

  describe("authenticated", () => {
    describe("user: Jane", () => {
      beforeEach(() => {
        cy.signIn("Jane");
        cy.visit(
          "/dashboard/projects/1/environments/1/flags/1/strategies/1/delete",
          {
            failOnStatusCode: false,
          }
        );
      });

      it("shouldnt show anything when Jane tries to visit Marvin s project", () => {
        cy.checkProtectedRoute();
      });
    });

    describe("user: Marvin", () => {
      beforeEach(() => {
        cy.signIn("Marvin");
        cy.visit(
          "/dashboard/projects/1/environments/1/flags/1/strategies/1/delete"
        );
        cy.injectAxe();
      });

      it("shows the layout of the page", () => {
        cy.title().should(
          "eq",
          "Progressively | Project from seeding | Production | New homepage | Additional audience | Delete"
        );

        cy.findByText("Deleting an additional audience").should("be.visible");

        cy.findByRole("button", {
          name: "Yes, delete the additional audience",
        }).should("be.visible");

        cy.findByRole("link", { name: "Cancel" })
          .should("be.visible")
          .and(
            "have.attr",
            "href",
            "/dashboard/projects/1/environments/1/flags/1"
          );

        cy.checkA11y();
      });
    });

    describe("removing strategy (needs reseeding after each test)", () => {
      beforeEach(cy.seed);
      afterEach(cy.cleanupDb);

      beforeEach(() => {
        cy.signIn("Marvin");
        cy.visit(
          "/dashboard/projects/1/environments/1/flags/1/strategies/1/delete"
        );
      });

      it("removes the strat and get me back to the flags page", () => {
        cy.findByRole("button", {
          name: "Yes, delete the additional audience",
        }).click();

        cy.url().should(
          "contain",
          "/dashboard/projects/1/environments/1/flags/1?stratRemoved=true"
        );

        cy.get(".success-box")
          .should("have.focus")
          .and(
            "contain.text",
            "The additional audience has been successfully removed."
          );
      });
    });
  });
});
