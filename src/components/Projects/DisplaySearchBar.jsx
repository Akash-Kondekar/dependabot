import React, { useEffect, useRef } from "react";
import { observer } from "mobx-react";
import { Button, Grid2 as Grid, TextField, Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NewProject from "./NewProject";
import ProjectList from "../../state/store/projects/list";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import session from "../../state/store/session";
import clientList from "../../state/store/admin/clients/list";
import { Radiogroup } from "../Common";
import { radioOptionsActiveAndArchivedProjects } from "../../constants";

export const DisplaySearchBar = observer(({ isActiveClient, clientStatus }) => {
    const [open, setOpen] = React.useState(false);
    const refSearchInput = React.createRef();
    const debounceTimerRef = useRef(null);

    //Admin should be able to create project as long as there is one active client.
    const hasActiveClients = session.isAdmin && clientList.allActiveClients?.length > 0;

    const canCreateProject = (!session.isAdmin && isActiveClient) || hasActiveClients;

    const search = async () => {
        ProjectList.setPage(1);
        await ProjectList.search();
    };

    const setTerm = async () => {
        const newValue = refSearchInput?.current.value;
        ProjectList.setTerm(newValue);

        // Clear any existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // If the input is empty, search immediately
        if (newValue === "") {
            search();
        } else {
            // Otherwise, set a new debounce timer
            debounceTimerRef.current = setTimeout(async () => {
                search();
            }, 700); //time in milliseconds
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    const onKeyUp = e => {
        if (e.key === "Enter") {
            e.preventDefault(); // Prevent form submission if within a form

            // Clear any existing timer
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
                debounceTimerRef.current = null;
            }

            // Search immediately on Enter
            search();
        }
    };

    const handleRadioChange = input => {
        ProjectList.setStatus(input);
        search();
    };

    // Clean up timer on component unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    return (
        <>
            <Grid container spacing={2}>
                <Grid
                    style={{
                        alignItems: "center",
                        justifyContent: "center",
                        display: "flex",
                    }}
                    size={{ xs: 9, md: 9, lg: 9 }}
                >
                    <TextField
                        id="txtSearch"
                        name="txtSearch"
                        type="search"
                        variant="filled"
                        label="Search"
                        placeholder="Search for project by name or for studies by name or id"
                        margin="normal"
                        fullWidth
                        inputRef={refSearchInput}
                        onKeyUp={onKeyUp}
                        value={ProjectList.term}
                        onChange={setTerm}
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            },
                        }}
                    />
                    <IconButton sx={{ fontSize: 40 }} onClick={search}>
                        <SearchIcon fontSize="inherit" />
                    </IconButton>
                </Grid>
                <Grid
                    style={{
                        alignItems: "center",
                        justifyContent: "flex-end",
                        display: "flex",
                        flexDirection: "row",
                    }}
                    size={{ xs: 3, md: 3, lg: 3 }}
                >
                    <div>
                        <Button
                            size="large"
                            variant="contained"
                            color="primary"
                            aria-controls="simple-menu"
                            aria-haspopup="true"
                            onClick={() => setOpen(true)}
                            disabled={!canCreateProject}
                        >
                            New Project
                        </Button>

                        {!canCreateProject && (
                            <Tooltip
                                title={
                                    <div
                                        style={{
                                            whiteSpace: "pre-wrap",
                                            maxHeight: "500px",
                                            overflow: "auto",
                                        }}
                                    >
                                        {`You cannot create projects, ${clientStatus}`}
                                    </div>
                                }
                                placement="right"
                                aria-label="cannot submit job"
                            >
                                <IconButton color="error" aria-label="Client status" size="large">
                                    <InfoIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                    </div>
                </Grid>
            </Grid>
            {open && <NewProject open={open} handleClose={handleClose} />}
            <Grid container spacing={0} style={{ marginTop: "20px" }}>
                <Radiogroup
                    value={ProjectList.status}
                    handleChange={e => handleRadioChange(e.target.value)}
                    radioOptions={radioOptionsActiveAndArchivedProjects}
                />
            </Grid>
        </>
    );
});
