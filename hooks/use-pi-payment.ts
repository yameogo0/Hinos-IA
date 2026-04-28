'use client';

import { useState } from 'react';
import { BACKEND_URLS } from '@/lib/system-config';

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
}

declare global {
  interface Window {
    Pi: {
      createPayment: (payment: {
        amount: number;
        memo: string;
        metadata: Record<string, any>;
      }, callbacks: {
        onReadyForServerApproval: (paymentId: string) => void;
        onReadyForServerCompletion: (paymentId: string, txid: string) => void;
        onCancel: (paymentId: string) => void;
        onError: (error: Error, payment?: any) => void;
      }) => void;
    };
  }
}

export const usePiPayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>('');

  const createPayment = async (
    amount: number,
    planName: string,
    piAccessToken: string | null
  ): Promise<PaymentResult> => {
    if (!piAccessToken) {
      return {
        success: false,
        error: 'Non authentifié avec Pi Network',
      };
    }

    setIsProcessing(true);
    setPaymentStatus('Initialisation du paiement...');

    return new Promise((resolve) => {
      try {
        window.Pi.createPayment(
          {
            amount,
            memo: `Abonnement ${planName} - Hinos IA`,
            metadata: {
              plan: planName,
              app: 'hinos-ia',
            },
          },
          {
            onReadyForServerApproval: async (paymentId: string) => {
              console.log('[v0] Payment ready for approval:', paymentId);
              setPaymentStatus('Approbation du paiement...');

              try {
                const response = await fetch(BACKEND_URLS.APPROVE_PAYMENT(paymentId), {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${piAccessToken}`,
                  },
                });

                if (!response.ok) {
                  throw new Error('Échec de l\'approbation du paiement');
                }

                console.log('[v0] Payment approved');
              } catch (error) {
                console.error('[v0] Approval error:', error);
                setIsProcessing(false);
                setPaymentStatus('');
                resolve({
                  success: false,
                  error: 'Échec de l\'approbation du paiement',
                });
              }
            },

            onReadyForServerCompletion: async (paymentId: string, txid: string) => {
              console.log('[v0] Payment ready for completion:', paymentId, txid);
              setPaymentStatus('Finalisation du paiement...');

              try {
                const response = await fetch(BACKEND_URLS.COMPLETE_PAYMENT(paymentId), {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${piAccessToken}`,
                  },
                  body: JSON.stringify({ txid }),
                });

                if (!response.ok) {
                  throw new Error('Échec de la finalisation du paiement');
                }

                console.log('[v0] Payment completed successfully');
                setIsProcessing(false);
                setPaymentStatus('');
                resolve({
                  success: true,
                  paymentId,
                });
              } catch (error) {
                console.error('[v0] Completion error:', error);
                setIsProcessing(false);
                setPaymentStatus('');
                resolve({
                  success: false,
                  error: 'Échec de la finalisation du paiement',
                });
              }
            },

            onCancel: (paymentId: string) => {
              console.log('[v0] Payment cancelled:', paymentId);
              setIsProcessing(false);
              setPaymentStatus('');
              resolve({
                success: false,
                error: 'Paiement annulé',
              });
            },

            onError: (error: Error, payment?: any) => {
              console.error('[v0] Payment error:', error, payment);
              setIsProcessing(false);
              setPaymentStatus('');
              resolve({
                success: false,
                error: error.message || 'Erreur de paiement',
              });
            },
          }
        );
      } catch (error) {
        console.error('[v0] Create payment error:', error);
        setIsProcessing(false);
        setPaymentStatus('');
        resolve({
          success: false,
          error: 'Échec de l\'initialisation du paiement',
        });
      }
    });
  };

  return {
    createPayment,
    isProcessing,
    paymentStatus,
  };
};
