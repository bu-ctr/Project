# 🔔 Notification System Documentation

## Overview

The notification system provides real-time notifications to users about scholarships, deadlines, applications, and profile updates. It features a bell icon in the navbar with a dropdown and a dedicated notifications page.

---

## ✨ Features

### 1. **Navbar Bell Icon** 🔔
- **Location**: Top-right of navbar (for authenticated users)
- **Unread Badge**: Red badge showing unread count (e.g., "3")
- **Dropdown**: Click to see recent 5 notifications
- **Auto-polling**: Checks for new notifications every 30 seconds

### 2. **Notifications Page** (`/notifications`)
- Full notification history
- **Filters**: All, Unread, Read
- **Actions**: 
  - Mark individual notification as read
  - Mark all as read
  - Delete notification
- Beautiful, modern UI with color-coded notification types

### 3. **Notification Types**
- **Deadline Reminder** ⏰ - Scholarship deadlines approaching
- **New Scholarship** 🎓 - New scholarship matches user profile
- **Application Update** 📝 - Application status changes
- **Profile Incomplete** ⚠️ - Reminder to complete profile

---

## 🎯 User Experience

### How It Works:

1. **User logs in** → Bell icon appears in navbar
2. **New notification arrives** → Red badge shows count
3. **User clicks bell** → Dropdown shows recent notifications
4. **Click notification** → Marks as read, navigates to relevant page
5. **Click "View all"** → Goes to `/notifications` page

---

## 🔌 Backend API

### Routes

All routes require authentication (Bearer token in Authorization header)

#### **GET** `/api/notifications`
Fetch all notifications for the authenticated user

**Response:**
```json
{
  "notifications": [
    {
      "id": 1,
      "user_id": 5,
      "type": "deadline_reminder",
      "payload": {
        "title": "Scholarship Deadline Approaching",
        "message": "The Merit scholarship deadline is in 7 days!",
        "daysLeft": 7,
        "actionUrl": "/scholarships/3"
      },
      "scholarship_id": 3,
      "scholarship_title": "Merit-Based Scholarship",
      "read": false,
      "created_at": "2026-01-29T10:00:00Z"
    }
  ]
}
```

#### **GET** `/api/notifications/unread-count`
Get count of unread notifications

**Response:**
```json
{
  "count": 3
}
```

#### **PATCH** `/api/notifications/:id/read`
Mark a notification as read

**Response:**
```json
{
  "ok": true
}
```

#### **PATCH** `/api/notifications/mark-all-read`
Mark all notifications as read

**Response:**
```json
{
  "ok": true
}
```

#### **DELETE** `/api/notifications/:id`
Delete a notification

**Response:**
```json
{
  "ok": true
}
```

---

## 💻 Frontend Components

### `NotificationBell.jsx`
- Bell icon button with unread badge
- Dropdown menu showing recent notifications
- Handles click outside to close
- Auto-polls every 30 seconds

**Props:** None (uses auth context)

### `NotificationsPage.jsx`
- Full-page notification manager
- Filter tabs (All, Unread, Read)
- Mark as read/delete actions
- Responsive design

---

## 🛠️ Usage

### Creating Notifications Programmatically

```javascript
const { createDeadlineReminder } = require('./utils/notificationHelper');

// Create deadline reminder
await createDeadlineReminder(
  userId,           // User ID
  scholarship,      // Scholarship object { id, title, deadline }
  7                 // Days left
);
```

### Available Helper Functions:

```javascript
const {
  createNotification,          // Generic notification creator
  createDeadlineReminder,      // Deadline approaching
  createScholarshipMatch,      // New scholarship match
  createApplicationUpdate,     // Application status change
  createProfileReminder        // Profile incomplete
} = require('./utils/notificationHelper');
```

---

## 🧪 Testing

### 1. **Create Sample Notifications**

Run the test script to create sample notifications:

```bash
cd backend
node src/scripts/createSampleNotifications.js
```

This will:
- Create 6 sample notifications
- Mix of read/unread states
- Different notification types
- Link to existing scholarships

### 2. **Test the UI**

1. **Start backend and frontend:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **Login to your account**

3. **Check the navbar:**
   - You should see the 🔔 bell icon
   - Red badge should show unread count
   - Click to see dropdown

4. **Test dropdown:**
   - Click a notification → should mark as read
   - Click "Mark all as read" → badge should disappear
   - Click "View all notifications" → goes to page

5. **Test notifications page (`/notifications`):**
   - Filter by All/Unread/Read
   - Click notification → navigates to action URL
   - Click "Mark as read" button
   - Click X to delete notification

---

## 🎨 Customization

### Change Polling Interval

In `NotificationBell.jsx`, change line 113:

```javascript
const interval = setInterval(() => {
  fetchUnreadCount();
}, 30000); // Change 30000 (30 seconds) to your desired interval
```

### Add New Notification Types

1. **Add to backend helper** (`backend/src/utils/notificationHelper.js`):
   ```javascript
   async function createCustomNotification(userId, data) {
     const payload = {
       title: 'Custom Title',
       message: 'Custom message',
       actionUrl: '/custom-page'
     };
     return createNotification(userId, 'custom_type', payload);
   }
   ```

2. **Add icon/color in frontend** (`NotificationBell.jsx` & `NotificationsPage.jsx`):
   ```javascript
   case 'custom_type':
     return { 
       icon: '🎉', 
       color: 'text-purple-600', 
       bg: 'bg-purple-50',
       border: 'border-purple-200' 
     };
   ```

---

## 📊 Database Schema

Notifications are stored in the `notifications` table:

```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    scholarship_id INT,
    type VARCHAR(50),
    payload JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 Future Enhancements

Optional improvements you can add:

1. **Real-time WebSocket updates** - Replace polling with WebSocket for instant notifications
2. **Push notifications** - Browser push notifications when user is away
3. **Email notifications** - Send email digests
4. **Notification preferences** - Let users choose which notifications to receive
5. **Scheduled notifications** - Cron job to send deadline reminders automatically
6. **Notification sounds** - Audio alert for new notifications

---

## 🐛 Troubleshooting

### Bell icon not showing
- Check if user is logged in
- Verify NotificationBell is imported in Navbar

### No notifications appearing
- Run sample script: `node backend/src/scripts/createSampleNotifications.js`
- Check backend console for errors
- Verify notifications table exists

### Unread count not updating
- Check browser console for API errors
- Verify `/api/notifications/unread-count` endpoint works
- Check polling is running (console.log in useEffect)

### "date-fns" error
- Run: `npm install date-fns` in frontend directory

---

## 📝 Summary

You now have a complete notification system with:

✅ Backend API routes for CRUD operations  
✅ NotificationBell component with dropdown  
✅ Dedicated notifications page  
✅ Auto-polling for real-time updates  
✅ Helper functions to create notifications  
✅ Test script for sample data  
✅ Beautiful, modern UI  

The system is **production-ready** and can be extended with triggers for automatic notifications based on your business logic!
