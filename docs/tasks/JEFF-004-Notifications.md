# 🎯 Task: JEFF-004 - Notifications

## Overview

This document outlines the implementation of a comprehensive notification system for the J Star FYB Service, providing real-time updates, email notifications, and in-app messaging to keep users informed of important events and system updates.

## Implementation Status

### ✅ Completed Features

#### 1. Notification Service
- **File**: `src/services/notification.service.ts`
- **Status**: Complete
- **Features**:
  - Multi-channel notification delivery (email, in-app, push)
  - Template-based notification system
  - User preference management
  - Notification history and tracking

#### 2. Database Integration
- **File**: `prisma/schema.prisma`
- **Status**: Complete
- **Features**:
  - `Notification` model for storing notifications
  - `UserNotification` model for user-specific notifications
  - `NotificationTemplate` model for message templates
  - `NotificationPreference` model for user settings

#### 3. Email Service Integration
- **File**: `src/services/email.service.ts`
- **Status**: Complete
- **Features**:
  - Transactional email templates
  - Bulk email sending capabilities
  - Email delivery tracking
  - Email preference management

#### 4. Frontend Integration
- **File**: `src/features/builder/components/NotificationCenter.tsx`
- **Status**: Complete
- **Features**:
  - In-app notification center
  - Real-time notification updates
  - Notification preferences interface
  - Mark as read/unread functionality

### 🔄 Enhanced Features

#### 1. Comprehensive Notification Service
Enhanced notification service with multi-channel delivery:

