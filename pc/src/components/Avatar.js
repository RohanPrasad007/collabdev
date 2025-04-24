// Avatar.js - Reusable Avatar component
import { useState, useEffect } from "react";

const Avatar = ({ src, name, className = "", size = "md" }) => {
  const [error, setError] = useState(false);
  const [initials, setInitials] = useState("");

  useEffect(() => {
    // Generate initials from name
    if (name) {
      const nameParts = name.split(" ");
      let userInitials = "";

      if (nameParts.length === 1) {
        userInitials = nameParts[0].charAt(0).toUpperCase();
      } else {
        userInitials = (
          nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
        ).toUpperCase();
      }

      setInitials(userInitials);
    }
  }, [name]);

  // Generate a consistent color based on name
  const generateColor = (name) => {
    if (!name) return "#6366F1"; // Default color

    const colors = [
      "#10B981", // Emerald
      "#6366F1", // Indigo
      "#F59E0B", // Amber
      "#EF4444", // Red
      "#8B5CF6", // Violet
      "#EC4899", // Pink
      "#3B82F6", // Blue
      "#14B8A6", // Teal
      "#F97316", // Orange
      "#8B5CF6", // Purple
    ];

    // Simple hash function for name to pick a color
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const bgColor = generateColor(name);

  if (src && !error) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img
          src={src}
          alt={name || "User avatar"}
          layout="fill"
          objectFit="cover"
          onError={() => setError(true)}
          className="rounded-full"
        />
      </div>
    );
  }

  // Fallback to initials avatar
  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-medium ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {initials}
    </div>
  );
};

export default Avatar;
