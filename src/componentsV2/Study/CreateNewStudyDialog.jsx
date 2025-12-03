import React from "react";
import { observer } from "mobx-react";
import session from "../../state/store/session";
import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import ProjectList from "../../state/store/projects/list";
import { allActiveClients } from "../../utils";
import { Input } from "../Common/Input.jsx";
import { BasicButton } from "../Common/BasicButton.jsx";
import { DialogBox } from "../Common/DialogBox.jsx";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import { STUDY_TYPES } from "../../constants/index.jsx";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Chip from "@mui/material/Chip";

const CreateNewStudyDialog = observer(({ open, setOpen }) => {
    const [list, setList] = React.useState([]);
    const [selectedProject, setSelectedProject] = React.useState(null);
    const [term, setTerm] = React.useState("");
    const [totalCount, setTotalCount] = React.useState(0);
    const [loadingMore, setLoadingMore] = React.useState(false);
    const [hasMore, setHasMore] = React.useState(true);
    const [isInitialLoad, setIsInitialLoad] = React.useState(false);
    const [isSelectingOption, setIsSelectingOption] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const navigate = useNavigate();

    const fetchProjects = React.useCallback(async (search = "", from = 0, replace = false) => {
        try {
            const { list: newList, count } = await ProjectList.getActiveProjectListForUser(
                search,
                from
            );

            setTotalCount(count || 0);

            if (replace) {
                setList(newList);
                setHasMore(newList.length < (count || 0));
            } else {
                setList(prev => {
                    // Deduplicate by projectID when appending
                    const map = new Map(prev.map(p => [p.projectID, p]));
                    newList.forEach(p => map.set(p.projectID, p));
                    const combined = Array.from(map.values());
                    setHasMore(combined.length < (count || 0));
                    return combined;
                });
            }
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    }, []); // Remove dependencies to prevent unnecessary re-creation

    // Initial load when dialog opens - ONLY ONCE
    React.useEffect(() => {
        if (open && !isInitialLoad) {
            setList([]);
            setSelectedProject(null);
            setTerm("");
            setHasMore(true);
            setIsSelectingOption(false);
            setIsInitialLoad(true);
            fetchProjects("", 0, true);
        } else if (!open) {
            setIsInitialLoad(false);
        }
    }, [open, isInitialLoad, fetchProjects]);

    // Debounced search - ONLY when user actually types (not when selecting)
    React.useEffect(() => {
        if (!open || isSelectingOption || !isInitialLoad) return;

        // Only search if term has actually changed and we're not selecting
        const handle = setTimeout(() => {
            setHasMore(true);
            fetchProjects(term, 0, true);
        }, 700);

        return () => clearTimeout(handle);
    }, [term]); // Only depend on term, not other values

    // Scroll handler with debouncing
    const handleScroll = React.useCallback(
        async event => {
            const listboxNode = event.currentTarget;
            if (!listboxNode) return;

            const { scrollTop, scrollHeight, clientHeight } = listboxNode;
            const threshold = 1;
            const nearBottom = scrollTop + clientHeight >= scrollHeight - threshold;

            if (nearBottom && !loadingMore && hasMore && list.length > 0) {
                setLoadingMore(true);

                try {
                    await fetchProjects(term, list.length, false);
                } catch (error) {
                    console.error("Error loading more projects:", error);
                } finally {
                    setTimeout(() => {
                        setLoadingMore(false);
                    }, 200);
                }
            }
        },
        [loadingMore, hasMore, list.length, term, fetchProjects]
    );

    const handleSave = async () => {
        //TODO: details to be implemented in DXT-651
    };

    const handleFormSubmit = e => {
        e.preventDefault();
        handleSave();
    };

    const noClients = session.isAdmin && allActiveClients?.length === 0;
    const canSave = !noClients;

    const displayErrorMessage = () => {
        return "Cannot create a study without an active project and an active client license.";
    };

    const dialogContent = (
        <Box
            component="form"
            onSubmit={handleFormSubmit}
            sx={{
                px: 1,
                py: 3,
                display: "flex",
                flexDirection: "column",
                gap: 1,
            }}
        >
            <Typography variant="body1">
                Please search and select a project under which the new study will be created.
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ minWidth: 120, textAlign: "left" }}>
                    <strong>Select project</strong>
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Autocomplete
                        value={selectedProject}
                        options={[
                            ...(list || []),
                            // Add info message at the end if there are more items
                            ...(hasMore && list.length > 0
                                ? [
                                      {
                                          isInfoMessage: true,
                                          remainingCount: totalCount - list.length,
                                          totalCount: totalCount,
                                          currentCount: list.length,
                                      },
                                  ]
                                : []),
                        ]}
                        loading={loadingMore}
                        getOptionLabel={option => {
                            if (!option) return "";

                            // Handle info message option
                            if (option.isInfoMessage) {
                                return `Showing ${option.currentCount} of ${option.totalCount} projects (${option.remainingCount} more available)`;
                            }

                            const showClient = !!session.isAdmin;
                            const client = option.clientName || "Unnamed Client";
                            const project = option.projectName || "Unnamed Project";
                            const owner =
                                option.projectOwnerFullName ||
                                option.projectOwnerID ||
                                "Owner unknown";
                            const studyNames =
                                option.studyNames && option.studyNames.length > 0
                                    ? "[" + option.studyNames.join(", ") + " ]"
                                    : "";
                            const parts = [];
                            if (showClient) parts.push(client);
                            parts.push(project);
                            parts.push(owner);
                            if (studyNames) parts.push(studyNames);
                            return parts.join(" — ");
                        }}
                        getOptionDisabled={option => option?.isInfoMessage || false}
                        renderOption={(props, option) => {
                            const { key, ...otherProps } = props;
                            // Custom rendering for info message
                            if (option.isInfoMessage) {
                                return (
                                    <Box
                                        component="li"
                                        key={key}
                                        {...otherProps}
                                        sx={{
                                            ...otherProps.sx,
                                            fontStyle: "italic",
                                            color: "text.secondary",
                                            backgroundColor: "action.hover",
                                            cursor: "default",
                                            fontSize: "0.875rem",
                                            textAlign: "center",
                                            py: 1,
                                            "&:hover": {
                                                backgroundColor: "action.hover",
                                            },
                                        }}
                                    >
                                        Showing {option.currentCount} of {option.totalCount}{" "}
                                        projects ({option.remainingCount} more available - scroll to
                                        load more)
                                    </Box>
                                );
                            }

                            // Default rendering for regular options
                            return (
                                <Stack
                                    spacing={0.5}
                                    component="li"
                                    key={key}
                                    {...otherProps}
                                    justifyItems="space-between"
                                    direction="column"
                                >
                                    {/* Client name badge - only for admins */}
                                    {option.clientName && session.isAdmin && (
                                        <Chip variant="filled" label={option.clientName} />
                                    )}

                                    {/* Project name */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            wordBreak: "break-word",
                                            color: "primary.main",
                                        }}
                                    >
                                        {option.projectName || (
                                            <Box
                                                component="span"
                                                sx={{ color: "text.disabled", fontStyle: "italic" }}
                                            >
                                                Unnamed Project
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Owner info */}
                                    <Box>
                                        <Box component="span" sx={{ opacity: 0.7 }}>
                                            Owner:
                                        </Box>
                                        <Box component="span">
                                            {option.projectOwnerFullName ||
                                                option.projectOwnerID ||
                                                "Unknown"}
                                        </Box>
                                    </Box>

                                    {/* Study names */}
                                    {option.studyNames && option.studyNames.length > 0 && (
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexWrap: "wrap",
                                                gap: 0.5,
                                                mt: 0.5,
                                            }}
                                        >
                                            {option.studyNames.map((study, index) => (
                                                <Chip
                                                    variant="outlined"
                                                    size="small"
                                                    key={index}
                                                    label={study}
                                                    sx={{ borderRadius: 0 }}
                                                />
                                            ))}
                                        </Box>
                                    )}
                                </Stack>
                            );
                        }}
                        isOptionEqualToValue={(option, value) =>
                            option?.projectID === value?.projectID
                        }
                        onChange={(e, newValue) => {
                            setIsSelectingOption(true);
                            setSelectedProject(newValue || null);
                            // Reset the flag after a brief moment
                            setTimeout(() => {
                                setIsSelectingOption(false);
                            }, 100);
                        }}
                        onInputChange={(e, newInput, reason) => {
                            // Only update term when user is actually typing, not when selecting
                            if (reason === "input" && !isSelectingOption) {
                                setTerm(newInput || "");
                            }
                            // Don't update term when reason is 'reset' (option selected) or 'clear'
                        }}
                        slotProps={{
                            listbox: {
                                onScroll: handleScroll,
                                style: { maxHeight: 400 },
                            },
                        }}
                        disabled={noClients}
                        renderInput={params => (
                            <Input
                                {...params}
                                label="Projects"
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        textTransform: "capitalize",
                                    },
                                }}
                            />
                        )}
                        sx={{
                            "& .MuiMenuItem-root": {
                                textTransform: "capitalize",
                            },
                        }}
                    />
                </Box>
            </Box>
            {noClients && (
                <Alert
                    severity="error"
                    sx={{
                        mt: 2,
                        backgroundColor: "transparent",
                    }}
                >
                    {displayErrorMessage()}
                </Alert>
            )}
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
                <BasicButton
                    type="submit"
                    variant="contained"
                    disabled={!canSave || noClients || !selectedProject}
                    sx={{
                        textTransform: "none",
                        px: 3,
                        py: 1,
                        borderRadius: 1.5,
                    }}
                    buttonText="Create"
                    handleClick={event => {
                        setAnchorEl(event.currentTarget);
                    }}
                />
            </Stack>
            {
                //TODO: below code to be optimsed and implemented in DXT-651 its duplicate code
            }
            <Menu
                id="Study design menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={() => {
                    setAnchorEl(null);
                    close();
                }}
            >
                {Object.keys(STUDY_TYPES).map(study => {
                    return (
                        <MenuItem
                            key={study}
                            onClick={() => {
                                navigate("/coming-soon");
                                close();
                            }}
                        >
                            {STUDY_TYPES[study]}
                        </MenuItem>
                    );
                })}
            </Menu>
        </Box>
    );

    const close = () => {
        setOpen(false);
    };

    return (
        <DialogBox
            open={open}
            handleClose={close}
            maxWidth="lg"
            fullWidth
            title={"Create new study"}
            Content={dialogContent}
        />
    );
});

export default CreateNewStudyDialog;
