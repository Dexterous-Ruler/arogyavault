/**
 * QR Code Service
 * Handles QR code generation for emergency cards
 */

import QRCode from 'qrcode';
import { randomUUID } from 'crypto';
import { Request } from 'express';
import { getFullURL } from '../utils/urlHelper';

/**
 * Generate a unique token for QR code
 */
export function generateQRToken(): string {
  // Generate a cryptographically random token
  return randomUUID() + randomUUID().replace(/-/g, '');
}

/**
 * Generate QR code image as data URL
 * @param url - The URL to encode in the QR code
 * @returns Promise<string> - Data URL of the QR code image
 */
export async function generateQRCodeDataURL(url: string): Promise<string> {
  try {
    const qrDataURL = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrDataURL;
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate QR code image as buffer
 * @param url - The URL to encode in the QR code
 * @returns Promise<Buffer> - Buffer containing the QR code image
 */
export async function generateQRCodeBuffer(url: string): Promise<Buffer> {
  try {
    const qrBuffer = await QRCode.toBuffer(url, {
      errorCorrectionLevel: 'M',
      type: 'png',
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrBuffer;
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate QR code URL for emergency card
 * @param token - The QR code token
 * @param req - Optional Express request object for runtime URL detection
 * @returns The full URL to encode in QR code
 */
export function generateEmergencyCardURL(token: string, req?: Request): string {
  return getFullURL(`/emergency/view/${token}`, req);
}

