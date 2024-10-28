import admin from 'firebase-admin';

// Khởi tạo Firebase Admin SDK nếu chưa có
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH))
  });
}

export async function verifyTokenAndGetUserId(authHeader) {
  if (!authHeader) {
    throw new Error('No Authorization header provided');
  }

  const token = authHeader.split(' ')[1]; 
  try {
    const decodedToken = await admin.auth().verifyIdToken(token); 
    return decodedToken.uid; 
  } catch (error) {
    console.error('Error verifying token:', error.message);
    throw new Error('Invalid or expired token');
  }
}

export const auth = admin.auth();