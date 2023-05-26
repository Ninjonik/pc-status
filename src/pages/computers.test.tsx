import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Computers from './computers';

test('checks if all computers have been pinged and no longer have the pinging button', async () => {
  render(<Computers />);

  // Get all computer elements in the grid
  const computerElements = screen.getAllByTestId('computer-item');

  // Iterate through each computer element and wait for it to be pinged
  for (const computerElement of computerElements) {
    // Wait for 1 second for each computer to be pinged
    await waitFor(() => {
      expect(computerElement.textContent).not.toBe('Pinging')
    }, { timeout: 1000 });
  }

  // Check if all computers have been pinged - no longer have the pinging button
  const pingButtons = screen.queryAllByRole('button', { name: 'ping' });
  expect(pingButtons).toHaveLength(0);
});