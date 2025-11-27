export enum Role {
  USER = "USER",
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  COMPANY = "COMPANY",
}

export enum ReservationStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
}

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum NotificationType {
  EMAIL = "email",
  SMS = "sms",
  PUSH = "push",
}
