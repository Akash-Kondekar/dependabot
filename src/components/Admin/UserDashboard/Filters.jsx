import React from "react";
import {
    FormControlLabel,
    FormControl,
    Radio,
    RadioGroup,
    CardContent,
    Card,
    CardHeader,
    Divider,
} from "@mui/material";
import { observer } from "mobx-react";
import Users from "../../../state/store/admin/users";
import makeStyles from "@mui/styles/makeStyles";
import { createTheme, ThemeProvider } from "@mui/material";
import { STATUS_FILTER, SYSTEM_ROLE } from "../../../constants";
import { CheckBoxGroup } from "../../Common";
import events from "../../../lib/events";

const useStyles = makeStyles(() => ({
    root: {
        minHeight: "max-content",
        overflowY: "auto",
        boxShadow: "none",
        width: "100%",
        paddingTop: "2px",
        paddingLeft: "0px",
    },
}));

const theme = createTheme({
    components: {
        MuiTypography: {
            styleOverrides: {
                root: {
                    fontSize: "17px",
                    fontWeight: 500,
                },
            },
        },
    },
});

const MultiSelectCheckbox = observer(({ list, type, setReload }) => {
    const length = list.length;
    const [checked, setChecked] = React.useState(new Array(length).fill(false));

    const handleChecked = async (event, index, item) => {
        const newList = [...checked];
        newList[index] = event.target.checked;
        setChecked(newList);

        setReload(true);

        const newSelected = { ...Users.filters };
        if (event.target.checked) {
            newSelected[type].push(item.value);
            Users.setFilters(newSelected);
        } else {
            newSelected[type] = newSelected[type].filter(newItem => newItem !== item.value);
            Users.setFilters(newSelected);
        }
    };
    return (
        <CheckBoxGroup
            checkboxData={list}
            label={type}
            handleOnChecked={handleChecked}
            value={checked}
            sx={{ textTransform: "capitalize" }}
        />
    );
});

const SingleSelectCheckbox = ({ list, type, setReload }) => {
    const [status, setStatus] = React.useState("");

    const updateStatus = async event => {
        if (event.target.value === status) {
            setStatus("");
            Users.setFilters({ ...Users.filters, status: STATUS_FILTER.ALL });
        } else {
            setStatus(event.target.value);
            Users.setFilters({
                ...Users.filters,
                status:
                    event.target.value === "Active" ? STATUS_FILTER.ACTIVE : STATUS_FILTER.DELETED,
            });
        }
        setReload(true);
    };

    return (
        <FormControl component="fieldset" sx={{ marginLeft: "24px" }}>
            <RadioGroup aria-label={type} name={type} value={status}>
                {list.map((item, index) => {
                    return (
                        <FormControlLabel
                            value={item}
                            key={index}
                            control={<Radio onClick={updateStatus} />}
                            label={item}
                            sx={{ textTransform: "capitalize" }}
                        />
                    );
                })}
            </RadioGroup>
        </FormControl>
    );
};

const DisplayClient = props => {
    const USER_NOT_MAPPED_TO_ANY_CLIENT = 0;

    const eligibleClientList = [
        ...props.list,
        { value: USER_NOT_MAPPED_TO_ANY_CLIENT, label: "Not Mapped" },
    ];
    return <MultiSelectCheckbox type="clients" {...props} list={eligibleClientList} />;
};

const DisplayRole = observer(props => {
    const role = Object.keys(SYSTEM_ROLE)
        .filter(role => role !== "ADMIN")
        .map(user => {
            return { label: user.toLowerCase(), value: SYSTEM_ROLE[user] };
        });

    return <MultiSelectCheckbox type="roles" list={role} {...props} />;
});

const DisplayStatus = props => {
    const status = ["Active", "Deleted"];
    return <SingleSelectCheckbox type="status" list={status} {...props} />;
};

export function DisplayFilter({ getComponentForLink }) {
    return (
        <div style={{ flexBasis: "45%", textAlign: "left" }}>
            {["Role", "Status", "Client"].map((value, index) => {
                return (
                    <div key={index}>
                        <Card sx={{ boxShadow: "none" }}>
                            <ThemeProvider theme={theme}>
                                <CardHeader
                                    title={value}
                                    sx={{ padding: "16px 16px 0px 38px" }}
                                ></CardHeader>
                            </ThemeProvider>

                            <CardContent sx={{ textAlign: "left" }}>
                                {getComponentForLink(value)}
                            </CardContent>
                        </Card>

                        <Divider variant="middle" />
                    </div>
                );
            })}
        </div>
    );
}

const Filters = observer(({ listOfClients }) => {
    const [reload, setReload] = React.useState(false);

    const classes = useStyles();

    React.useEffect(() => {
        Users.resetFilters();
    }, []);

    React.useEffect(() => {
        if (reload) {
            events.emit("users.load");
        }
    }, [Users.filters]);

    function getComponentForLink(value) {
        switch (value) {
            case "Client":
                return <DisplayClient list={listOfClients} setReload={setReload} />;
            case "Role":
                return <DisplayRole setReload={setReload} />;
            case "Status":
                return <DisplayStatus setReload={setReload} />;
            default:
                return "Other";
        }
    }

    return (
        <div className={classes.root}>
            <DisplayFilter getComponentForLink={getComponentForLink} />
        </div>
    );
});

export default Filters;
