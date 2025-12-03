import React from "react";
import { useTheme } from "@emotion/react";

export const CustomSVGImage = ({ Image, style = {}, alt, props }) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";
    return (
        <Image
            style={{
                ...style,
            }}
            color={isDarkMode ? theme.palette.primary.image : theme.palette.primary.main}
            alt={alt}
            {...props}
        />
    );
};
