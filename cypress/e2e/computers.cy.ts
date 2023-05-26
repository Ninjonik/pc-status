/// <reference types="cypress" />

describe('status of computers', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/computers');
    cy.get('[data-testid="computer-item"]').each((element, index) => {
      cy.wait(1000);
    });

    cy.get('[data-testid="computer-item"] [data-testid="action_buttons"] button[name="pinging"]').should('not.exist');
  });

  it('deletes the last element in a grid', () => {
    const lastElement = cy.get('[data-testid="computer-item"]').last();
    lastElement.find('[name="remove"]').click();
  });

  it('refreshes and checks if computer goes online and RDP button appears', () => {
    cy.get('[data-testid="computer-item"]').each((element, index) => {
      const statusButtons = cy.wrap(element).find('[data-testid="status_buttons"]');
      
      statusButtons.then(($buttons) => {
        if ($buttons.find('[name="offline"]').length > 0) {
          const actionButtons = cy.wrap(element).find('[data-testid="action_buttons"]');
          actionButtons.find('[name="refresh"]').click();
          cy.wait(1000);
          const refreshedStatusButtons = cy.wrap(element).find('[data-testid="status_buttons"]');
          refreshedStatusButtons.then(($buttons) => {
            if ($buttons.find('[name="offline"]').length > 0 || $buttons.find('[name="rdp_error"]').length > 0) {
              throw new Error("Online and RDP Success buttons have not been found.")
            } else {
              cy.log("everything fine");
            }
          });
        } else {
          cy.log('online');
        }
      });

      cy.wait(1000);
    });
  });

  it('wakes and checks if computer goes online and RDP button appears', () => {
    cy.get('[data-testid="computer-item"]').each((element, index) => {
      const statusButtons = cy.wrap(element).find('[data-testid="status_buttons"]');
      statusButtons.then(($buttons) => {
        if ($buttons.find('[name="offline"]').length > 0) { 
          statusButtons.find('[name="wake"]').click();
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
