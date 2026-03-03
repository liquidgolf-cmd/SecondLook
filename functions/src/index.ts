import * as admin from 'firebase-admin'

// Initialize Firebase Admin SDK once at module load
admin.initializeApp()

export { analyze } from './analyze'
export { notify } from './notify'
export { onUserCreated } from './onUserCreated'
