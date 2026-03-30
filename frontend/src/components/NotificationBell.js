import { useState, useEffect, useRef } from "react";
import { getNotifications, getUnreadCount, markNotificationsRead } from "../utils/api";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    loadUnread();
    const interval = setInterval(loadUnread, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const loadUnread = async () => {
    try {
      const res = await getUnreadCount();
      setUnread(res.data.count || 0);
    } catch (err) {
      console.log("Notification fetch skipped");
    }
  };

  const handleOpen = async () => {
    if (!open) {
      try {
        const res = await getNotifications();
        setNotifications(res.data);
        if (unread > 0) {
          await markNotificationsRead();
          setUnread(0);
        }
      } catch (err) {
        console.log("Notification fetch skipped");
      }
    }
    setOpen(!open);
  };

  const typeIcon = (type) => {
    switch (type) {
      case "appointment": return "📅";
      case "billing": return "💳";
      case "prescription": return "💊";
      case "approval": return "✅";
      default: return "🔔";
    }
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button className="notif-btn" onClick={handleOpen} title="Notifications">
        🔔
        {unread > 0 && <span className="notif-badge">{unread > 9 ? "9+" : unread}</span>}
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: 40,
          right: 0,
          width: 320,
          maxHeight: 420,
          overflowY: "auto",
          background: "white",
          borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
          zIndex: 1100,
          border: "1px solid #e8e8e8"
        }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #eee", fontWeight: 700, fontSize: 15, color: "var(--nhs-dark-blue)" }}>
            Notifications
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "#888", fontSize: 14 }}>
              No notifications yet
            </div>
          ) : (
            notifications.slice(0, 20).map((n) => (
              <div key={n._id} style={{
                padding: "12px 16px",
                borderBottom: "1px solid #f0f0f0",
                background: n.read ? "white" : "#f0f7ff",
                cursor: "default"
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{typeIcon(n.type)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--nhs-dark-blue)" }}>{n.title}</div>
                    <div style={{ fontSize: 13, color: "#555", marginTop: 2 }}>{n.message}</div>
                    <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
