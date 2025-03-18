import React from "react";
import { useOthers, useSelf } from "@liveblocks/react";
import { useUser } from "@clerk/nextjs";
import styles from "./AvatarStack.module.css";

export default function AvatarStack() {
  const { user } = useUser();
  const others = useOthers();
  const currentUser = useSelf();
  const hasMoreUsers = others.length > 3;

  console.log("User:", user);
  console.log("Others:", others);
  console.log("CurrentUser:", currentUser);

  const getRandomGradient = () => {
    const gradients = [
      'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
      'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
      'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
      'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
      'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      'linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'linear-gradient(135deg, #f43b47 0%, #453a94 100%)',
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  const getInitials = (name) => {
    const fallbackName = name || "Unknown";
    return fallbackName.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  return (
    <div className={styles.avatarStack}>
      {/* Render others if they exist */}
      {others.slice(0, 3).map(({ connectionId, presence }) => {
        const gradient = getRandomGradient();
        const initials = getInitials(presence?.name);
        console.log("Rendering other user:", presence?.name, "Initials:", initials);
        return (
          <div
            key={connectionId}
            className={styles.avatar}
            style={{ background: gradient }}
          >
            <div className={styles.avatarInitials}>{initials}</div>
            <div className={styles.avatarTooltip}>{presence?.name || "Unknown"}</div>
          </div>
        );
      })}

      {/* Render +n if more than 3 users */}
      {hasMoreUsers && (
        <div className={styles.more}>+{others.length - 3}</div>
      )}

      {/* Render current user if available */}
      {currentUser && user && (
        <div
          className={styles.avatar}
          style={{ background: getRandomGradient() }}
        >
          <div className={styles.avatarInitials}>{getInitials(user.fullName)}</div>
          <div className={styles.avatarTooltip}>You ({user.fullName})</div>
        </div>
      )}
    </div>
  );
}