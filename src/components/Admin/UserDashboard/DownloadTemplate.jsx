import { useTheme } from "@emotion/react";
import React from "react";

const DownloadTemplate = () => {
    const systemTheme = useTheme();
    const isDarkMode = systemTheme.palette.mode === "dark";
    return (
        <div style={{ padding: "10px 30px 20px 10px", textAlign: "right" }}>
            <a
                href="../assets/Template.xlsx"
                download
                style={isDarkMode ? { color: "LightBlue" } : {}}
            >
                Download Template
            </a>
        </div>
    );
};
export default DownloadTemplate;
