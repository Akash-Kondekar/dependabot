import React from "react";
import Avatar from "@mui/material/Avatar";
import { useTheme } from "@mui/styles";

const SIZES = {
    small: {
        width: "24px",
        height: "24px",
    },
    default: {
        width: "40px",
        height: "40px",
    },
    large: {
        width: "56px",
        height: "56px",
    },
    xl: {
        width: "100px",
        height: "100px",
    },
};

function stringToColor(string) {
    let hash = 0;
    let i;

    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color = "hsl(" + value + ", 100%, 75%)";
    }

    return color;
}

function stringAvatar(name, randomColor = false, size = "default") {
    const getInitials = fullName => {
        if (!fullName) return "";
        const parts = fullName.trim().split(" ");
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return parts[0].substring(0, 2).toUpperCase();
    };

    const sizeObj = SIZES[size] || SIZES.default;
    const sizeNum = parseInt(sizeObj.width); // For Extracting numeric part (For ex: 40 from "40px")
    const fontSize = `${Math.floor(sizeNum * 0.45)}px`; // Adjusting font size based on it's size (We can change 0.45 to any value which can proposiate better with box)

    return {
        sx: {
            bgcolor: randomColor ? stringToColor(name) : "#1976d2",
            width: sizeObj.width,
            height: sizeObj.height,
            fontSize: fontSize,
            color: randomColor ? "black" : "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            lineHeight: 1,
            padding: 0,
            overflow: "hidden",
            boxSizing: "border-box",
        },
        children: getInitials(name),
    };
}

export const DisplayAvatar = ({
    randomColor = false,
    bgcolor = null,
    size = "default",
    variant = "circular",
    url = "",
    value,
    fontSize,
    children,
}) => {
    const theme = useTheme();

    const avatarSize = SIZES[size] || SIZES.default;

    const computedFontSize = fontSize || `${Math.floor(parseInt(avatarSize.width) * 0.45)}px`;

    const baseSx = {
        width: avatarSize.width,
        height: avatarSize.height,
        fontSize: computedFontSize,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
        boxSizing: "border-box",
        padding: 0,
        overflow: "hidden",
        bgcolor: bgcolor ? bgcolor : theme.palette.primary,
    };

    return (
        <Avatar
            alt={value}
            src={url || undefined}
            variant={variant}
            sx={baseSx}
            {...((!url && !children && stringAvatar(value, randomColor, size)) || {
                children: children,
            })}
        />
    );
};
