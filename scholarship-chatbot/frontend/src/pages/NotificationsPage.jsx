import { useState, useEffect } from "react";
import api from "../services/api";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all, unread, read

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await api.get("/notifications");
            setNotifications(res.data.notifications || []);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await api.patch(`/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch("/notifications/mark-all-read");
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await api.delete(`/notifications/${notificationId}`);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }

        const payload = typeof notification.payload === 'string'
            ? JSON.parse(notification.payload)
            : notification.payload;

        if (payload?.actionUrl) {
            window.location.href = payload.actionUrl;
        }
    };

    const getNotificationStyle = (type) => {
        switch (type) {
            case 'deadline_reminder':
                return { icon: '⏰', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
            case 'new_scholarship':
                return { icon: '🎓', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' };
            case 'application_update':
                return { icon: '📝', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
            case 'profile_incomplete':
                return { icon: '⚠️', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
            default:
                return { icon: '🔔', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === "unread") return !n.read;
        if (filter === "read") return n.read;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-2">
                        Notifications
                    </h1>
                    <p className="text-gray-600">
                        {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>

                {/* Actions and Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        {/* Filter Tabs */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter("all")}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === "all"
                                        ? "bg-indigo-600 text-white shadow-md"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                All ({notifications.length})
                            </button>
                            <button
                                onClick={() => setFilter("unread")}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === "unread"
                                        ? "bg-indigo-600 text-white shadow-md"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                Unread ({unreadCount})
                            </button>
                            <button
                                onClick={() => setFilter("read")}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === "read"
                                        ? "bg-indigo-600 text-white shadow-md"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                Read ({notifications.length - unreadCount})
                            </button>
                        </div>

                        {/* Mark All Read Button */}
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 font-medium hover:bg-indigo-100 transition-all"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>
                </div>

                {/* Notifications List */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <svg
                            className="w-20 h-20 mx-auto mb-4 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                        </svg>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            {filter === "all" ? "No notifications yet" : `No ${filter} notifications`}
                        </h3>
                        <p className="text-gray-600">
                            {filter === "all"
                                ? "We'll notify you when something arrives"
                                : `You don't have any ${filter} notifications`}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map((notification) => {
                            const payload = typeof notification.payload === 'string'
                                ? JSON.parse(notification.payload)
                                : notification.payload;

                            const style = getNotificationStyle(notification.type);

                            return (
                                <div
                                    key={notification.id}
                                    className={`bg-white rounded-xl border ${style.border} shadow-sm hover:shadow-md transition-all ${!notification.read ? 'ring-2 ring-indigo-100' : ''
                                        }`}
                                >
                                    <div
                                        onClick={() => handleNotificationClick(notification)}
                                        className="p-6 cursor-pointer"
                                    >
                                        <div className="flex gap-4">
                                            {/* Icon */}
                                            <div className={`flex-shrink-0 w-12 h-12 rounded-full ${style.bg} flex items-center justify-center text-2xl`}>
                                                {style.icon}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4 mb-2">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className={`text-lg font-bold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                                {payload.title}
                                                            </h3>
                                                            {!notification.read && (
                                                                <span className="flex-shrink-0 w-2.5 h-2.5 bg-indigo-600 rounded-full"></span>
                                                            )}
                                                        </div>
                                                        <p className="text-gray-600">
                                                            {payload.message}
                                                        </p>
                                                    </div>

                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm("Delete this notification?")) {
                                                                deleteNotification(notification.id);
                                                            }
                                                        }}
                                                        className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                        aria-label="Delete notification"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-gray-400">
                                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                    </p>

                                                    {!notification.read && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                markAsRead(notification.id);
                                                            }}
                                                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                                        >
                                                            Mark as read
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
