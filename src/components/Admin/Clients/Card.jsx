import React from "react";
import { Chip, Grid2 as Grid, IconButton, Typography } from "@mui/material";

import { clientStatus, formatDate } from "../../../utils";

import { DeleteOutlined, EditOutlined, RestoreOutlined } from "@mui/icons-material";

import { observer } from "mobx-react";

import clientListStore from "../../../state/store/admin/clients/list";
import clientStore from "../../../state/store/admin/clients/details";

import { useNavigate } from "react-router-dom";
import { DisplayAvatar } from "../../Common";
import makeStyles from "@mui/styles/makeStyles";
import { CLIENT_STATUS_DESC } from "../../../constants";
import events from "../../../lib/events";
import { Confirm } from "../../../componentsV2/Common/Confirm";
import { ShowSuccess } from "../../../componentsV2/Common/Toast";

const useStyles = makeStyles(() => ({
    root: {
        borderRadius: "10px",
        border: "1px solid #e0e0e0",
        margin: "10px",
        cursor: "pointer",
        backgroundImage: "none",
    },
    box: {
        display: "flex",
        flexDirection: "row",
        margin: "5px",
    },
    details: {
        display: "flex",
        flexDirection: "column",
        margin: "5px",
        padding: "5px",
    },
    bolderFont: {
        fontWeight: "bolder",
        fontSize: "larger",
    },
    avatar: {
        alignSelf: "center",
    },
    statusChip: {
        marginTop: "5px",
    },
}));

const Card = observer(({ client }) => {
    const { box, details, avatar, statusChip, bolderFont } = useStyles();

    const [icons, showIcons] = React.useState(false);
    const navigate = useNavigate();

    const editClient = client => {
        clientStore.setClient(client);

        navigate("/admin/client/Edit");
    };

    const ClientStatus = clientStatus(client);

    const deleteClient = async client => {
        if (!client.deleted) {
            const { isConfirmed } = await Confirm(
                "Delete Client",
                `Are you sure you want to delete ${client.name} client`
            );
            if (isConfirmed) {
                const results = await clientListStore.remove(client.id);
                if (results) {
                    ShowSuccess("Client deleted successfully");
                    events.emit("client.changed");
                }
            }
        }
    };

    const restoreClient = async client => {
        if (client.deleted) {
            const { isConfirmed } = await Confirm(
                "Restore Client",
                `Are you sure you want to restore ${client.name} client`
            );
            if (isConfirmed) {
                const results = await clientListStore.restore(client.id);
                if (results) {
                    ShowSuccess("Client restored successfully");
                    events.emit("client.changed");
                }
            }
        }
    };

    const Status = observer(() => {
        return <Chip label={ClientStatus} variant="outlined" />;
    });

    return (
        <Grid
            container
            width="100%"
            onMouseOver={() => {
                showIcons(true);
            }}
            onMouseOut={() => {
                showIcons(false);
            }}
            onClick={() => editClient(client)}
        >
            <Grid
                sx={{ pl: "10px" }}
                size={{
                    xs: 11,
                    md: 11,
                    lg: 11,
                    xl: 10,
                }}
            >
                <div className={box}>
                    <div className={avatar}>
                        <DisplayAvatar value={client.name.toUpperCase()} size="large" />
                    </div>
                    <div className={details}>
                        <span className={bolderFont}>{client.name}</span>
                        <div>
                            <Typography
                                sx={{ display: "inline" }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                            >
                                <strong>End Date:</strong> {formatDate(client.endDate)}
                                <br />
                                <strong>Database:</strong>{" "}
                                <span>
                                    {client?.databases?.length > 0
                                        ? client?.databases?.map(db => db.databaseName).join(" , ")
                                        : "No databases mapped"}
                                </span>
                            </Typography>
                        </div>
                        <div className={statusChip}>
                            <Status />
                        </div>
                    </div>
                </div>
            </Grid>
            <Grid
                sx={{ textAlign: "right" }}
                size={{
                    xs: 1,
                    md: 1,
                    lg: 1,
                    xl: 2,
                }}
            >
                {icons && (
                    <span>
                        {ClientStatus !== CLIENT_STATUS_DESC.DELETED && (
                            <IconButton
                                onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    editClient(client);
                                }}
                            >
                                <EditOutlined />
                            </IconButton>
                        )}

                        {client.deleted ? (
                            <IconButton
                                onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    restoreClient(client);
                                }}
                            >
                                <RestoreOutlined />
                            </IconButton>
                        ) : (
                            <IconButton
                                onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    deleteClient(client);
                                }}
                            >
                                <DeleteOutlined />
                            </IconButton>
                        )}
                    </span>
                )}
            </Grid>
        </Grid>
    );
});

export default Card;
