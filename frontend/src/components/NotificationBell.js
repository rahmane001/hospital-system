import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { getNotifications, getUnreadCount, markNotificationsRead } from "../utils/api";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const dropdownRef = useRef();

  useEffect(() => {
    loadUnread();
    const interval = setInterval(loadUnread, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      const inBell = ref.current && ref.current.contains(e.target);
      const inDropdown = dropdownRef.current && dropdownRef.current.contains(e.target);
      if (!inBell && !inDropdown) setOpen(false);
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

      {open && createPortal(
        <div ref={dropdownRef} style={{
          position: "fixed",
          top: 70,
          left: "calc(var(--sidebar-width, 260px) + 12px)",
          width: 340,
          maxHeight: 460,
          overflowY: "auto",
          background: "rgba(14,25,50,0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRadius: 14,
          boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
          zIndex: 1100,
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#e6ecff"
        }}>
          <div style={{
            padding: "14px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            fontWeight: 700,
            fontSize: 15,
            color: "#fff",
            letterSpacing: 0.3
          }}>
            Notifications
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "rgba(230,236,255,0.55)", fontSize: 14 }}>
              No notifications yet
            </div>
          ) : (
            notifications.slice(0, 20).map((n) => (
              <div key={n._id} style={{
                padding: "12px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: n.read ? "transparent" : "rgba(59,130,246,0.12)",
                cursor: "default"
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{typeIcon(n.type)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#60a5fa" }}>{n.title}</div>
                    <div style={{ fontSize: 13, color: "rgba(230,236,255,0.85)", marginTop: 2, overflowWrap: "anywhere" }}>{n.message}</div>
                    <div style={{ fontSize: 11, color: "rgba(230,236,255,0.45)", marginTop: 4 }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export default NotificationBell;