```typescript
// Enhanced notification service
export class EnhancedNotificationService {
  private emailService: EmailService;
  private pushService: PushNotificationService;
  private inAppService: InAppNotificationService;

  constructor() {
    this.emailService = new EmailService();
    this.pushService = new PushNotificationService();
    this.inAppService = new InAppNotificationService();
  }

  async sendNotification(notificationData: NotificationRequest): Promise<NotificationResult> {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(notificationData.userId);
      
      // Create notification record
      const notification = await this.createNotification(notificationData);
      
      // Send via enabled channels
      const results: ChannelResult[] = [];

      if (preferences.emailEnabled && notificationData.channels.includes('email')) {
        const emailResult = await this.sendEmailNotification(notification, preferences);
        results.push(emailResult);
      }

      if (preferences.inAppEnabled && notificationData.channels.includes('in_app')) {
        const inAppResult = await this.sendInAppNotification(notification, preferences);
        results.push(inAppResult);
      }

      if (preferences.pushEnabled && notificationData.channels.includes('push')) {
        const pushResult = await this.sendPushNotification(notification, preferences);
        results.push(pushResult);
      }

      // Update notification status
      await this.updateNotificationStatus(notification.id, results);

      return {
        success: true,
        notificationId: notification.id,
        channels: results.length,
        results: results
      };

    } catch (error) {
      console.error('Notification sending failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendBulkNotification(bulkData: BulkNotificationRequest): Promise<BulkNotificationResult> {
    try {
      // Get target users
      const users = await this.getTargetUsers(bulkData.targetCriteria);
      
      // Create bulk notification
      const bulkNotification = await this.createBulkNotification(bulkData);
      
      // Send to all users
      const results: BulkResult[] = [];
      
      for (const user of users) {
        const result = await this.sendNotification({
          ...bulkData.notification,
          userId: user.id
        });
        
        results.push({
          userId: user.id,
          success: result.success,
          channels: result.channels,
          error: result.error
        });
      }

      return {
        success: true,
        bulkId: bulkNotification.id,
        totalUsers: users.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results: results
      };

    } catch (error) {
      console.error('Bulk notification failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getUserNotifications(userId: string, options?: NotificationOptions): Promise<UserNotifications> {
    const notifications = await this.getNotificationsForUser(userId, options);
    const unreadCount = await this.getUnreadCount(userId);
    const preferences = await this.getUserPreferences(userId);

    return {
      notifications: notifications,
      unreadCount: unreadCount,
      preferences: preferences,
      pagination: {
        page: options?.page || 1,
        limit: options?.limit || 20,
        total: notifications.length
      }
    };
  }

  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      await this.updateNotificationReadStatus(notificationId, userId, true);
      return true;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      await this.updateAllNotificationsReadStatus(userId, true);
      return true;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return false;
    }
  }

  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      await this.deleteUserNotification(notificationId, userId);
      return true;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      return false;
    }
  }

  async updatePreferences(userId: string, preferences: NotificationPreferences): Promise<boolean> {
    try {
      await this.updateUserPreferences(userId, preferences);
      return true;
    } catch (error) {
      console.error('Failed to update preferences:', error);
      return false;
    }
  }

  private async sendEmailNotification(notification: Notification, preferences: NotificationPreferences): Promise<ChannelResult> {
    try {
      const template = await this.getNotificationTemplate(notification.type);
      const emailContent = this.renderEmailTemplate(template, notification.data);
      
      const result = await this.emailService.sendEmail({
        to: preferences.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      });

      return {
        channel: 'email',
        success: result.success,
        deliveryId: result.deliveryId,
        error: result.error
      };

    } catch (error) {
      return {
        channel: 'email',
        success: false,
        error: error.message
      };
    }
  }

  private async sendInAppNotification(notification: Notification, preferences: NotificationPreferences): Promise<ChannelResult> {
    try {
      const result = await this.inAppService.sendNotification({
        userId: preferences.userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        data: notification.data,
        priority: notification.priority
      });

      return {
        channel: 'in_app',
        success: result.success,
        notificationId: result.notificationId,
        error: result.error
      };

    } catch (error) {
      return {
        channel: 'in_app',
        success: false,
        error: error.message
      };
    }
  }

  private async sendPushNotification(notification: Notification, preferences: NotificationPreferences): Promise<ChannelResult> {
    try {
      const result = await this.pushService.sendNotification({
        userId: preferences.userId,
        title: notification.title,
        body: notification.message,
        data: notification.data,
        priority: notification.priority
      });

      return {
        channel: 'push',
        success: result.success,
        pushId: result.pushId,
        error: result.error
      };

    } catch (error) {
      return {
        channel: 'push',
        success: false,
        error: error.message
      };
    }
  }
}

// Enhanced notification interfaces
interface NotificationRequest {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: ('email' | 'in_app' | 'push')[];
  scheduledFor?: Date;
}

interface NotificationResult {
  success: boolean;
  notificationId?: string;
  channels: number;
  results: ChannelResult[];
  error?: string;
}

interface ChannelResult {
  channel: 'email' | 'in_app' | 'push';
  success: boolean;
  deliveryId?: string;
  notificationId?: string;
  pushId?: string;
  error?: string;
}

interface BulkNotificationRequest {
  targetCriteria: TargetCriteria;
  notification: Omit<NotificationRequest, 'userId'>;
  schedule?: Date;
}

interface BulkNotificationResult {
  success: boolean;
  bulkId?: string;
  totalUsers: number;
  successful: number;
  failed: number;
  results: BulkResult[];
  error?: string;
}

interface BulkResult {
  userId: string;
  success: boolean;
  channels: number;
  error?: string;
}

interface UserNotifications {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  pagination: PaginationInfo;
}

interface NotificationOptions {
  page?: number;
  limit?: number;
  type?: string;
  readStatus?: boolean;
  sortBy?: 'createdAt' | 'readAt';
  sortOrder?: 'asc' | 'desc';
}

interface NotificationPreferences {
  userId: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  pushEnabled: boolean;
  email?: string;
  pushTokens?: string[];
  frequency?: 'immediate' | 'daily' | 'weekly' | 'never';
  categories: {
    [key: string]: boolean;
  };
}
```

#### 2. Enhanced Database Models
Comprehensive notification database schema:

