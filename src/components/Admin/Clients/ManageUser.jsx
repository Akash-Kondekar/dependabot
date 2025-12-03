import React from "react";
import {
    Container,
    Typography,
    Paper,
    Stack,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Divider,
    Button,
    Tooltip,
    FormControlLabel,
    Checkbox,
    TextField,
    Autocomplete,
} from "@mui/material";
import { DisplayAvatar } from "../../Common";
import { observer } from "mobx-react";
import userStore from "../../../state/store/admin/clients/users";
import clientStore from "../../../state/store/admin/clients/details";
import { AddCircle, DeleteOutline } from "@mui/icons-material";
import makeStyles from "@mui/styles/makeStyles";
import { CLIENT_STATUS_DESC, SYSTEM_ROLE } from "../../../constants";
import { NoData } from "../../Common/NoData";
import { prepareData, clientStatus } from "../../../utils";
import PropTypes from "prop-types";
import { Confirm } from "../../../componentsV2/Common/Confirm";
import { ShowSuccess } from "../../../componentsV2/Common/Toast";

const useStyles = makeStyles(() => ({
    root: {
        marginTop: "20px",
        minHeight: "max-content",
        maxHeight: 500,
        overflowY: "auto",
        boxShadow:
            "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
        width: "99%",
    },
    drawerPaper: {
        width: "500px",
    },
    selected: {
        backgroundColor: "#d1e6fa",
    },
    menuPaper: {
        position: "absolute",
        bottom: "70px",
        top: "192px",
        marginTop: "auto !important",
    },
}));

