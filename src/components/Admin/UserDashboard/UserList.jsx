import React from "react";
import {
    Chip,
    Container,
    Grid2 as Grid,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    Typography,
} from "@mui/material";
import { NoData } from "../../Common/NoData";
import { DisplayAvatar } from "../../Common";
import { observer } from "mobx-react";
import Users, { INITIAL_FILTER_STATE } from "../../../state/store/admin/users";
import { HandleAction } from "../Users/HandleAction";
import { SYSTEM_ROLE, USERSTATUS } from "../../../constants";
import { convertUserRoleToID, isDeepEqual } from "../../../utils";
import { ShowSuccess } from "../../../componentsV2/Common/Toast";

const UserCard = observer(({ user }) => {
    const [icons, showIcons] = React.useState(false);

    const preparePutData = (primaryKey, userIntension) => {
        const data = {
            userID: primaryKey,
            status: convertUserRoleToID(userIntension),
        };
        return data;
    };

    const executePut = async data => {
        const success = await Users.update(data);
        success && ShowSuccess("User Updated Successfully");
    };

    const performDeleteOrRestore = async (primaryKey, userIntension) => {
        const success =
            userIntension === USERSTATUS.DELETE
                ? await Users.delete(primaryKey)
                : await Users.restore(primaryKey);

        const message =
            userIntension === USERSTATUS.DELETE
                ? "User Deleted Successfully"
                : "User Restored Successfully";
        success && ShowSuccess(message);
    };

    const performPromoteOrDemoteAction = (primaryKey, newStatus) => {
        const data = preparePutData(primaryKey, newStatus);
        executePut(data);
    };

    return (
        <Grid
            container
            onMouseOver={() => {
                showIcons(true);
            }}
            onMouseOut={() => {
                showIcons(false);
            }}
        >
            <Grid
                sx={{ pl: "10px" }}
                size={{
                    xs: 10,
                    md: 10,
                    lg: 10,
                }}
            >
                <List
                    sx={{
                        width: "100%",
                        maxWidth: "100%",
                        bgcolor: "transparent",
                        paddingTop: 0,
                        paddingBottom: 0,
                    }}
                >
                    <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                            <DisplayAvatar value={user.userFullName} randomColor={true} />
                        </ListItemAvatar>
                        <ListItemText
                            primary={user.userFullName}
                            secondary={
                                <span>
                                    <Typography
                                        sx={{ display: "inline" }}
                                        component="span"
                                        variant="body2"
                                        color="text.primary"
                                    >
                                        {user.userID}
                                    </Typography>
                                    <br />
                                    <br />
                                    <Chip
                                        label={user.statusDescription}
                                        variant="outlined"
                                        sx={{ textTransform: "capitalize" }}
                                        component="span"
                                    />
                                    <Chip
                                        label={user.roleDescription}
                                        variant="outlined"
                                        sx={{
                                            marginLeft: "8px",
                                            textTransform: "capitalize",
                                        }}
                                        component="span"
                                    />
                                    <Chip
                                        label={user.clientName}
                                        variant="outlined"
                                        sx={{
                                            marginLeft: "8px",
                                            textTransform: "capitalize",
                                        }}
                                        component="span"
                                    />
                                </span>
                            }
                        />
                    </ListItem>
                </List>
            </Grid>
            <Grid
                sx={{ textAlign: "right" }}
                size={{
                    xs: 2,
                    md: 2,
                    lg: 2,
                }}
            >
                {icons && (
                    <span>
                        {!user.deleted ? (
                            <HandleAction
                                primaryKeyForAction={user.userID}
                                userIntension={USERSTATUS.DELETE}
                                performUpdate={performDeleteOrRestore}
                                isPromotable={parseInt(user.role) !== SYSTEM_ROLE.MODERATOR}
                                performPromoteOrDemoteAction={performPromoteOrDemoteAction}
                            />
                        ) : (
                            <HandleAction
                                primaryKeyForAction={user.userID}
                                userIntension={USERSTATUS.REACTIVATE}
                                performUpdate={performDeleteOrRestore}
                            />
                        )}
                    </span>
                )}
            </Grid>
        </Grid>
    );
});

const DisplayUserList = observer(() => {
    if (!Users?.busy && Users?.list?.length === 0) {
        //Compares fitlers with initial state to determine if the filter has been selected/changed in order to show appropriate no data message
        const initialFilter = isDeepEqual(Users.filters, INITIAL_FILTER_STATE);

        const message = initialFilter ? "No users found. Please invite users." : "No users found.";

        return <NoData message={message} />;
    }

    return (
        <Container
            maxWidth="100%"
            sx={{
                overflowY: "auto",
                height: "80vh",
            }}
        >
            {Users?.list?.map((user, index) => {
                return (
                    <Paper key={index} variant={"outlined"} sx={{ marginBottom: "10px" }}>
                        <UserCard key={index} user={user} />
                    </Paper>
                );
            })}
        </Container>
    );
});

export default DisplayUserList;