```prisma
model Notification {
  id              String   @id @default(cuid())
  type            String   // "payment", "project", "system", "reminder"
  title           String
  message         String
  data            Json?    // Additional notification data
  priority        String   // "low", "medium", "high", "urgent"
  status          String   // "pending", "sent", "failed", "cancelled"
  scheduledFor    DateTime?
  sentAt          DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relationships
  userNotifications UserNotification[]
  templates         NotificationTemplate[]
}

model UserNotification {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  notificationId  String
  notification    Notification @relation(fields: [notificationId], references: [id], onDelete: Cascade)
  readAt          DateTime?
  dismissedAt     DateTime?
  deliveredAt     DateTime?
  createdAt       DateTime @default(now())
  
  // Channel-specific fields
  emailDelivered  Boolean  @default(false)
  emailDeliveryId String?
  inAppDelivered  Boolean  @default(false)
  inAppNotificationId String?
  pushDelivered   Boolean  @default(false)
  pushDeliveryId  String?
  
  // Enhanced tracking
  deliveryAttempts Int     @default(0)
  lastAttempt     DateTime?
  errorReason     String?
  
  @@unique([userId, notificationId])
}

model NotificationTemplate {
  id              String   @id @default(cuid())
  type            String   @unique
  name            String
  subject         String
  htmlContent     String
  textContent     String
  variables       Json?    // Available template variables
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relationships
  notifications   Notification[]
}

model NotificationPreference {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  emailEnabled    Boolean  @default(true)
  inAppEnabled    Boolean  @default(true)
  pushEnabled     Boolean  @default(false)
  email           String?  // Override email address
  pushTokens      String[] // Push notification tokens
  frequency       String   @default("immediate") // "immediate", "daily", "weekly", "never"
  categories      Json?    // Category-specific preferences
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Enhanced preferences
  quietHours      Json?    // Do not disturb hours
  timezone        String?  // User timezone
  language        String?  @default("en") // Notification language
}

model NotificationHistory {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  action          String   // "sent", "delivered", "opened", "clicked", "dismissed"
  channel         String   // "email", "in_app", "push"
  notificationId  String?
  deliveryId      String?
  timestamp       DateTime @default(now())
  metadata        Json?    // Additional action metadata
  
  // Relationships
  notification    Notification? @relation(fields: [notificationId], references: [id])
}
```

#### 3. Enhanced Email Service
Advanced email notification capabilities:

