import React from "react";
import { observer } from "mobx-react";
import UserList from "./UserList";
import { Grid2 as Grid, TextField } from "@mui/material";
import InviteUsers from "./InviteUsers";
import Filters from "./Filters";
import { BasicButton } from "../../Common";
import { allActiveClients, prepareData } from "../../../utils";
import Results from "./Results";
import DownloadTemplate from "./DownloadTemplate";
import users from "../../../state/store/admin/users";
import SearchIcon from "@mui/icons-material/Search";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles(theme => ({
    input: {
        "&:-webkit-autofill": {
            WebkitBoxShadow: theme.palette.mode === "dark" && "0 0 0 100px #262626 inset",
        },
    },
}));

const UserDashboard = observer(() => {
    const [action, setAction] = React.useState(null);
    const [showResults, setVisibility] = React.useState(false);
    const refSearchUserInput = React.createRef();
    const classes = useStyles();

    const USER_INVITE_ACTION = {
        INVITE: "Invite",
        UPLOAD: "Upload",
    };

    React.useEffect(() => {
        (async () => {
            await users.load();
            !users.allClientDetailsFetched && (await users.loadAllClients());
        })();
    }, []);

    const uploadDoc = () => {
        setAction(USER_INVITE_ACTION.UPLOAD);
        setVisibility(false);
    };
    const inviteUsers = () => {
        setAction(USER_INVITE_ACTION.INVITE);
        setVisibility(false);
    };

    const setTerm = async () => {
        if (refSearchUserInput?.current.value === "") {
            handleSearchUser();
        }
    };

    const handleSearchUser = () => {
        if (refSearchUserInput?.current?.value !== users?.filters?.term) {
            users.setFilters({
                ...users.filters,
                term: refSearchUserInput?.current.value,
            });

            users.load();
        }
    };

    const onKeyUp = e => {
        if (e.charCode === 13) {
            if (refSearchUserInput?.current?.value !== users?.filters?.term) {
                handleSearchUser();
            }
        }
    };

    //

    return (
        <Grid container justifyContent={"center"}>
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
                        flexWrap: "wrap",
                        gap: showResults ? "1rem" : 0,
                        alignItems: "center",
                        justifyContent: "end",
                        paddingLeft: "24px",
                        paddingTop: "15px",
                    }}
                >
                    <div
                        style={{
                            marginLeft: "20px",
                            flex: "1 0 auto",
                        }}
                    >
                        {showResults && <Results />}
                    </div>
                    <div
                        style={{
                            alignItems: "center",
                            display: "flex",
                            flex: showResults ? "6 1 auto" : "3 1 auto",
                            flexWrap: "wrap",
                            gap: "1rem",
                        }}
                    >
                        <div
                            style={{
                                position: "relative",
                                display: "flex",
                                flex: "11 1 auto",
                                justifyContent: "flex-end",
                            }}
                        >
                            <div
                                style={{
                                    position: "relative",
                                    display: "flex",
                                    flex: "1 1 auto",
                                    justifyContent: "flex-start",
                                    marginLeft: "20px",
                                }}
                            >
                                <TextField
                                    id="Search-User-Text-Field"
                                    name="Search User"
                                    type="search"
                                    variant="filled"
                                    label="Search User"
                                    placeholder="Search user by name or email"
                                    margin="normal"
                                    fullWidth
                                    inputRef={refSearchUserInput}
                                    onKeyUp={onKeyUp}
                                    onChange={setTerm}
                                    sx={{
                                        width: "70%",
                                        minWidth: "400px",
                                    }}
                                    slotProps={{
                                        input: {
                                            classes: { input: classes.input },
                                        },

                                        inputLabel: {
                                            shrink: true,
                                        },
                                    }}
                                />

                                <SearchIcon
                                    fontSize="large"
                                    style={{
                                        marginLeft: "10px",
                                        marginTop: "28px",
                                    }}
                                    onClick={handleSearchUser}
                                />
                            </div>
                        </div>
                        <div
                            style={{
                                marginLeft: "20px",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    gridAutoFlow: "column",
                                    justifyContent: "flex-start",
                                    gap: "0.25rem",
                                }}
                            >
                                <BasicButton
                                    variant="contained"
                                    color="primary"
                                    handleClick={uploadDoc}
                                    buttonText="Upload"
                                    sx={{
                                        marginTop: "7px",
                                        height: "40px",
                                    }}
                                />
                                <BasicButton
                                    variant="contained"
                                    color="primary"
                                    handleClick={inviteUsers}
                                    buttonText="Invite"
                                    sx={{
                                        marginTop: "7px",
                                        marginLeft: "15px",
                                        marginRight: "15px",
                                        height: "40px",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DownloadTemplate />

                <Grid container sx={{ paddingRight: "0px" }}>
                    <Grid
                        size={{
                            xs: 9,
                            md: 9,
                            lg: 9,
                        }}
                    >
                        <UserList />
                    </Grid>
                    <Grid
                        justifyContent="flex-end"
                        size={{
                            xs: 3,
                            md: 3,
                            lg: 3,
                        }}
                    >
                        <Filters
                            listOfClients={prepareData(users.listOfClients, {
                                value: "id",
                                label: "name",
                            })}
                        />
                    </Grid>
                </Grid>

                <InviteUsers
                    action={action}
                    setAction={setAction}
                    listOfClients={prepareData(allActiveClients(users.listOfClients), {
                        value: "id",
                        label: "name",
                    })}
                    setVisibility={setVisibility}
                    USER_INVITE_ACTION={USER_INVITE_ACTION}
                />
            </Grid>
        </Grid>
    );
});

export default UserDashboard;
