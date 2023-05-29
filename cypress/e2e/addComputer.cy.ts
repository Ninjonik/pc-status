/// <reference types="cypress" />

describe('status of computers', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/add');
  });

  it('fills out the form with valid data', () => {
    cy.wait(1000);
    cy.get('[id="computerName"]').type("PC Test");
  
    // Generate a random MAC address
    const macAddress = generateRandomHex(6, 2, '-');
  
    cy.get('[id="macAddress"]').type(macAddress);
  
    // Generate a random IP address
    const ipAddress = generateRandomNumber(1, 255) + '.' +
                      generateRandomNumber(0, 255) + '.' +
                      generateRandomNumber(0, 255) + '.' +
                      generateRandomNumber(1, 254);
  
    cy.get('[id="ipAddress"]').type(ipAddress);
  
    cy.get('[id="form"]').submit()
      .next().should('contain', 'úspešne');
  });
  
  // Function to generate a random hex string
  function generateRandomHex(length, segmentLength, separator) {
    const characters = 'ABCDEF0123456789';
    let hexString = '';
  
    for (let i = 0; i < length; i++) {
      for (let j = 0; j < segmentLength; j++) {
        hexString += characters.charAt(Math.floor(Math.random() * characters.length));
      }
  
      if (i !== length - 1) {
        hexString += separator;
      }
    }
  
    return hexString;
  }
  
  // Function to generate a random number within a range
  function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  

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
