/// <reference types="cypress" />

describe('status of computers', () => {
  beforeEach(() => {
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

  it('fills out the form with invalid MAC Address', () => {
    cy.wait(1000);
    cy.get('[id="computerName"]').type("PC Invalid MAC");
    cy.get('[id="macAddress"]').type("FF-FF-FF-FF-FF-FG");
    cy.get('[id="ipAddress"]').type("1.1.1.1");
    cy.get('[id="form"]').submit()
      .next().should('contain', 'Neplatná');
  });

  it('fills out the form with invalid IP Address', () => {
    cy.wait(1000);
    cy.get('[id="computerName"]').type("PC Invalid IP");
    cy.get('[id="macAddress"]').type("FF-FF-FF-FF-FF-FF");
    cy.get('[id="ipAddress"]').type("299.299.299.299");
    cy.get('[id="form"]').submit()
      .next().should('contain', 'Neplatná');
  });
});
