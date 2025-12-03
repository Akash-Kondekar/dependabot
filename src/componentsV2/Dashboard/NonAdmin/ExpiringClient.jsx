import React from "react";
import Typography from "@mui/material/Typography";

import dashboardStore from "../../../state/store/dashboard.js";
import user from "../../../state/store/user.js";
import { observer } from "mobx-react";

import { CancelOutlined } from "@mui/icons-material";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";

import { getExpiryDateString } from "./index.jsx";
import { IconButton, Stack } from "@mui/material";

const outline = {
    borderRadius: "10px",
    overflow: "auto",
    padding: "10px",
};

const ClientExpiryAlert = observer(() => {
    const currentTheme = useTheme();
    const displayAlert = user.isActiveClient && user.clientHasName;
    if (displayAlert) {
        const expiryDateString = getExpiryDateString(user.clientDetails?.clientEndDate);
        if (expiryDateString === null) return;
        return (
            <Box
                sx={{
                    ...outline,
                    bgcolor: "grey.background",
                    overflowY: "hidden",
                    paddingLeft: "24px",
                    mt: 2,
                }}
                aria-label="Expiring Client"
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
                        Dexter License Expiry
                    </Typography>
                    <IconButton aria-label="Close Expiring Databases Alert" size="small">
                        <CancelOutlined
                            onClick={() => {
                                dashboardStore.setClientAlertClosed(true);
                            }}
                            aria-label="Close Expiring Client Alert"
                        />
                    </IconButton>
                </Stack>

                <Typography sx={{ pt: 4 }}>
                    Dexter license for {user.clientDetails?.clientName} users {""}
                    <span
                        style={{
                            color: currentTheme.palette.error.main,
                        }}
                    >
                        will expire {expiryDateString} ({user.clientDetails?.clientEndDate}).
                    </span>
                    <br /> <br />
                    To continue using Dexter, please renew your license before the expiry date.
                    <br /> <br />
                    Need help? Contact{" "}
                    <a href="mailto:support@dexter.software" style={{ color: "inherit" }}>
                        support@dexter.software
                    </a>{" "}
                    for assistance.
                </Typography>
            </Box>
        );
    } else {
        return;
    }
});

const ExpiringClient = observer(() => {
    const { expiredClientAlertClosed } = dashboardStore;

    const getClientStatus = async () => {
        const getUserClientDetails = async () => {
            !user.clientDetailsFetched && (await user.getClientDetails());
        };

        if (!expiredClientAlertClosed) {
            getUserClientDetails();
        }
    };

    React.useEffect(() => {
        getClientStatus();
    }, []);

    return <div>{!expiredClientAlertClosed && <ClientExpiryAlert />}</div>;
});

export default ExpiringClient;
