describe("/dashboard/projects/[id]/environments/create", () => {
  before(cy.seed);
  after(cy.cleanup);

  describe("not authenticated", () => {
    beforeEach(() => {
      cy.visit("/dashboard/projects/1/environments/create");
    });

    it("checks that the route is protected", () => {
      cy.checkProtectedRoute();
    });
  });

  describe("authenticated", () => {
    describe("user: Jane", () => {
      beforeEach(() => {
        cy.signIn("Jane");
        cy.visit("/dashboard/projects/1/environments/create", {
          failOnStatusCode: false,
        });
      });

      it("shouldnt show anything when Jane tries to visit Marvin s project", () => {
        cy.checkProtectedRoute();
      });
    });

    describe("user: Marvin", () => {
      beforeEach(() => {
        cy.signIn("Marvin");
        cy.visit("/dashboard/projects/1/environments/create");
        cy.injectAxe();
      });

      it("shows the create environment layout", () => {
        cy.title().should(
          "eq",
          "Rollout | Project from seeding | Create an environment"
        );

        cy.findByText("Projects")
          .should("be.visible")
          .and("have.attr", "href", "/dashboard");

        cy.findAllByText("Project from seeding")
          .first()
          .should("be.visible")
          .and("have.attr", "href", "/dashboard/projects/1");

        cy.findByRole("link", { name: "Create an environment" })
          .should("be.visible")
          .and("have.attr", "href", "/dashboard/projects/1/environments/create")
          .and("have.attr", "aria-current", "page");

        cy.get("h1").should("contain", "Create an environment");

        cy.contains(
          "The new environment will appear in Project from seeding."
        ).should("be.visible");

        cy.findByLabelText("Environment name").should("be.visible");
        cy.findByText(
          "After the creation of an environment, you will be able to get its SDK key for application usage."
        ).should("be.visible");

        cy.get("button[type=submit]").should("be.visible");

        cy.checkA11y();
      });

      it("shows an error when submitting an empty form", () => {
        cy.get("button[type=submit]").click();
        cy.get(".error-box").should("have.focus");
        cy.findByText(
          "The name field is required, make sure to have one."
        ).should("be.visible");

        cy.checkA11y();
      });

      it("creates an environment", () => {
        cy.get("input").type("My new env");
        cy.get("button[type=submit]").click();

        cy.get(".success-box").should("have.focus");
        cy.findByText("The environment has been successfully created.").should(
          "be.visible"
        );

        cy.findByText("My new env").should("be.visible");

        cy.url().should("include", "/dashboard/projects/1?newEnvId");

        cy.checkA11y();
      });
    });
  });
});
