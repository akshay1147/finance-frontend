import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';

// Mock dependent services
vi.mock('@/services/api_client', () => ({
  apiClient: {
    createPaymentIntent: vi.fn().mockResolvedValue({
      success: true,
      data: { clientSecret: 'test_secret' },
      message: 'Intent created',
    }),
  },
}));
vi.mock('@/services/error_monitor', () => ({
  errorMonitor: { trackPaymentFailure: vi.fn() },
}));

// Mock Stripe hooks
vi.mock('@stripe/react-stripe-js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    __esModule: true,
    Elements: ({ children }) => <>{children}</>,
    useStripe: vi.fn(),
    useElements: vi.fn(),
  };
});

import StripePaymentForm from '@/components/payments/StripePaymentForm';

describe('StripePaymentForm integration', () => {
  it('processes a successful payment', async () => {
    const invoice = {
      invoice_id: 'inv123',
      total_amount: 1000,
      currency: 'usd',
      invoice_number: 'INV-001',
    } as any;
    const onSuccess = vi.fn();

    const { getByLabelText, getByText } = render(
      <StripePaymentForm invoice={invoice} onSuccess={onSuccess} />
    );

    // Fill name input
    const nameInput = getByLabelText(/cardholder name/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });

    // Mock Stripe objects
    const mockStripe = {
      createPaymentMethod: vi.fn().mockResolvedValue({ paymentMethod: { id: 'pm_1' } }),
      confirmPayment: vi.fn().mockResolvedValue({ paymentIntent: { id: 'pi_1' } }),
    } as any;
    const mockElements = { getElement: () => ({}) } as any;
    const { useStripe, useElements } = require('@stripe/react-stripe-js');
    (useStripe as any).mockReturnValue(mockStripe);
    (useElements as any).mockReturnValue(mockElements);

    const submitButton = getByText(/authorize payment & settlement/i);
    fireEvent.click(submitButton);

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('pi_1'));
    expect(require('@/services/error_monitor').errorMonitor.trackPaymentFailure).not.toHaveBeenCalled();
  });
});
