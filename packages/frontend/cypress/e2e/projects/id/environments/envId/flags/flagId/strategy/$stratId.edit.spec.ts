describe("/dashboard/projects/[id]/environments/[envId]/flags/[flagId]/strategies/[stratId]/1/edit", () => {
  before(cy.seed);
  after(cy.cleanup);

  describe("not authenticated", () => {
    beforeEach(() => {
      cy.visit(
        "/dashboard/projects/1/environments/1/flags/1/strategies/1/edit"
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
          "/dashboard/projects/1/environments/1/flags/1/strategies/1/edit",
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
          "/dashboard/projects/1/environments/1/flags/1/strategies/1/edit"
        );

        cy.injectAxe();
      });

      it("shows the layout", () => {
        cy.title().should(
          "eq",
          "Progressively | Project from seeding | Production | Flags | New homepage | Super strategy | Edit"
        );

        cy.findByRole("link", { name: "Projects" })
          .should("be.visible")
          .and("have.attr", "href", "/dashboard");

        cy.findByRole("link", { name: "Project from seeding" })
          .should("be.visible")
          .and("have.attr", "href", "/dashboard/projects/1");

        cy.findByRole("link", { name: "Production" })
          .should("be.visible")
          .and(
            "have.attr",
            "href",
            "/dashboard/projects/1/environments/1/flags"
          );

        cy.findByRole("link", { name: "New homepage" })
          .should("be.visible")
          .and(
            "have.attr",
            "href",
            "/dashboard/projects/1/environments/1/flags/1"
          );

        cy.findByRole("link", { name: "Edit Super strategy" })
          .should("be.visible")
          .and(
            "have.attr",
            "href",
            "/dashboard/projects/1/environments/1/flags/1/strategies/1/edit"
          )
          .and("have.attr", "aria-current", "page");

        cy.findByRole("heading", { name: "Edit Super strategy" }).should(
          "be.visible"
        );

        cy.checkA11y();
      });

      it("shows the form layout", () => {
        // General section
        cy.findByRole("heading", { name: "General information" }).should(
          "be.visible"
        );

        cy.findByLabelText("Strategy name").should("be.visible");

        cy.findByRole("heading", { name: "Targeting criteria" }).should(
          "be.visible"
        );
        cy.findByLabelText("Everybody is concerned").should("be.visible");
        cy.findByLabelText("People with a specific field").should("be.visible");

        cy.findByRole("button", { name: "Save the strategy" }).should(
          "be.visible"
        );

        cy.checkA11y();
      });

      it("shows a list of errors when the field are not filled", () => {
        cy.findByLabelText("People with a specific field").click({
          force: true,
        });
        cy.findByRole("button", { name: "Save the strategy" }).click();

        cy.get(".error-box")
          .should("have.focus")
          .and("contain.text", "The following 2 errors have been found:")
          .and("contain.text", "The field name is required.")
          .and("contain.text", "The field values are required.");

        cy.checkA11y();
      });

      it("updates a strategy", () => {
        cy.findByLabelText("Strategy name").type("New strategy");
        cy.findByRole("button", { name: "Save the strategy" }).click();

        cy.url().should(
          "include",
          "/dashboard/projects/1/environments/1/flags/1?strategyUpdated=true"
        );

        cy.get(".success-box")
          .should("have.focus")
          .and("contain.text", "The strategy has been successfully updated.");

        cy.findAllByText("Super strategyNew strategy").should("be.visible");

        cy.checkA11y();
      });
    });
  });
});