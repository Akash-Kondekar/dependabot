import React from "react";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";

import { useTheme } from "@mui/material/styles";

import dashboardStore from "../../../state/store/dashboard.js";
import user from "../../../state/store/user.js";
import { observer } from "mobx-react";

import { CancelOutlined } from "@mui/icons-material";
import Box from "@mui/material/Box";

import Link from "@mui/material/Link";
import List from "@mui/material/List";
import Paper from "@mui/material/Paper";
import { getExpiryDateString } from "./index.jsx";
import { IconButton, ListItem, Stack } from "@mui/material";

const outline = {
    borderRadius: "10px",
    overflow: "auto",
    padding: "10px",
};

const DatabaseExpiryList = observer(() => {
    const [showMore, setShowMore] = React.useState(false);
    const [expiringDatabases, setExpiringDatabases] = React.useState([]);
    const currentTheme = useTheme();

    const MAX_VISIBLE_ITEM = 5;

    React.useEffect(() => {
        if (user.databaseDetails?.length !== 0 && expiringDatabases.length === 0) {
            const expiringClientDatabases = [...user.databaseDetails]
                ?.sort((c1, c2) => {
                    return c1.enddt > c2.enddt ? 1 : -1;
                })
                .filter(client => getExpiryDateString(client.enddt) !== null);
            setExpiringDatabases(expiringClientDatabases);
        }
    }, [user.databaseDetails]);

    if (expiringDatabases.length === 0) {
        return;
    }

    return (
        <Box
            sx={{
                ...outline,
                bgcolor: "grey.background",
                paddingLeft: "24px",
                mt: 2,
            }}
            aria-label="Expiring Databases"
        >
            <Stack
                direction="row"
                spacing={2}
                sx={{ justifyContent: "space-between", alignItems: "center" }}
            >
                <Typography
                    component="span"
                    variant="h6"
                    color="textPrimary"
                    sx={{ fontWeight: 700 }}
                >
                    Database License Expiry
                </Typography>
                <IconButton aria-label="Close Expiring Databases Alert" size="small">
                    <CancelOutlined
                        onClick={() => {
                            dashboardStore.setDbAlertClosed(true);
                        }}
                        aria-label="Close Expiring Databases Alert"
                    />
                </IconButton>
            </Stack>

            <List sx={{ paddingRight: "15px" }}>
                {expiringDatabases
                    .slice(0, showMore ? expiringDatabases.length : MAX_VISIBLE_ITEM)
                    .map(db => {
                        const key = db.id + db.name + db.enddt;
                        return (
                            <ListItem key={key} sx={{ paddingRight: 0, paddingLeft: 0 }}>
                                <Paper variant="outlined" sx={{ mt: 2 }}>
                                    <Grid container spacing={2}>
                                        <Grid size={12}>
                                            <Typography style={{ margin: "10px 20px 10px 20px" }}>
                                                Access to Database {db.name} database
                                                <span
                                                    style={{
                                                        color: currentTheme.palette.error.main,
                                                    }}
                                                >
                                                    {" "}
                                                    will expire {getExpiryDateString(db.enddt)} (
                                                    {db.enddt}
                                                    ).{" "}
                                                </span>
                                                <br /> <br />
                                                Please renew your database license before this date
                                                to maintain access.
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </ListItem>
                        );
                    })}
                {expiringDatabases.length > MAX_VISIBLE_ITEM && (
                    <div style={{ textAlign: "end", marginRight: "10px" }}>
                        <Link
                            style={
                                currentTheme.palette.mode === "dark" ? { color: "LightBlue" } : {}
                            }
                            onClick={() => setShowMore(!showMore)}
                        >
                            {showMore ? "Show less..." : "Show more..."}
                        </Link>
                    </div>
                )}
            </List>
        </Box>
    );
});

const ExpiringDatabases = observer(() => {
    const { expiredDbAlertClosed } = dashboardStore;

    const getDatabases = async () => {
        const getUserDbDetails = async () => {
            await user.getDatabaseDetails();
        };

        if (!expiredDbAlertClosed) {
            getUserDbDetails();
        }
    };

    React.useEffect(() => {
        getDatabases();
    }, []);

    return <div>{!expiredDbAlertClosed && <DatabaseExpiryList />}</div>;
});

export default ExpiringDatabases;
