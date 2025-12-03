import * as React from "react";
import Avatar from "@mui/material/Avatar";

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

function stringAvatar(name, randomColor = false, size = "default", fontSize = "1.25rem") {
    return {
        sx: {
            bgcolor: randomColor ? stringToColor(name) : "#1976d2",
            width: SIZES[size].width,
            height: SIZES[size].height,
            marginRight: size === "large" ? "14px" : 0,
            marginTop: size === "large" ? "1px" : 0,
            fontSize: fontSize,
            color: randomColor ? "black" : undefined,
        },
        children:
            name.trim().indexOf(" ") !== -1
                ? `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`
                : `${name[0]}`,
    };
}

export const DisplayAvatar = ({
    value,
    randomColor,
    fontSize,
    size,
    variant = "circular",
    url = "",
}) => {
    const UpperCaseValue = value ? value?.replace(/\b(\w)/g, s => s.toUpperCase()) : value;

    if (url !== "")
        return (
            <Avatar
                alt={UpperCaseValue}
                src={url}
                sx={{ width: SIZES[size].width, height: SIZES[size].height }}
            />
        );
    else
        return (
            <Avatar
                {...stringAvatar(UpperCaseValue, randomColor, size, fontSize)}
                variant={variant}
            />
        );
};
