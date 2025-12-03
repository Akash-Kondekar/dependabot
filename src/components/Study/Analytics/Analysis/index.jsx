import React from "react";
import { observer } from "mobx-react";
import { Card, CardActionArea, CardContent, Grid2 as Grid, Paper, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Apps } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const useLocalStyles = makeStyles({
    root: {
        borderRadius: 7,
        textAlign: "center",
        boxShadow:
            "0px -2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 1px rgba(0,0,0,0.14), 0px -1px 3px 0px rgba(0,0,0,0.12)",
        minHeight: 275,
        minWidth: 275,
    },
});

const DisplayAnalysis = observer(() => {
    const localClasses = useLocalStyles();
    const navigate = useNavigate();

    return (
        <Grid container justifyContent={"center"} sx={{ paddingTop: "8rem" }}>
            <Grid
                size={{
                    xs: 12,
                    md: 11,
                    lg: 11,
                    xl: 10,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        columnGap: "20px",
                    }}
                >
                    <Paper>
                        <Card className={localClasses.root}>
                            <CardActionArea
                                onClick={() =>
                                    navigate("/analytics/analysis/overall", {
                                        state: { title: "Overall" },
                                    })
                                }
                            >
                                <CardContent sx={{ minHeight: 275 }}>
                                    <Typography
                                        sx={{ fontSize: 30, marginTop: "60px" }}
                                        color="text.secondary"
                                        gutterBottom
                                        component="div"
                                    >
                                        <Apps
                                            sx={{ verticalAlign: "middle" }}
                                            fontSize="large"
                                            color="secondary"
                                        />
                                        <div>Overall</div>
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Paper>
                    <Paper>
                        <Card className={localClasses.root}>
                            <CardActionArea
                                onClick={() =>
                                    navigate("/analytics/analysis/subgroup", {
                                        state: { title: "Subgroup" },
                                    })
                                }
                            >
                                <CardContent sx={{ minHeight: 275 }}>
                                    <Typography
                                        sx={{ fontSize: 30, marginTop: "60px" }}
                                        color="text.secondary"
                                        gutterBottom
                                        component="div"
                                    >
                                        <Apps
                                            sx={{ verticalAlign: "middle" }}
                                            fontSize="large"
                                            color="secondary"
                                        />
                                        <div>Subgroup</div>
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Paper>
                </div>
            </Grid>
        </Grid>
    );
});

export default DisplayAnalysis;
