'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const reason = searchParams.get('reason');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isSuccess = status === 'success';

  const getErrorMessage = () => {
    switch (reason) {
      case 'invalid_token':
        return 'El enlace de verificación es inválido o ha expirado.';
      case 'token_expired':
        return 'El enlace de verificación ha expirado. Por favor, solicita uno nuevo.';
      case 'server_error':
        return 'Ocurrió un error al procesar tu verificación. Intenta más tarde.';
      default:
        return 'No se pudo verificar tu correo electrónico.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {isSuccess ? (
          <>
            {/* Success state */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Email Verificado!
              </h1>
              <p className="text-gray-600">
                Tu correo electrónico ha sido verificado correctamente.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                Ahora puedes iniciar sesión en tu cuenta y acceder a todos los servicios del gimnasio.
              </p>
            </div>

            <div className="text-center mt-2">
              <p className="text-sm text-gray-700">Puedes cerrar esta ventana. Si no puedes iniciar sesión, solicita ayuda a soporte.</p>
            </div>
          </>
        ) : (
          <>
            {/* Error state */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Error en la Verificación
              </h1>
              <p className="text-gray-600">
                {getErrorMessage()}
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 mb-2">
                <span className="font-semibold">Posibles soluciones:</span>
              </p>
              <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                <li>Verifica que hayas copiado el enlace completo del email</li>
                <li>Intenta solicitar un nuevo enlace de verificación</li>
                <li>Contacta con soporte si el problema persiste</li>
              </ul>
            </div>

            <div className="text-center mt-2">
              <p className="text-sm text-gray-700">Si necesitas un nuevo enlace o ayuda, ponte en contacto con soporte.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
