
import * as admin from 'firebase-admin';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';

const initializeAdminApp = (): admin.app.App => {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }
  
  // Quando executando em um ambiente Google Cloud (como o Firebase App Hosting),
  // o SDK usa automaticamente as GOOGLE_APPLICATION_CREDENTIALS.
  // Localmente, essa variável de ambiente precisa ser definida para o seu arquivo de chave de serviço.
  return admin.initializeApp();
}

// Funções getter para garantir que a inicialização ocorra antes do acesso.
export const getAuthAdmin = (): Auth => {
  initializeAdminApp();
  return admin.auth();
};

export const getFirestoreAdmin = (): Firestore => {
  initializeAdminApp();
  return admin.firestore();
};
