import * as React from "react";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import { useTheme } from "@mui/material/styles";

export default function MyProjectsSkeleton() {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";

    return (
        <>
            <Box sx={{ flexGrow: 1, bgcolor: "background.default", minHeight: "100vh" }}>
                {/* Top section: Search bar and New Project button */}
                <Box sx={{ my: 4.5 }}>
                    <Grid
                        container
                        spacing={2}
                        sx={{
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <Grid size={{ xs: 12, md: 9, lg: 9, xl: 10 }}>
                            <Skeleton
                                variant="rectangular"
                                height={56}
                                sx={{ borderRadius: 4, width: "100%" }}
                            />
                        </Grid>
                        <Grid>
                            <Skeleton
                                variant="rectangular"
                                width="132px"
                                height={48}
                                sx={{ borderRadius: 8 }}
                            />
                        </Grid>
                    </Grid>
                </Box>

                {/* Filter Chips */}
                <Box sx={{ display: "flex", gap: 1, mt: 4.5, mb: 4 }}>
                    <Skeleton
                        variant="rectangular"
                        width={24}
                        height={24}
                        sx={{ borderRadius: 4 }}
                    />
                    <Skeleton
                        variant="rectangular"
                        width={44}
                        height={24}
                        sx={{ borderRadius: 4 }}
                    />
                    {/* Active */}
                    <Skeleton
                        variant="rectangular"
                        width={24}
                        height={24}
                        sx={{ borderRadius: 4 }}
                    />
                    <Skeleton
                        variant="rectangular"
                        width={63}
                        height={24}
                        sx={{ borderRadius: 4 }}
                    />
                    {/* Archived */}
                    <Skeleton
                        variant="rectangular"
                        width={24}
                        height={24}
                        sx={{ borderRadius: 4 }}
                    />{" "}
                    <Skeleton
                        variant="rectangular"
                        width={30}
                        height={24}
                        sx={{ borderRadius: 4 }}
                    />
                    {/* All */}
                </Box>

                {/* Grid of Cards */}
                <Grid container spacing={3}>
                    {Array.from(new Array(10)).map(
                        (
                            _,
                            index // Simulate 9 cards
                        ) => (
                            <Grid
                                size={{
                                    xs: 12,
                                    md: 6,
                                    lg: 4,
                                    xl: 3,
                                }}
                                key={index}
                            >
                                <Box
                                    sx={{
                                        p: 2,
                                        height: "220px",
                                        borderRadius: 8,
                                        backgroundColor: isDarkMode ? "grey.main" : "grey.light",
                                        borderWidth: "1px",
                                        borderStyle: "solid",
                                        borderColor: isDarkMode ? "grey.light" : "grey.main",
                                    }}
                                >
                                    {/* Card Title */}
                                    <Skeleton
                                        variant="text"
                                        width="60%"
                                        height={50}
                                        sx={{ mb: 1 }}
                                    />{" "}
                                    {/* Subtitle */}
                                    <Box sx={{ display: "flex", alignItems: "center", my: 2 }}>
                                        <Skeleton
                                            variant="circular"
                                            width={24}
                                            height={24}
                                            sx={{ mr: 1 }}
                                        />{" "}
                                        {/* Icon/Avatar */}
                                        <Skeleton variant="text" width="40%" height={24} />{" "}
                                        {/* Name */}
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", my: 2 }}>
                                        <Skeleton
                                            variant="circular"
                                            width={24}
                                            height={24}
                                            sx={{ mr: 1 }}
                                        />{" "}
                                        {/* Icon/Avatar */}
                                        <Skeleton variant="text" width="30%" height={24} />{" "}
                                        {/* Date */}
                                    </Box>
                                    <Skeleton
                                        variant="text"
                                        width="50%"
                                        height={20}
                                        sx={{ mt: 2 }}
                                    />{" "}
                                    {/* Org name */}
                                </Box>
                            </Grid>
                        )
                    )}
                </Grid>

                {/* Pagination */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        mt: 5,
                        gap: 0.5,
                    }}
                >
                    <Skeleton
                        variant="rectangular"
                        width={60}
                        height={36}
                        sx={{ borderRadius: 2 }}
                    />{" "}
                    {Array.from(new Array(5)).map(
                        (
                            _,
                            index // Simulate about 5 page numbers
                        ) => (
                            <Skeleton
                                key={index}
                                variant="rectangular"
                                sx={{ borderRadius: 2 }}
                                width={36}
                                height={36}
                            />
                        )
                    )}
                    <Skeleton
                        variant="rectangular"
                        width={60}
                        height={36}
                        sx={{ borderRadius: 2 }}
                    />{" "}
                    {/* Page 1 */}
                </Box>
            </Box>
        </>
    );
}
