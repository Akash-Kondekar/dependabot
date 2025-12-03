import React, { useState } from "react";
import {
    Box,
    CircularProgress,
    Container,
    IconButton,
    InputAdornment,
    Paper,
    Tab,
    Tabs,
    Typography,
} from "@mui/material";
import ProtocolList from "./ProtocolList";
import AddProtocol from "./AddProtocol";
import { Search } from "@mui/icons-material";
import { Input } from "../Common";

const ProtocolManagement = ({
    protocols,
    pagination,
    tabValue,
    setTabValue,
    handleSearch,
    searchTerm,
    setSearchTerm,
    lastSearchedTerm,
    unchangedSearchAttempt,
    setUnchangedSearchAttempt,
    handlePageChange,
    loading,
    handleDeleteProtocol,
    handleUpdateProtocol,
    detailsDialog,
    setDetailsDialog,
}) => {
    const [editMode, setEditMode] = useState({ title: false, description: false });
    const [editValues, setEditValues] = useState({ title: "", description: "" });
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleAddProtocol = () => {
        setTabValue(0); // Switch to view protocols tab
    };

    const onKeyUp = event => {
        if (event.key === "Enter") {
            if (event.target.value !== "" && event.target.value !== lastSearchedTerm) {
                handleSearch(event);
            } else {
                setUnchangedSearchAttempt(true);
                setTimeout(() => setUnchangedSearchAttempt(false), 3000);
            }
        } else if (event.target.value === "" && lastSearchedTerm !== "") {
            handleSearch(event);
        }
    };

    const handleSave = async () => {
        if (detailsDialog.protocol) {
            const protocolToUpdate = {
                ...detailsDialog.protocol,
                title: editValues["title"],
                description: editValues["description"],
            };

            handleUpdateProtocol(protocolToUpdate);

            setDetailsDialog({
                open: true,
                protocol: protocolToUpdate,
            });

            // Exit edit mode
            setEditMode({ title: false, description: false });
        }
    };

    return (
        <Container maxWidth="xl">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Study Protocol Management
                </Typography>
                <Typography variant="body1" color="text.secondary" component="p">
                    Upload and manage your study protocols. Protocols define the blueprint for
                    conducting research studies, ensuring consistency and adherence to scientific
                    standards.
                </Typography>

                <Paper sx={{ mt: 3 }}>
                    <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
                        <Tab label="View Protocols" />
                        <Tab label="Add New Protocol" />
                    </Tabs>
                    <Box sx={{ p: 3 }}>
                        {loading && (
                            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                                <CircularProgress />
                            </Box>
                        )}

                        {!loading && tabValue === 0 && (
                            <>
                                <Input
                                    variant="outlined"
                                    label="Search protocols by title"
                                    fullWidth
                                    required
                                    value={searchTerm}
                                    error={unchangedSearchAttempt}
                                    helperText={
                                        unchangedSearchAttempt
                                            ? "Please modify your search term to search again"
                                            : ""
                                    }
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    color={
                                                        unchangedSearchAttempt ? "error" : "primary"
                                                    }
                                                    disabled={!searchTerm}
                                                    sx={{ fontSize: 40 }}
                                                    onClick={e => {
                                                        handleSearch(e);
                                                    }}
                                                    edge="end"
                                                >
                                                    <Search fontSize="inherit" />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    onKeyUp={onKeyUp}
                                    onChange={e => {
                                        setSearchTerm(e.target.value);
                                        // Clear the warning as soon as they start typing
                                        if (unchangedSearchAttempt) {
                                            setUnchangedSearchAttempt(false);
                                        }
                                    }}
                                />
                                <ProtocolList
                                    protocols={protocols}
                                    pagination={pagination}
                                    onPageChange={handlePageChange}
                                    onDelete={handleDeleteProtocol}
                                    detailsDialog={detailsDialog}
                                    setDetailsDialog={setDetailsDialog}
                                    editMode={editMode}
                                    setEditMode={setEditMode}
                                    editValues={editValues}
                                    setEditValues={setEditValues}
                                    handleSave={handleSave}
                                />
                            </>
                        )}

                        {tabValue === 1 && <AddProtocol onSuccess={handleAddProtocol} />}
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};
export default ProtocolManagement;
