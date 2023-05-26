/// <reference types="cypress" />

describe('status of computers', () => {
  before(() => {
    cy.visit('http://localhost:3000/add');
  });
  it('fills out the form with valid data', () => {
    cy.wait(1000);
    cy.get('[id="computerName"]').type("PC Test");
    cy.get('[id="macAddress"]').type("FF-FF-FF-FF-FF-FF");
    cy.get('[id="ipAddress"]').type("1.1.1.1");
    cy.get('[id="form"]').submit()
      .next().should('contain', 'úspešne');
  });
});
