import { db } from './index.ts';
import { alerts, machines } from './schema.ts';
import { desc, eq } from 'drizzle-orm';

export async function getDbAlerts() {
  try {
    return await db.select().from(alerts).orderBy(desc(alerts.createdAt));
  } catch (error) {
    console.error('Database query failed in getDbAlerts:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function createDbAlert(alertData: {
  id: string;
  machineId?: string;
  machineName?: string;
  severity: string;
  metric: string;
  value?: string;
  threshold?: string;
  message: string;
  timestamp?: string;
}) {
  try {
    const result = await db.insert(alerts)
      .values({
        id: alertData.id,
        machineId: alertData.machineId,
        machineName: alertData.machineName,
        severity: alertData.severity,
        metric: alertData.metric,
        value: alertData.value,
        threshold: alertData.threshold,
        message: alertData.message,
        timestamp: alertData.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        acknowledged: false,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in createDbAlert:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function acknowledgeDbAlert(alertId: string, assignedTo?: string) {
  try {
    const result = await db.update(alerts)
      .set({
        acknowledged: true,
        ...(assignedTo ? { assignedTo } : {}),
      })
      .where(eq(alerts.id, alertId))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in acknowledgeDbAlert:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
