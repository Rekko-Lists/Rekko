export interface AccessTokenClaims {
  userId: number;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  emailVerified: boolean;
}

/**
 * Decodifica los claims del access token firmado por el backend. Es la
 * fuente de verdad de identidad/autorizacion en el cliente: no se persiste
 * nada en localStorage que un usuario pueda editar para suplantar la UI.
 */
export function decodeAccessToken(token: string): AccessTokenClaims {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded));
    return {
      userId: Number(payload.userId ?? payload.sub ?? payload.id),
      role: payload.role ?? 'USER',
      emailVerified: Boolean(payload.emailVerified),
    };
  } catch {
    throw new Error('Failed to decode access token');
  }
}

export function decodeJwtUserId(token: string): number {
  return decodeAccessToken(token).userId;
}
