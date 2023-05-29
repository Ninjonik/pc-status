/// <reference types="cypress" />

describe('status of computers', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/computers');
    cy.get('[data-testid="computer-item"]').each((element) => {
      cy.wait(1000);
    });

    cy.get('[data-testid="computer-item"] [data-testid="action_buttons"] button[id="pinging"]').should('not.exist');
  });

  it('deletes the last element in a grid', () => {
    cy.get('[data-testid="computer-item"]').last().within(() => {
      cy.get('[name="remove"]').click();
    });
  });

  it('clicks on the edit button, changes the name, and checks if the name was changed - last element in a grid', () => {
    cy.get('[data-testid="computer-item"]').last().within(() => {
      cy.get('[name="edit"]').click();
      cy.get('[name="name_input"]').clear().type("#E Computer");
      cy.get('[name="save"]').click();
      cy.wait(1000);
      cy.get('#name').invoke('text').should('contain', '#E Computer');
    });
  });

  it('refreshes and checks if computer goes online and RDP button appears', () => {
    cy.get('[data-testid="computer-item"]').each((element) => {
      cy.wrap(element).find('[data-testid="status_buttons"]').then(($buttons) => {
        if ($buttons.find('[name="offline"]').length > 0) {
          cy.wrap(element).find('[data-testid="action_buttons"] [name="refresh"]').click();
          cy.wait(1000);
          cy.wrap(element).find('[data-testid="status_buttons"]').then(($refreshedButtons) => {
            expect($refreshedButtons.find('[name="offline"]').length).to.eq(0);
            expect($refreshedButtons.find('[name="rdp_error"]').length).to.eq(0);
          });
        } else {
          cy.log('online');
        }
      });

      cy.wait(1000);
    });
  });

  it('wakes and checks if computer goes online and RDP button appears', () => {
    cy.get('[data-testid="computer-item"]').each((element) => {
      cy.wrap(element).find('[data-testid="status_buttons"]').then(($buttons) => {
        if ($buttons.find('[name="offline"]').length > 0) {
          cy.wrap(element).find('[data-testid="status_buttons"] [name="wake"]').click();
          cy.wait(2500);
          cy.wrap(element).find('[data-testid="status_buttons"] [name="rdp_success"]').should('exist');
          cy.wrap(element).find('[data-testid="status_buttons"] [name="offline"]').should('not.exist');
        } else {
          cy.log('online');
        }
      });

      cy.wait(1000);
    });
  });
});
