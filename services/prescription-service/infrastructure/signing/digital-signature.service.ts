/**
 * Servicio de Firma Digital para Recetas
 * Genera firmas RSA-SHA256 sobre el contenido de las recetas.
 * La firma garantiza:
 * 1. Autenticidad: la receta fue emitida por ese médico.
 * 2. Integridad: el contenido no fue alterado post-firma.
 * 3. No repudio: el médico no puede negar haber emitido la receta.
 * En producción: las claves privadas de los médicos se almacenan en AWS KMS.
 */

import crypto from 'crypto';

export class RsaDigitalSignatureService {
  async sign(data: string, doctorId: string): Promise<string> {
    // En producción: obtener la clave privada del médico desde AWS KMS
    // usando doctorId como identificador del key-pair
    const privateKey = await this.getDoctorPrivateKey(doctorId);

    const sign = crypto.createSign('SHA256');
    sign.update(data);
    sign.end();

    return sign.sign(privateKey, 'base64');
  }

  async verify(data: string, signature: string, doctorId: string): Promise<boolean> {
    const publicKey = await this.getDoctorPublicKey(doctorId);

    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    verify.end();

    return verify.verify(publicKey, signature, 'base64');
  }

  // En producción: llamar a AWS KMS o HSM para obtener la clave
  private async getDoctorPrivateKey(_doctorId: string): Promise<string> {
    // Placeholder: en prod se recupera de KMS
    const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
    return privateKey.export({ type: 'pkcs8', format: 'pem' }) as string;
  }

  private async getDoctorPublicKey(_doctorId: string): Promise<string> {
    const { publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
    return publicKey.export({ type: 'spki', format: 'pem' }) as string;
  }
}
