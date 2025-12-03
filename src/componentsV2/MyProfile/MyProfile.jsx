import React from "react";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid2";
import { observer } from "mobx-react";

import useTheme from "@mui/material/styles/useTheme";
import session from "../../state/store/session";
import { formatDate } from "../../utils";
import { DATA_NOT_AVALIBLE, SYSTEM_ROLE } from "../../constants";
import { lightTheme } from "../Styles/theme";
import { DisplayAvatar } from "../Common/Avatar";
import { PersonOutlineOutlined } from "@mui/icons-material";

const Profile = observer(() => {
    const theme = useTheme();

    React.useEffect(() => {
        (async () => {
            if (
                !session.isAdmin &&
                !(session.user.organisation && session.user.licenseExpiryDate)
            ) {
                await session.check();
            }
            return "Loading...";
        })();
    }, []);

    return (
        <Container
            component="main"
            sx={{
                paddingTop: theme.spacing(2),
                width: "100%", // Fix IE 11 issue.
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyItems: "center",
            }}
        >
            <DisplayAvatar size="xl" randomColor={false} bgcolor={lightTheme.palette.primary.light}>
                <PersonOutlineOutlined
                    sx={{
                        width: 75,
                        height: 75,
                        color: lightTheme.palette.primary.dark,
                    }}
                />
            </DisplayAvatar>
            <Grid
                container
                rowSpacing={2}
                sx={{
                    marginTop: theme.spacing(4),
                    marginLeft: { xs: "35%", sm: "0%", md: "20%", lg: "35%" },
                }}
            >
                <Grid size={3}>
                    <b>Name:</b>
                </Grid>
                <Grid size={9}>{session.user.userFullName}</Grid>
                <Grid size={3}>
                    <b>Email:</b>
                </Grid>
                <Grid size={9}>{session.user.userId}</Grid>
                <Grid size={3}>
                    <b>Joined:</b>
                </Grid>
                <Grid size={9}>
                    {(session.user?.registrationDate &&
                        formatDate(session.user.registrationDate)) ||
                        DATA_NOT_AVALIBLE}
                </Grid>
                <Grid size={3}>
                    <b>Role:</b>
                </Grid>
                <Grid size={9}>{session.user.roleDescription}</Grid>
                {session.user.role !== SYSTEM_ROLE.ADMIN && (
                    <>
                        <Grid size={3}>
                            <b>Organisation:</b>
                        </Grid>
                        <Grid size={9}>{session.user.organisation}</Grid>
                        <Grid size={3}>
                            <b>License Expiry:</b>
                        </Grid>
                        <Grid size={9}>
                            {(session.user?.licenseExpiryDate &&
                                formatDate(session.user.licenseExpiryDate)) ||
                                DATA_NOT_AVALIBLE}
                        </Grid>
                    </>
                )}
            </Grid>
        </Container>
    );
});

export default Profile;
