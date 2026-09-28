import { relations } from 'drizzle-orm';
import { boolean, doublePrecision, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('Plant Operations Manager'),
  facility: text('facility').default('Plant Alpha - Alwar Manufacturing Hub'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Industrial Machines table
export const machines = pgTable('machines', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  tag: text('tag').notNull(),
  category: text('category').notNull(),
  location: text('location'),
  status: text('status').default('normal'),
  healthScore: integer('health_score').default(95),
  temperature: doublePrecision('temperature').default(45.0),
  vibration: doublePrecision('vibration').default(1.8),
  power: doublePrecision('power').default(15.0),
  riskScore: integer('risk_score').default(8),
  lastMaintained: text('last_maintained'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Maintenance Alerts table
export const alerts = pgTable('alerts', {
  id: text('id').primaryKey(),
  machineId: text('machine_id'),
  machineName: text('machine_name'),
  severity: text('severity').notNull(), // 'critical' | 'warning'
  metric: text('metric').notNull(),
  value: text('value'),
  threshold: text('threshold'),
  message: text('message').notNull(),
  timestamp: text('timestamp'),
  acknowledged: boolean('acknowledged').default(false),
  assignedTo: text('assigned_to'),
  isRepaired: boolean('is_repaired').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Telemetry Logs table
export const telemetryLogs = pgTable('telemetry_logs', {
  id: serial('id').primaryKey(),
  machineId: text('machine_id'),
  temperature: doublePrecision('temperature'),
  vibration: doublePrecision('vibration'),
  power: doublePrecision('power'),
  riskScore: integer('risk_score'),
  isAnomaly: boolean('is_anomaly').default(false),
  recordedAt: timestamp('recorded_at').defaultNow(),
});

// Relationships
export const usersRelations = relations(users, () => ({}));
