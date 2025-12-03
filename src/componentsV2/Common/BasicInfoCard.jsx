import React from "react";
import { Card, CardContent } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CardHeader from "@mui/material/CardHeader";

export const BasicInfoCard = ({ Content, Header, style, headingLevel = "h3", ...props }) => {
    const systemTheme = useTheme();
    const isDarkMode = systemTheme.palette.mode === "dark";
    return (
        <Card
            sx={{
                m: 1,
                p: 1,
                borderRadius: 8,
                backgroundColor: isDarkMode ? "grey.main" : "grey.light",
                borderColor: isDarkMode ? "grey.light" : "grey.main",
                ...style,
            }}
            {...props}
        >
            <CardHeader
                title={<Header />}
                slotProps={{
                    title: {
                        component: headingLevel,
                        variant: "h5",
                    },
                }}
            />
            <CardContent>
                <Content />
            </CardContent>
        </Card>
    );
};
