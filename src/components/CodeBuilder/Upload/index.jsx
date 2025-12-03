import React, { useState } from "react";
import { BasicButton, Dropdown } from "../../Common";
import codeBuilderCommonStore from "../../../state/store/codebuilder/common";
import { formatFileSize, useCSVReader } from "react-papaparse";
import { Box, Grid2 as Grid, Typography } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CSVPreviewTable from "../Common/UploadedFilePreviewTable";
import { ShowWarning } from "../../../componentsV2/Common/Toast";

export const Upload = ({
    page,
    uploadedData,
    handleFileUpload,
    handleClear,
    selectedDB,
    setSelectedDB,
}) => {
    let BlankFileErrorToShow =
        "Empty file detected. Please ensure the first column contains at least one code.";
    const { CSVReader } = useCSVReader();
    const [showError, setShowError] = useState(false);

    const SELECT_LABEL = "Select database to upload codes";

    const onFileUpload = results => {
        const hasAnyDataInCSV =
            results.data &&
            Array.isArray(results.data) &&
            results.data.some(row => {
                const firstCell = row && Array.isArray(row) ? row[0] : Object.values(row)[0];
                return firstCell && firstCell.toString().trim() !== "";
            });

        if (!hasAnyDataInCSV) {
            handleClear();
            ShowWarning(BlankFileErrorToShow);
        }
        setShowError(!hasAnyDataInCSV);
        // Always emit this to clear any existing errors or warnings.
        handleFileUpload(results);
    };

    return (
        <div style={{ margin: "10px" }}>
            <Dropdown
                ddLabel={SELECT_LABEL}
                labelName={SELECT_LABEL}
                labelValue={SELECT_LABEL}
                value={selectedDB}
                onChange={event => {
                    setSelectedDB(event.target.value);
                }}
                dropdownOptions={codeBuilderCommonStore.userDatabases}
            ></Dropdown>
            <div style={{ margin: "20px" }} />
            {selectedDB && (
                <CSVReader
                    config={{
                        skipEmptyLines: "greedy",
                    }}
                    onUploadAccepted={results => {
                        onFileUpload(results);
                    }}
                    onDragOver={event => {
                        event.preventDefault();
                    }}
                    onDragLeave={event => {
                        event.preventDefault();
                    }}
                >
                    {({ getRootProps, acceptedFile, ProgressBar, getRemoveFileProps, Remove }) => (
                        <>
                            <div {...getRootProps()}>
                                {acceptedFile && !showError ? (
                                    <Grid container spacing={2}>
                                        <Grid size={12}>
                                            <Box
                                                component="section"
                                                sx={{
                                                    p: 3,
                                                    borderRadius: 2,
                                                    border: "1px solid grey",
                                                    gap: 1,
                                                    "&:hover": {
                                                        bgcolor: "action.hover",
                                                        borderColor: "primary.light",
                                                    },
                                                }}
                                            >
                                                <div>
                                                    <div
                                                        style={{
                                                            maxWidth: "400px",
                                                            margin: "10px",
                                                        }}
                                                    >
                                                        <ProgressBar />
                                                    </div>
                                                    <Grid container>
                                                        <Grid size={10}>
                                                            <Typography
                                                                variant="body1"
                                                                sx={{ mb: 1 }}
                                                            >
                                                                <strong>Uploaded file: </strong>
                                                                {acceptedFile.name} (
                                                                {formatFileSize(acceptedFile.size)})
                                                            </Typography>
                                                        </Grid>
                                                        <Grid size={2}>
                                                            <div {...getRemoveFileProps()}>
                                                                <BasicButton
                                                                    variant="outlined"
                                                                    color="error"
                                                                    size="small"
                                                                    buttonText="remove file"
                                                                    handleClick={handleClear}
                                                                >
                                                                    <Remove color="red" />
                                                                </BasicButton>
                                                            </div>
                                                        </Grid>

                                                        <Grid></Grid>
                                                    </Grid>

                                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                                        <strong>File preview</strong>
                                                    </Typography>
                                                    <CSVPreviewTable
                                                        csvData={uploadedData?.slice(0, 5)}
                                                    ></CSVPreviewTable>
                                                    <Typography variant="caption"></Typography>
                                                </div>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                ) : (
                                    <Box
                                        sx={{
                                            p: 3,
                                            borderRadius: 2,
                                            border: "1px solid grey",
                                            gap: 1,
                                            "&:hover": {
                                                bgcolor: "action.hover",
                                                borderColor: "primary.light",
                                            },
                                        }}
                                    >
                                        <Grid container spacing={1}>
                                            <Grid>
                                                <UploadFileIcon variant={"contained"} />
                                            </Grid>
                                            <Grid size={11}>
                                                <Typography variant="body1" sx={{ mb: 1 }}>
                                                    <strong>
                                                        Upload {page} codes for {selectedDB}
                                                    </strong>
                                                </Typography>
                                            </Grid>
                                            <Grid size={12}>
                                                <Typography variant="body2">
                                                    Click to upload or drag and drop.
                                                    <strong> CSV files only</strong>
                                                </Typography>
                                            </Grid>
                                            <Grid size={12}>
                                                <Typography variant="body2">
                                                    The codes you are uploading should be in the
                                                    <b> first column</b>, all other columns will be
                                                    ignored. Please arrange your{" "}
                                                    <strong>.csv file </strong>
                                                    accordingly.
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                )}
                            </div>
                        </>
                    )}
                </CSVReader>
            )}
            {showError && (
                <Typography color="error" sx={{ mt: 2 }}>
                    {BlankFileErrorToShow}
                </Typography>
            )}
        </div>
    );
};

export default Upload;
