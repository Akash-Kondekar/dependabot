import React, { useEffect, useRef } from "react";
import { observer } from "mobx-react";
import { Radiogroup } from "../../components/Common/index.js";
import NewProject from "./NewProject.jsx";
import ProjectList from "../../state/store/projects/list";
import clientList from "../../state/store/admin/clients/list";
import { radioOptionsActiveAndArchivedProjects } from "../../constants/index.jsx";
import IconButton from "@mui/material/IconButton";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import InfoIcon from "@mui/icons-material/Info";
import session from "../../state/store/session.js";
import { Input } from "../Common/Input.jsx";
import { BasicButton } from "../Common/BasicButton.jsx";
import Grid from "@mui/material/Grid2";
import InputAdornment from "@mui/material/InputAdornment";
import Tooltip from "@mui/material/Tooltip";

export const ProjectSearchBar = observer(({ isActiveClient, clientStatus }) => {
    const [open, setOpen] = React.useState(false);
    const refSearchInput = React.createRef();
    const debounceTimerRef = useRef(null);

    //Admin should be able to create project as long as there is one active client.
    const hasActiveClients = session.isAdmin && clientList.allActiveClients?.length > 0;

    const canCreateProject = (!session.isAdmin && isActiveClient) || hasActiveClients;

    const search = async () => {
        ProjectList.setPage(1);
        await ProjectList.search();

        // Return focus to search input after search completes
        if (refSearchInput?.current) {
            refSearchInput.current.focus();
        }
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
            <Grid
                container
                spacing={2}
                sx={{
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Grid size={{ xs: 12, md: 9, lg: 9, xl: 10 }}>
                    <Input
                        autoFocus={true}
                        slotProps={{
                            input: {
                                sx: { borderRadius: 4 },
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchOutlinedIcon aria-label="search" />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        id="txtSearch"
                        name="txtSearch"
                        type="search"
                        placeholder="Enter name or ID of a study or a project to search"
                        margin="normal"
                        fullWidth
                        inputRef={refSearchInput}
                        onKeyUp={onKeyUp}
                        value={ProjectList.term}
                        onChange={setTerm}
                    />
                </Grid>
                <Grid>
                    <>
                        <BasicButton
                            color="primary"
                            size="large"
                            aria-controls="simple-menu"
                            aria-haspopup="true"
                            onClick={() => setOpen(true)}
                            disabled={!canCreateProject}
                            buttonText="New Project"
                        />

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
                    </>
                </Grid>
            </Grid>
            {open && <NewProject open={open} handleClose={handleClose} />}
            <Grid container spacing={2} style={{ marginTop: "20px" }}>
                <Radiogroup
                    value={ProjectList.status}
                    handleChange={e => handleRadioChange(e.target.value)}
                    radioOptions={radioOptionsActiveAndArchivedProjects}
                />
            </Grid>
        </>
    );
});
