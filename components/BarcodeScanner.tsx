'use client';

import React, { useState, useEffect, useRef } from 'react';
import Quagga from '@ericblade/quagga2';

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  onError?: (error: string) => void;
}

export default function BarcodeScanner({ onDetected, onError }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [lastBarcode, setLastBarcode] = useState<string>('');
  const scannerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create beep sound for successful scan
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKXh8LNjHgU5k9n0zXgsBS13yPLaizsKElyw6OunVRQLSKDh8r9uIAQph8rx2Io2CBlotO3mnEwMDlCl4fCzYx4FOZPa9M14LAUtd8jy2os7ChJcsOjrp1UVC0ig4fK/biAEKYfK8diKNggaaLTt5pxMDA5QpeHws2MeBTmT2vTNeCwFLXfI8tqLOwoSXLDo66dVFQtIoOHyv24gBCmHyvHYijYIGmi07eacTAwOUKXh8LNjHgU5k9r0zXgsBS13yPLaizsKElyw6OunVRULSKDh8r9uIAQph8rx2Io2CBpotO3mnEwMDlCl4fCzYx4FOZPa9M14LAUtd8jy2os7ChJcsOjrp1UVC0ig4fK/biAEKYfK8diKNggaaLTt5pxMDA5QpeHws2MeBTmT2vTNeCwFLXfI8tqLOwoSXLDo66dVFQtIoOHyv24gBCmHyvHYijYIGmi07eacTAwOUKXh8LNjHgU5k9r0zXgsBS13yPLaizsKElyw6OunVRULSKDh8r9uIAQph8rx2Io2CBpotO3mnEwMDlCl4fCzYx4FOZPa9M14LAUtd8jy2os7ChJcsOjrp1UVC0ig4fK/biAEKYfK8diKNggaaLTt5pxMDA5QpeHws2MeBTmT2vTNeCwFLXfI8tqLOwoSXLDo66dVFQtIoOHyv24gBCmHyvHYijYIGmi07eacTAwOUKXh8LNjHgU5k9r0zXgsBS13yPLaizsKElyw6OunVRULSKDh8r9uIAQph8rx2Io2CBpotO3mnEwMDlCl4fCzYx4FOZPa9M14LAUtd8jy2os7ChJcsOjrp1UVC0ig4fK/biAEKYfK8diKNggaaLTt5pxMDA5QpeHws2MeBTmT2vTNeCwFLXfI8tqLOwoSXLDo66dVFQtIoOHyv24gBCmHyvHYijYIGmi07eacTAwOUKXh8LNjHgU5k9r0zXgsBS13yPLaizsKElyw6OunVRULSKDh8r9uIAQph8rx2Io2CBpotO3mnEwMDlCl4fCzYx4FOZPa9M14LAUtd8jy2os7ChJcsOjrp1UVC0ig4fK/biAEKYfK8diKNggaaLTt5pxMDA5QpeHws2MeBTmT2vTNeCwFLXfI8tqLOwoSXLDo66dVFQtIoOHyv24gBCmHyvHYijYIGmi07eacTAwOUKXh8LNjHgU5k9r0zXgsBS13yPLaizsKElyw6OunVRULSKDh8r9uIAQph8rx2Io2CBpotO3mnEwMDlCl4fCzYx4FOZPa9M14LAUtd8jy2os7ChJcsOjrp1UVC0ig4fK/biAEKYfK8diKNggaaLTt5pxMDA5QpeHws2MeBTmT2vTNeCwFLXfI8tqLOwoSXLDo66dVFQ==');
    }
  }, []);

  const startScanning = async () => {
    if (!scannerRef.current) {
      onError?.('Scanner container not found');
      return;
    }

    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream
      setHasPermission(true);

      // Initialize Quagga
      Quagga.init(
        {
          inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: scannerRef.current,
            constraints: {
              width: { min: 640, ideal: 1280, max: 1920 },
              height: { min: 480, ideal: 720, max: 1080 },
              facingMode: 'environment',
              aspectRatio: { min: 1, max: 2 }
            },
          },
          locator: {
            patchSize: 'medium',
            halfSample: true
          },
          numOfWorkers: navigator.hardwareConcurrency || 4,
          decoder: {
            readers: [
              {
                format: 'upc_reader',
                config: {}
              },
              {
                format: 'upc_e_reader',
                config: {}
              },
              {
                format: 'ean_reader',
                config: {}
              }
            ],
            multiple: false
          },
          locate: true,
          frequency: 10,
        },
        (err) => {
          if (err) {
            console.error('Quagga initialization error:', err);
            setHasPermission(false);
            onError?.(`Failed to initialize scanner: ${err.message || 'Unknown error'}`);
            return;
          }

          Quagga.start();
          setIsScanning(true);
        }
      );

      // Set up detection handler
      Quagga.onDetected(handleDetected);
    } catch (err: any) {
      console.error('Camera permission error:', err);
      setHasPermission(false);
      onError?.(`Camera access denied: ${err.message || 'Please allow camera access'}`);
    }
  };

  const handleDetected = (result: any) => {
    if (!result || !result.codeResult) return;

    const code = result.codeResult.code;

    // Prevent duplicate rapid scans
    if (code === lastBarcode) return;

    setLastBarcode(code);

    // Play beep sound
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Ignore audio play errors
      });
    }

    // Visual feedback
    if (scannerRef.current) {
      scannerRef.current.style.borderColor = '#10b981';
      setTimeout(() => {
        if (scannerRef.current) {
          scannerRef.current.style.borderColor = '#dc2626';
        }
      }, 500);
    }

    onDetected(code);

    // Reset last barcode after delay to allow re-scanning
    setTimeout(() => {
      setLastBarcode('');
    }, 2000);
  };

  const stopScanning = () => {
    if (isScanning) {
      Quagga.stop();
      Quagga.offDetected(handleDetected);
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden border-4 border-red-600 mb-4">
        <div ref={scannerRef} className="absolute inset-0">
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center text-gray-400">
                {hasPermission === false ? (
                  <div>
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-lg font-semibold">Camera Access Required</p>
                    <p className="text-sm mt-2">Please allow camera access to scan barcodes</p>
                  </div>
                ) : (
                  <div>
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-lg font-semibold">Ready to Scan</p>
                    <p className="text-sm mt-2">Press Start to begin scanning</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Scanning overlay */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-32 border-2 border-red-500 rounded-lg">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-red-500 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-red-500 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-red-500 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-red-500 rounded-br-lg"></div>
            </div>
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <div className="inline-block bg-black bg-opacity-75 text-white px-4 py-2 rounded-full text-sm">
                Scanning for barcode...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-4 w-full">
        {!isScanning ? (
          <button
            onClick={startScanning}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start Scanning
          </button>
        ) : (
          <button
            onClick={stopScanning}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            Stop Scanning
          </button>
        )}
      </div>

      {/* Last scanned barcode */}
      {lastBarcode && (
        <div className="mt-4 w-full bg-green-900 bg-opacity-30 border border-green-600 rounded-lg p-4">
          <p className="text-sm text-green-400 mb-1">Last Scanned:</p>
          <p className="text-2xl font-mono font-bold text-green-300">{lastBarcode}</p>
        </div>
      )}
    </div>
  );
}