export const Users = observer(() => {
    const status = clientStatus(clientStore.client);
    const readonly = status === CLIENT_STATUS_DESC.DELETED || status === CLIENT_STATUS_DESC.EXPIRED;

    const [open, toggleDrawer] = React.useState(false);
    const [userType, setUserType] = React.useState("user");
    const [data, setData] = React.useState([]);
    const classes = useStyles();
    const users = {
        user: userStore.clientUsers.filter(user => user.role === SYSTEM_ROLE.USER),
        moderator: userStore.clientUsers.filter(user => user.role === SYSTEM_ROLE.MODERATOR),
    };

    React.useEffect(() => {
        (async () => {
            await userStore.getClientUsers(clientStore?.clientId);
            await userStore.getAllActiveUsers();
            setData(
                prepareData(userStore.list, {
                    value: "userId",
                    label: "userFullName",
                })
            );
        })();
    }, []);

    const removeUser = async (type, target) => {
        const { isConfirmed } = await Confirm(
            `Delete ${type}`,
            `Are you sure you want to delete ${target} as ${type}`
        );
        if (isConfirmed) {
            const results = await userStore.delete(
                clientStore?.clientId,
                target,
                SYSTEM_ROLE[type.toUpperCase()]
            );

            if (results) {
                ShowSuccess("User Deleted");
            }
        }
    };

    if (clientStore.loading) {
        return "Loading...";
    }

    return (
        <Container maxWidth="100%" sx={{ width: "94%", marginLeft: "2rem" }}>
            <DisplayDrawer
                buttonText="Add"
                Widget={AddUser}
                result={data}
                open={open}
                toggleDrawer={toggleDrawer}
                userType={userType}
                setData={setData}
                users={userStore?.clientUsers}
            />
            <Container maxWidth="100%" sx={{ mt: 2 }}>
                {["user", "moderator"].map(type => {
                    return (
                        <div key={type} style={{ marginBottom: "5rem" }}>
                            <Paper sx={{ width: "100%" }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Typography
                                        variant="h6"
                                        p={2}
                                        sx={{
                                            width: "100%",
                                            textTransform: "capitalize",
                                        }}
                                        component="span"
                                    >
                                        {type}
                                    </Typography>
                                    <div>
                                        <IconButton
                                            onClick={() => {
                                                setUserType(type);
                                                toggleDrawer(true);
                                            }}
                                            disabled={readonly}
                                        >
                                            <AddCircle />
                                        </IconButton>
                                    </div>
                                </Stack>
                            </Paper>
                            <Container maxWidth="100%" className={classes.root}>
                                {users?.[type]?.length > 0 ? (
                                    users?.[type].map((user, index) => {
                                        return (
                                            <List
                                                sx={{
                                                    width: "100%",
                                                    maxWidth: "100%",
                                                    bgcolor: "background.paper",
                                                }}
                                                key={index}
                                            >
                                                <ListItem
                                                    secondaryAction={
                                                        <Tooltip
                                                            title="Delete user"
                                                            aria-label="Delete user"
                                                        >
                                                            <span>
                                                                <IconButton
                                                                    edge="end"
                                                                    aria-label="remove"
                                                                    onClick={() =>
                                                                        removeUser(
                                                                            type,
                                                                            user.userId,
                                                                            index
                                                                        )
                                                                    }
                                                                    disabled={readonly}
                                                                >
                                                                    <DeleteOutline />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    }
                                                    alignItems="flex-start"
                                                >
                                                    <ListItemAvatar>
                                                        <DisplayAvatar
                                                            value={user.userFullName}
                                                            randomColor={true}
                                                        />
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={user.userFullName}
                                                        secondary={
                                                            //changing div to span to handle MUI warning.
                                                            <span>
                                                                <Typography
                                                                    sx={{
                                                                        display: "inline",
                                                                    }}
                                                                    component="span"
                                                                    variant="body2"
                                                                    color="text.primary"
                                                                ></Typography>
                                                                {user.userId}
                                                            </span>
                                                        }
                                                    />
                                                </ListItem>
                                                <Divider variant="inset" component="li" />
                                            </List>
                                        );
                                    })
                                ) : (
                                    <div
                                        style={{
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        <NoData message={`Click on plus icon to add a ${type}`} />
                                    </div>
                                )}
                            </Container>
                        </div>
                    );
                })}
            </Container>
        </Container>
    );
});

export const DisplayDrawer = props => {
    const { Widget, open, toggleDrawer } = props;
    const classes = useStyles();
    return (
        <div>
            <Drawer
                anchor="right"
                open={open}
                onClose={() => toggleDrawer(false)}
                classes={{
                    paper: classes.drawerPaper,
                }}
            >
                <Widget {...props} showAddBtn={true} showCloseBtn={true} buttonText="Add" />
            </Drawer>
        </div>
    );
};

const AddUser = observer(props => {
    const { toggleDrawer, result, userType, buttonText, showCloseBtn, showAddBtn, users } = props;

    const [selected, setSelected] = React.useState({ user: [], moderator: [] });
    const [updatedList, setList] = React.useState([]);
    const [selectAll, setSelectAll] = React.useState(false);

    React.useEffect(() => {
        const usersByRole = users && getEligibleUsers();
        setList(usersByRole);
    }, [userType]);

    const getEligibleUsers = () => {
        const existingUsers = users.map(user => user.userId);
        const eligibleUsers = result.filter(user => !existingUsers.includes(user.value));
        return eligibleUsers;
    };

    const handleChange = value => {
        setSelected({ ...selected, [userType]: value });

        if (value.length === updatedList.length) {
            setSelectAll(true);
            return;
        }

        setSelectAll(false);
    };

    const handleSelectAll = status => {
        if (status) {
            setSelected({
                ...selected,
                [userType]: updatedList,
            });
        } else {
            setSelected({ ...selected, [userType]: [] });
        }
        setSelectAll(status);
    };

    const addUsers = async () => {
        toggleDrawer(false);

        const payload = {
            users: selected[userType].map(user => user.value),
            role: SYSTEM_ROLE[userType.toUpperCase()],
        };

        const success = await userStore.add(payload, clientStore?.clientId);
        if (success) {
            userStore.getClientUsers(clientStore?.clientId);
        }
    };

    const noUsers = updatedList.length === 0;

    return (
        <Container role="presentation">
            <br />
            <h3>Add User</h3>
            {!noUsers && (
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={selectAll}
                            onChange={() => handleSelectAll(!selectAll)}
                        />
                    }
                    label="Select all"
                    sx={{ marginBottom: "20px" }}
                />
            )}
            <div>
                {noUsers && (
                    <div>
                        <NoData message="No Eligible Users found. Please Invite users and come back" />
                    </div>
                )}

                {!noUsers && (
                    <Autocomplete
                        options={updatedList}
                        getOptionKey={option => (option ? option.value : "")}
                        getOptionLabel={option => (option ? option.label : "")}
                        value={selected?.[userType] ?? []}
                        onChange={(e, newValue) => {
                            handleChange(newValue);
                        }}
                        sx={{ marginTop: "16px", marginBottom: "8px", minWidth: 200 }}
                        multiple={true}
                        renderInput={params => <TextField {...params} label="Select User" />}
                    />
                )}
            </div>
            <br /> <br /> <br />
            <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    left: 0,
                    paddingLeft: "20px",
                    paddingBottom: "20px",
                }}
            >
                {showCloseBtn && (
                    <Button
                        variant="outlined"
                        onClick={() => {
                            toggleDrawer(false);
                            setSelected([userType], []);
                        }}
                    >
                        Cancel
                    </Button>
                )}

                {showAddBtn && !noUsers && (
                    <Button variant="contained" color="primary" onClick={() => addUsers()}>
                        {buttonText}
                    </Button>
                )}
            </Stack>
        </Container>
    );
});

DisplayDrawer.propTypes = {
    Widget: PropTypes.object,
    open: PropTypes.bool,
    toggleDrawer: PropTypes.func,
};
