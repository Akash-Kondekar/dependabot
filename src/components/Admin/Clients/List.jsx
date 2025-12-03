import React from "react";
import { Paper } from "@mui/material";
import ClientCard from "./Card";

import { observer } from "mobx-react";
import clientListStore from "../../../state/store/admin/clients/list";
import { NoData } from "../../Common";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles(() => ({
    root: {
        borderRadius: "10px",
        border: "1px solid #e0e0e0",
        margin: "15px",
        cursor: "pointer",
        backgroundImage: "none",
    },
}));

export const ClientList = observer(() => {
    const classes = useStyles();

    React.useEffect(() => {
        clientListStore.loaded && clientListStore.load();
    }, []);

    if (clientListStore.loading) {
        return "Loading...";
    }

    return (
        <div>
            {clientListStore.list?.map(client => {
                return (
                    <Paper key={client.id} className={classes.root}>
                        <ClientCard client={client} />
                    </Paper>
                );
            })}
            {clientListStore.list?.length === 0 && (
                <div>
                    <NoData
                        message="Click on Add Client button to add a client"
                        hightlight="Add Client"
                    />
                </div>
            )}
        </div>
    );
});

export default ClientList;
