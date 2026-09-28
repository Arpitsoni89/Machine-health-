import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  getDocFromServer 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { MaintenanceAlert, UserProfile, CustomerFeedbackItem } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
  return errInfo;
}

// Test Connection Helper
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is running in offline cached mode.');
    }
  }
}

// Save User Profile to Firestore
export async function syncUserProfileToFirestore(profile: UserProfile) {
  const path = `users/${profile.id}`;
  try {
    await setDoc(doc(db, 'users', profile.id), {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar,
      role: profile.role,
      facility: profile.facility,
      provider: profile.provider,
      loginTime: profile.loginTime,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Save Maintenance Alert to Firestore
export async function saveAlertToFirestore(alert: MaintenanceAlert) {
  const path = `maintenance_alerts/${alert.id}`;
  try {
    await setDoc(doc(db, 'maintenance_alerts', alert.id), {
      id: alert.id,
      machineId: alert.machineId,
      machineName: alert.machineName,
      severity: alert.severity,
      metric: alert.metric,
      value: alert.value,
      threshold: alert.threshold,
      message: alert.message,
      timestamp: alert.timestamp,
      acknowledged: alert.acknowledged,
      assignedTo: alert.assignedTo || null,
      isRepaired: alert.isRepaired || false,
      createdAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Subscribe to Maintenance Alerts
export function subscribeToFirestoreAlerts(
  onUpdate: (alerts: MaintenanceAlert[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'maintenance_alerts';
  try {
    const alertsQuery = query(collection(db, 'maintenance_alerts'));
    return onSnapshot(
      alertsQuery,
      (snapshot) => {
        const loaded: MaintenanceAlert[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push(docSnap.data() as MaintenanceAlert);
        });
        if (loaded.length > 0) {
          onUpdate(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return () => {};
  }
}

// Save Customer Feedback to Firestore
export async function saveCustomerFeedbackToFirestore(feedback: CustomerFeedbackItem) {
  const path = `customer_feedback/${feedback.id}`;
  try {
    await setDoc(doc(db, 'customer_feedback', feedback.id), {
      id: feedback.id,
      rating: feedback.rating,
      category: feedback.category,
      categoryLabel: feedback.categoryLabel,
      authorName: feedback.authorName,
      authorRole: feedback.authorRole,
      facilityName: feedback.facilityName,
      userEmail: feedback.userEmail,
      npsScore: feedback.npsScore,
      tags: feedback.tags || [],
      feedbackMessage: feedback.feedbackMessage,
      timestamp: feedback.timestamp,
      verified: feedback.verified,
      officialReply: feedback.officialReply || null,
      createdAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Subscribe to Customer Feedback
export function subscribeToCustomerFeedback(
  onUpdate: (feedbackList: CustomerFeedbackItem[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'customer_feedback';
  try {
    const feedbackQuery = query(collection(db, 'customer_feedback'));
    return onSnapshot(
      feedbackQuery,
      (snapshot) => {
        const loaded: CustomerFeedbackItem[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push(docSnap.data() as CustomerFeedbackItem);
        });
        if (loaded.length > 0) {
          onUpdate(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return () => {};
  }
}