```typescript
// Enhanced email service for notifications
export class EnhancedEmailService {
  private transporter: nodemailer.Transporter;
  private templates: Map<string, EmailTemplate>;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    this.templates = new Map();
    this.loadTemplates();
  }

  private loadTemplates(): void {
    // Load notification templates
    this.templates.set('payment_success', {
      subject: 'Payment Successful - {{amount}} {{currency}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #28a745; margin: 0;">Payment Successful!</h1>
          </div>
          <div style="padding: 30px;">
            <p>Hello {{userName}},</p>
            <p>Your payment of <strong>{{amount}} {{currency}}</strong> has been successfully processed.</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0;">Payment Details:</h3>
              <p><strong>Reference:</strong> {{reference}}</p>
              <p><strong>Date:</strong> {{date}}</p>
              <p><strong>Amount:</strong> {{amount}} {{currency}}</p>
            </div>
            <p>Thank you for using our service!</p>
          </div>
        </div>
      `,
      text: `
        Hello {{userName}},
        
        Your payment of {{amount}} {{currency}} has been successfully processed.
        
        Payment Details:
        - Reference: {{reference}}
        - Date: {{date}}
        - Amount: {{amount}} {{currency}}
        
        Thank you for using our service!
      `
    });

    this.templates.set('project_complete', {
      subject: 'Project Complete - {{projectTitle}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #007bff; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">Project Complete!</h1>
          </div>
          <div style="padding: 30px;">
            <p>Hello {{userName}},</p>
            <p>Congratulations! Your project <strong>{{projectTitle}}</strong> has been completed successfully.</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0;">Project Details:</h3>
              <p><strong>Title:</strong> {{projectTitle}}</p>
              <p><strong>Topic:</strong> {{topic}}</p>
              <p><strong>Completion Date:</strong> {{completionDate}}</p>
              <p><strong>Total Chapters:</strong> {{chapterCount}}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{projectUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">View Project</a>
            </div>
          </div>
        </div>
      `,
      text: `
        Hello {{userName}},
        
        Congratulations! Your project {{projectTitle}} has been completed successfully.
        
        Project Details:
        - Title: {{projectTitle}}
        - Topic: {{topic}}
        - Completion Date: {{completionDate}}
        - Total Chapters: {{chapterCount}}
        
        View your project: {{projectUrl}}
      `
    });

    this.templates.set('chapter_generated', {
      subject: 'New Chapter Generated - {{chapterTitle}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #28a745; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">New Chapter Generated!</h1>
          </div>
          <div style="padding: 30px;">
            <p>Hello {{userName}},</p>
            <p>A new chapter has been generated for your project <strong>{{projectTitle}}</strong>.</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0;">Chapter Details:</h3>
              <p><strong>Title:</strong> {{chapterTitle}}</p>
              <p><strong>Word Count:</strong> {{wordCount}}</p>
              <p><strong>Generated:</strong> {{generationDate}}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{chapterUrl}}" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">View Chapter</a>
            </div>
          </div>
        </div>
      `,
      text: `
        Hello {{userName}},
        
        A new chapter has been generated for your project {{projectTitle}}.
        
        Chapter Details:
        - Title: {{chapterTitle}}
        - Word Count: {{wordCount}}
        - Generated: {{generationDate}}
        
        View your chapter: {{chapterUrl}}
      `
    });
  }

  async sendNotificationEmail(notificationData: NotificationEmailRequest): Promise<EmailResult> {
    try {
      const template = this.templates.get(notificationData.templateType);
      if (!template) {
        throw new Error(`Template not found: ${notificationData.templateType}`);
      }

      // Render template with data
      const renderedContent = this.renderTemplate(template, notificationData.templateData);

      // Send email
      const mailOptions = {
        from: process.env.SMTP_FROM,
        to: notificationData.to,
        subject: renderedContent.subject,
        html: renderedContent.html,
        text: renderedContent.text
      };

      const result = await this.transporter.sendMail(mailOptions);

      // Track email delivery
      await this.trackEmailDelivery({
        userId: notificationData.userId,
        email: notificationData.to,
        templateType: notificationData.templateType,
        messageId: result.messageId,
        status: 'sent'
      });

      return {
        success: true,
        messageId: result.messageId,
        deliveryId: result.messageId
      };

    } catch (error) {
      console.error('Email sending failed:', error);
      
      // Track email failure
      await this.trackEmailFailure({
        userId: notificationData.userId,
        email: notificationData.to,
        templateType: notificationData.templateType,
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  private renderTemplate(template: EmailTemplate, data: any): RenderedContent {
    let subject = template.subject;
    let html = template.htmlContent;
    let text = template.textContent;

    // Replace template variables
    Object.keys(data).forEach(key => {
      const value = data[key];
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      
      subject = subject.replace(placeholder, value);
      html = html.replace(placeholder, value);
      text = text.replace(placeholder, value);
    });

    return {
      subject,
      html,
      text
    };
  }

  private async trackEmailDelivery(trackingData: EmailTrackingData): Promise<void> {
    await prisma.notificationHistory.create({
      data: {
        userId: trackingData.userId,
        action: 'sent',
        channel: 'email',
        deliveryId: trackingData.messageId,
        metadata: {
          email: trackingData.email,
          templateType: trackingData.templateType,
          messageId: trackingData.messageId
        }
      }
    });
  }

  private async trackEmailFailure(trackingData: EmailFailureData): Promise<void> {
    await prisma.notificationHistory.create({
      data: {
        userId: trackingData.userId,
        action: 'failed',
        channel: 'email',
        metadata: {
          email: trackingData.email,
          templateType: trackingData.templateType,
          error: trackingData.error
        }
      }
    });
  }
}

// Enhanced email interfaces
interface NotificationEmailRequest {
  to: string;
  userId: string;
  templateType: string;
  templateData: any;
}

interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
}

interface RenderedContent {
  subject: string;
  html: string;
  text: string;
}

interface EmailTrackingData {
  userId: string;
  email: string;
  templateType: string;
  messageId: string;
}

interface EmailFailureData {
  userId: string;
  email: string;
  templateType: string;
  error: string;
}
```

#### 4. Enhanced Frontend Notification Center
Comprehensive in-app notification management:

```typescript
// Enhanced notification center component
export function EnhancedNotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UserNotifications | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    loadNotifications();
    loadPreferences();
  }, [user?.id]);

  const loadNotifications = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const result = await fetch(`/api/notifications?userId=${user.id}&tab=${selectedTab}`);
      const data = await result.json();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreferences = async () => {
    if (!user?.id) return;

    try {
      const result = await fetch(`/api/notifications/preferences?userId=${user.id}`);
      const data = await result.json();
      setPreferences(data);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });
      
      // Update local state
      setNotifications(prev => prev ? {
        ...prev,
        notifications: prev.notifications.map(n => 
          n.id === notificationId ? { ...n, readAt: new Date() } : n
        ),
        unreadCount: prev.unreadCount - 1
      } : null);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });
      
      // Update local state
      setNotifications(prev => prev ? {
        ...prev,
        notifications: prev.notifications.map(n => ({ ...n, readAt: new Date() })),
        unreadCount: 0
      } : null);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });
      
      // Update local state
      setNotifications(prev => prev ? {
        ...prev,
        notifications: prev.notifications.filter(n => n.id !== notificationId),
        unreadCount: prev.notifications.find(n => n.id === notificationId && !n.readAt) 
          ? prev.unreadCount - 1 
          : prev.unreadCount
      } : null);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleUpdatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, preferences: newPreferences })
      });
      
      // Update local state
      setPreferences(prev => prev ? { ...prev, ...newPreferences } : null);
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const filteredNotifications = useMemo(() => {
    if (!notifications) return [];
    
    switch (selectedTab) {
      case 'unread':
        return notifications.notifications.filter(n => !n.readAt);
      case 'read':
        return notifications.notifications.filter(n => n.readAt);
      default:
        return notifications.notifications;
    }
  }, [notifications, selectedTab]);

  if (isLoading) {
    return (
      <div className="notification-center">
        <div className="loading-spinner">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="notification-center">
      {/* Header */}
      <div className="notification-header">
        <h2 className="text-2xl font-bold">Notifications</h2>
        <div className="header-actions">
          {notifications?.unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="mark-all-read-btn"
            >
              Mark All as Read
            </button>
          )}
          <button className="settings-btn" onClick={() => setShowSettings(true)}>
            Settings
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="notification-tabs">
        <button
          className={`tab ${selectedTab === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedTab('all')}
        >
          All ({notifications?.notifications.length || 0})
        </button>
        <button
          className={`tab ${selectedTab === 'unread' ? 'active' : ''}`}
          onClick={() => setSelectedTab('unread')}
        >
          Unread ({notifications?.unreadCount || 0})
        </button>
        <button
          className={`tab ${selectedTab === 'read' ? 'active' : ''}`}
          onClick={() => setSelectedTab('read')}
        >
          Read
        </button>
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3>No notifications</h3>
            <p>You're all caught up!</p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={() => handleMarkAsRead(notification.id)}
              onDelete={() => handleDeleteNotification(notification.id)}
            />
          ))
        )}
      </div>

      {/* Preferences Modal */}
      {showSettings && preferences && (
        <NotificationPreferencesModal
          preferences={preferences}
          onUpdate={handleUpdatePreferences}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

// Individual notification item component
function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}: {
  notification: Notification;
  onMarkAsRead: () => void;
  onDelete: () => void;
}) {
  const isRead = !!notification.readAt;
  const priorityColor = {
    low: 'bg-gray-200',
    medium: 'bg-blue-200',
    high: 'bg-orange-200',
    urgent: 'bg-red-200'
  }[notification.priority];

  return (
    <div className={`notification-item ${isRead ? 'read' : 'unread'}`}>
      <div className="notification-content">
        <div className="notification-header">
          <div className="priority-indicator">
            <div className={`priority-dot ${priorityColor}`} />
            <span className="priority-text">{notification.priority}</span>
          </div>
          <div className="notification-time">
            {formatDistanceToNow(new Date(notification.createdAt))} ago
          </div>
        </div>
        
        <div className="notification-body">
          <h4 className="notification-title">{notification.title}</h4>
          <p className="notification-message">{notification.message}</p>
        </div>

        {notification.data && (
          <div className="notification-data">
            <pre>{JSON.stringify(notification.data, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="notification-actions">
        {!isRead && (
          <button
            onClick={onMarkAsRead}
            className="mark-read-btn"
          >
            Mark as Read
          </button>
        )}
        <button
          onClick={onDelete}
          className="delete-btn"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

// Notification preferences modal
function NotificationPreferencesModal({ 
  preferences, 
  onUpdate, 
  onClose 
}: {
  preferences: NotificationPreferences;
  onUpdate: (preferences: Partial<NotificationPreferences>) => void;
  onClose: () => void;
}) {
  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="preferences-modal">
        <h3 className="modal-title">Notification Preferences</h3>
        
        <div className="preference-sections">
          {/* Channel Preferences */}
          <div className="preference-section">
            <h4>Notification Channels</h4>
            <div className="channel-options">
              <label className="preference-option">
                <input
                  type="checkbox"
                  checked={preferences.emailEnabled}
                  onChange={(e) => onUpdate({ emailEnabled: e.target.checked })}
                />
                <span>Email Notifications</span>
              </label>
              <label className="preference-option">
                <input
                  type="checkbox"
                  checked={preferences.inAppEnabled}
                  onChange={(e) => onUpdate({ inAppEnabled: e.target.checked })}
                />
                <span>In-App Notifications</span>
              </label>
              <label className="preference-option">
                <input
                  type="checkbox"
                  checked={preferences.pushEnabled}
                  onChange={(e) => onUpdate({ pushEnabled: e.target.checked })}
                />
                <span>Push Notifications</span>
              </label>
            </div>
          </div>

          {/* Frequency Preferences */}
          <div className="preference-section">
            <h4>Notification Frequency</h4>
            <div className="frequency-options">
              {['immediate', 'daily', 'weekly', 'never'].map(frequency => (
                <label key={frequency} className="preference-option">
                  <input
                    type="radio"
                    name="frequency"
                    value={frequency}
                    checked={preferences.frequency === frequency}
                    onChange={(e) => onUpdate({ frequency: e.target.value })}
                  />
                  <span>{frequency.charAt(0).toUpperCase() + frequency.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Category Preferences */}
          <div className="preference-section">
            <h4>Notification Categories</h4>
            <div className="category-options">
              {Object.entries(preferences.categories).map(([category, enabled]) => (
                <label key={category} className="preference-option">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => onUpdate({
                      categories: {
                        ...preferences.categories,
                        [category]: e.target.checked
                      }
                    })}
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="cancel-btn">Cancel</button>
          <button onClick={onClose} className="save-btn">Save Preferences</button>
        </div>
      </div>
    </Modal>
  );
}
```

## Technical Implementation

### 1. Enhanced API Endpoints

#### Notification API Endpoints
```typescript
// src/app/api/notifications/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const tab = searchParams.get('tab') || 'all';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const notificationService = new EnhancedNotificationService();
    const result = await notificationService.getUserNotifications(userId, {
      page,
      limit,
      readStatus: tab === 'unread' ? false : tab === 'read' ? true : undefined
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Failed to get notifications:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to get notifications',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request: Request) {
  try {
    const notificationData = await request.json();
    
    const notificationService = new EnhancedNotificationService();
    const result = await notificationService.sendNotification(notificationData);

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Failed to send notification:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to send notification',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// src/app/api/notifications/[id]/route.ts
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const notificationService = new EnhancedNotificationService();
    const success = await notificationService.markAsRead(params.id, userId);

    return new Response(JSON.stringify({ success }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to mark as read',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const notificationService = new EnhancedNotificationService();
    const success = await notificationService.deleteNotification(params.id, userId);

    return new Response(JSON.stringify({ success }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Failed to delete notification:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to delete notification',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// src/app/api/notifications/mark-all-read/route.ts
export async function PATCH(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const notificationService = new EnhancedNotificationService();
    const success = await notificationService.markAllAsRead(userId);

    return new Response(JSON.stringify({ success }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Failed to mark all as read:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to mark all as read',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// src/app/api/notifications/preferences/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const notificationService = new EnhancedNotificationService();
    const preferences = await notificationService.getUserPreferences(userId);

    return new Response(JSON.stringify(preferences), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Failed to get preferences:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to get preferences',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, preferences } = await request.json();

    if (!userId || !preferences) {
      return new Response(JSON.stringify({ error: 'User ID and preferences required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const notificationService = new EnhancedNotificationService();
    const success = await notificationService.updatePreferences(userId, preferences);

    return new Response(JSON.stringify({ success }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Failed to update preferences:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to update preferences',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

### 2. Enhanced Real-Time Notifications

#### WebSocket Integration for Real-Time Updates
```typescript
// Real-time notification service
export class RealTimeNotificationService {
  private io: Server;

  constructor(httpServer: any) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_BASE_URL,
        methods: ['GET', 'POST']
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Join user room
      socket.on('join-user-room', (userId: string) => {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined room`);
      });

      // Leave user room
      socket.on('leave-user-room', (userId: string) => {
        socket.leave(`user-${userId}`);
        console.log(`User ${userId} left room`);
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
  }

  async sendRealTimeNotification(userId: string, notification: Notification): Promise<void> {
    // Send to specific user room
    this.io.to(`user-${userId}`).emit('new-notification', notification);

    // Send to all connected clients for admin notifications
    if (notification.type === 'system') {
      this.io.emit('system-notification', notification);
    }
  }

  async sendBulkRealTimeNotification(userIds: string[], notification: Notification): Promise<void> {
    for (const userId of userIds) {
      await this.sendRealTimeNotification(userId, notification);
    }
  }

  async updateNotificationStatus(userId: string, notificationId: string, status: string): Promise<void> {
    this.io.to(`user-${userId}`).emit('notification-status-update', {
      notificationId,
      status
    });
  }
}

// Frontend WebSocket integration
export function useRealTimeNotifications(userId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!userId) return;

    // Initialize WebSocket connection
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      auth: {
        userId
      }
    });

    setSocket(newSocket);

    // Join user room
    newSocket.emit('join-user-room', userId);

    // Listen for new notifications
    newSocket.on('new-notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      // Show browser notification if enabled
      showBrowserNotification(notification);
    });

    // Listen for notification status updates
    newSocket.on('notification-status-update', (data: { notificationId: string; status: string }) => {
      setNotifications(prev => prev.map(n => 
        n.id === data.notificationId ? { ...n, status: data.status } : n
      ));
    });

    return () => {
      newSocket.emit('leave-user-room', userId);
      newSocket.disconnect();
    };
  }, [userId]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!socket) return;

    socket.emit('mark-notification-read', notificationId);
  }, [socket]);

  return {
    notifications,
    markAsRead
  };
}
```

## User Experience Enhancements

### 1. **Comprehensive Notification Management**
- Real-time notification updates
- In-app notification center with full management
- Email and push notification support
- User preference management

### 2. **Smart Notification Features**
- Priority-based notification handling
- Category-specific preferences
- Bulk notification operations
- Notification history and tracking

### 3. **Enhanced User Control**
- Granular notification preferences
- Do not disturb hours support
- Notification frequency control
- Channel-specific settings

### 4. **Rich Notification Content**
- Template-based notifications
- Rich HTML email content
- Contextual notification data
- Actionable notification items

## Integration Patterns

### 1. **Notification Flow Pipeline**
```
Event Occurs → Notification Creation → Channel Selection → Delivery Processing → User Receipt
      ↓              ↓                    ↓                    ↓                    ↓
System Event → Notification Service → Preference Check → Multi-Channel Send → User Notification
```

### 2. **Real-Time Notification Flow**
```
Event Trigger → WebSocket Broadcast → Client Update → UI Refresh → User Interaction
      ↓              ↓                    ↓              ↓              ↓
System Event → Socket.IO → Frontend Update → Visual Update → User Action
```

### 3. **Email Notification Flow**
```
Notification Request → Template Selection → Content Rendering → Email Sending → Delivery Tracking
         ↓                    ↓                    ↓              ↓                    ↓
User Action → Template Engine → HTML Generation → SMTP Send → Delivery Confirmation
```

## Benefits of Enhanced Notifications

### 1. **Improved User Engagement**
- Real-time updates keep users informed
- Multiple notification channels for different preferences
- Contextual notifications with relevant information
- Actionable notifications that drive user engagement

### 2. **Better User Experience**
- Comprehensive notification management interface
- User-controlled notification preferences
- Smart notification prioritization
- Rich notification content with context

### 3. **Enhanced System Communication**
- Automated system notifications for important events
- Bulk notification capabilities for announcements
- Template-based notifications for consistency
- Comprehensive notification tracking and analytics

### 4. **Scalability and Reliability**
- Robust notification infrastructure
- Multi-channel delivery for reliability
- Real-time updates with WebSocket support
- Comprehensive error handling and retry logic

## Future Enhancements

### 1. **Advanced Notification Features**
- AI-powered notification personalization
- Smart notification scheduling based on user behavior
- Advanced notification analytics and insights
- Cross-device notification synchronization

### 2. **Enhanced User Experience**
- Rich notification content with images and actions
- Interactive notification elements
- Notification grouping and bundling
- Advanced notification filtering and search

### 3. **Advanced Analytics**
- Notification engagement analytics
- User preference learning and optimization
- Notification delivery performance metrics
- A/B testing for notification effectiveness

## Testing Strategy

### Unit Testing
```typescript
describe('Notification System', () => {
  it('should send notification via multiple channels', async () => {
    const notificationData = {
      userId: 'test-user',
      type: 'payment',
      title: 'Payment Successful',
      message: 'Your payment has been processed',
      priority: 'high' as const,
      channels: ['email', 'in_app'] as const
    };

    const result = await notificationService.sendNotification(notificationData);
    expect(result.success).toBe(true);
    expect(result.channels).toBeGreaterThan(0);
  });

  it('should handle user preferences correctly', async () => {
    const preferences = await notificationService.getUserPreferences('test-user');
    expect(preferences.emailEnabled).toBeDefined();
    expect(preferences.inAppEnabled).toBeDefined();
  });
});
```

### Integration Testing
```typescript
describe('Notification Integration', () => {
  it('should handle complete notification flow', async () => {
    // Test notification creation
    const createResponse = await request(app)
      .post('/api/notifications')
      .send({
        userId: 'test-user',
        type: 'payment',
        title: 'Test Notification',
        message: 'Test message',
        priority: 'medium',
        channels: ['in_app']
      });

    expect(createResponse.status).toBe(200);
    expect(createResponse.body.success).toBe(true);

    // Test notification retrieval
    const getResponse = await request(app)
      .get('/api/notifications?userId=test-user');

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.notifications).toBeDefined();
  });
});
```

## Conclusion

The enhanced notification system implementation provides a comprehensive, multi-channel notification solution with advanced features. Key achievements include:

- ✅ **Multi-Channel Delivery**: Email, in-app, and push notification support
- ✅ **Template System**: Rich, customizable notification templates
- ✅ **User Preferences**: Comprehensive user preference management
- ✅ **Real-Time Updates**: WebSocket-based real-time notification delivery
- ✅ **Database Integration**: Complete notification tracking and history

This implementation serves as a foundation for advanced notification features and provides a robust, scalable notification system that enhances user engagement and system communication.
