import * as React from "react";
import Skeleton from "@mui/material/Skeleton";
import Grid from "@mui/material/Grid2";

export default function DashboardSkeleton() {
    const boxStyle = {
        mb: 2,
        borderRadius: "16px",
        backgroundColor: theme => theme.palette.grey.background,
    };
    return (
        <div spacing={1} style={{ margin: "2%" }}>
            <Skeleton
                variant="rectangular"
                width="100%"
                sx={{ ...boxStyle, maxHeight: "60vh", minHeight: 400 }}
            />

            <Grid container spacing={2} sx={{ mt: "2%" }}>
                <Grid size={8}>
                    <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={370}
                        sx={{
                            ...boxStyle,
                            p: 2,
                        }}
                    />
                    <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={370}
                        sx={{
                            ...boxStyle,
                            p: 2,
                        }}
                    />
                    <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={370}
                        sx={{
                            ...boxStyle,
                            p: 2,
                        }}
                    />
                </Grid>
                <Grid size={4}>
                    <Skeleton variant="rectangular" height={180} sx={{ ...boxStyle }} />
                    <Skeleton variant="rectangular" height={270} sx={{ ...boxStyle }} />
                    <Skeleton variant="rectangular" height={270} sx={{ ...boxStyle }} />
                </Grid>
            </Grid>
        </div>
    );
}
