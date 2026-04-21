  export const getInitials = (name: string | undefined) => {
    if (!name) return "";

    const parts = name.trim().split(/\s+/);

    if (parts.length >= 2) {
      return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
    }

    return parts[0].slice(0, 2).toUpperCase();
  };

  