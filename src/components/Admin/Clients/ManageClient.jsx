import React from "react";
import { Container, FormLabel, IconButton, Stack, Tooltip } from "@mui/material";
import { DisplayDate, Input, Radiogroup } from "../../Common";
import { observer } from "mobx-react";
import clientStore from "../../../state/store/admin/clients/details";
import { DeleteOutline } from "@mui/icons-material";
import { clientStatus, filterEmptyValues, isValidDate } from "../../../utils";
import { CLIENT_STATUS_DESC } from "../../../constants";
import { Confirm } from "../../../componentsV2/Common/Confirm";

const ClientInformation = observer(() => {
    const status = clientStatus(clientStore.client);
    const readonly = clientStore.readOnlyClient(status);

    const subdomains = !clientStore.client?.subdomains.includes("")
        ? [...clientStore.client.subdomains, ""]
        : clientStore.client.subdomains;

    const handleDomain = value => {
        clientStore.set("domain", value);

        if (subdomains.length === 0) {
            clientStore.set("subdomains", [""]);
        }
    };

    const handleSubDomains = (e, index) => {
        const { value } = e.target;
        const list = [...subdomains];
        list[index] = value;

        clientStore.set("subdomains", list);

        if (index === subdomains.length - 1) {
            clientStore.set("subdomains", [...list, ""]);
        }

        //if the last but one text box value is erased, remove the last empty textbox
        if (list.length > 1 && list[list.length - 2] === "") {
            list.splice(index + 1, 1);
            clientStore.set("subdomains", list);
        }
    };

    const handleDelete = async index => {
        const { isConfirmed } = await Confirm(
            "Delete Subdomain",
            "Are you sure you want to delete this subdomain"
        );
        if (isConfirmed) {
            const list = [...subdomains];
            list[index] = "";

            list.splice(index, 1);
            clientStore.set("subdomains", list);
        }
    };

    const showSubdomains =
        (clientStore.client?.domain !== undefined && clientStore.client?.domain !== "") ||
        (clientStore.client?.domain === "" && filterEmptyValues(subdomains)?.length > 0);

    const allowCodeBuilderAccess = [
        { value: true, label: "Yes" },
        { value: false, label: "No" },
    ];

    const allowFileDownload = [
        { value: true, label: "Yes" },
        { value: false, label: "No" },
    ];

    return (
        <Container maxWidth="85%" sx={{ paddingBottom: "3rem" }}>
            <div style={{ width: "90%", marginLeft: "4rem" }}>
                <Input
                    name="Client Name"
                    label="Client Name"
                    value={clientStore.client?.name}
                    onChange={e => {
                        clientStore.set("name", e.target.value);
                    }}
                    disabled={readonly}
                />

                <Input
                    name="Description"
                    label="Description"
                    value={clientStore.client?.description}
                    onChange={e => {
                        clientStore.set("description", e.target.value);
                    }}
                    disabled={readonly}
                />
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        columnGap: "10px",
                    }}
                >
                    <DisplayDate
                        selectedDate={new Date(clientStore.client?.startDate)}
                        name="Start Date"
                        handleDateChange={newValue => {
                            if (isValidDate(newValue)) {
                                clientStore.set("startDate", newValue);
                            }
                        }}
                        disabled={readonly}
                        ariaLabel="Start Date"
                        label="Start Date"
                        maxDate={new Date(clientStore.client?.endDate)}
                    />

                    <DisplayDate
                        selectedDate={new Date(clientStore.client?.endDate)}
                        name="End Date"
                        handleDateChange={newValue => {
                            if (isValidDate(newValue)) {
                                clientStore.set("endDate", newValue);
                            }
                        }}
                        disabled={status === CLIENT_STATUS_DESC.DELETED}
                        ariaLabel="End Date"
                        label="End Date"
                        minDate={new Date(clientStore.client?.startDate)}
                    />
                </div>
                <Stack direction="row" spacing={2} alignItems="center">
                    <FormLabel
                        id="code-builder-radio-buttons-group"
                        sx={{
                            fontWeight: "500",
                            padding: "10px auto 10px auto",
                        }}
                    >
                        Allow Access to Code Builder:
                    </FormLabel>

                    <Radiogroup
                        aria-labelledby="code-builder-radio-buttons-group"
                        value={clientStore.client?.codeBuilderAccess || false}
                        handleChange={e => {
                            clientStore.set("codeBuilderAccess", e.target.value === "true");
                        }}
                        radioOptions={allowCodeBuilderAccess}
                        disabled={readonly}
                    />
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                    <FormLabel
                        id="study-download-radio-buttons-group"
                        sx={{
                            fontWeight: "500",
                            padding: "10px auto 10px auto",
                        }}
                    >
                        Allow client to download completed studies and addons:
                    </FormLabel>

                    <Radiogroup
                        aria-labelledby="study-download-radio-buttons-group"
                        value={clientStore.client?.studyDownloadAccess || false}
                        handleChange={e => {
                            clientStore.set("studyDownloadAccess", e.target.value === "true");
                        }}
                        radioOptions={allowFileDownload}
                        disabled={readonly}
                    />
                </Stack>
                <Input
                    name="Domain"
                    label="Domain"
                    placeholder="abc.de"
                    value={clientStore.client?.domain}
                    onChange={e => {
                        handleDomain(e.target.value);
                    }}
                    disabled={readonly}
                />
                {showSubdomains &&
                    subdomains.map((sd, i) => {
                        return (
                            <Stack
                                direction="row"
                                spacing={2}
                                key={i}
                                alignItems="center"
                                sx={{ marginTop: "10px" }}
                            >
                                <Input
                                    key={i}
                                    name="subdomain"
                                    label="Sub Domain"
                                    value={sd}
                                    onChange={e => {
                                        handleSubDomains(e, i);
                                    }}
                                    sx={{
                                        width: subdomains.length > 1 ? "90%" : "100%",
                                    }}
                                    disabled={readonly}
                                />
                                {sd && (
                                    <Tooltip title="Delete SubDomain" aria-label="Delete SubDomain">
                                        <span>
                                            <IconButton
                                                onClick={() => handleDelete(i)}
                                                size="large"
                                                disabled={readonly}
                                            >
                                                <DeleteOutline />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                )}
                            </Stack>
                        );
                    })}
            </div>
        </Container>
    );
});
export default ClientInformation;
