import {
    Paper,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Tooltip,
    IconButton,
} from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { useTheme } from "@mui/styles";
import React, { useEffect, useMemo } from "react";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import userStore from "../../state/store/user";
import { useDocument } from "../../Services/useDocument";
import RichTextDocumentationEditor from "../CodeBuilder/Common/RichTextDocumentationEditor";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";

const GetDocument = ({ id }) => {
    const results = useDocument(id, true);

    const data = results?.response?.data?.richText;

    return (
        <RichTextDocumentationEditor
            readOnly={true}
            richTextContent={data}
            updateContent={() => {}}
        />
    );
};

export const MyDatabases = () => {
    const [databaseDetails, setDatabaseDetails] = React.useState([]);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [selectedDatabaseDetails, setSelectedDatabaseDetails] = React.useState(null);
    const theme = useTheme();

    useEffect(() => {
        const getDBDetails = async () => {
            await userStore.getDatabaseDetails();
            setDatabaseDetails(userStore.databaseDetails);
        };
        getDBDetails();
    }, []);

    const columns = useMemo(
        () => [
            { accessorKey: "name", header: "Database Name" },
            { accessorKey: "version", header: "Version" },
            {
                accessorFn: row => (row.submission ? "Yes" : "No"),
                id: "submission",
                header: "Allow Study Submission",
            },
            {
                accessorFn: row => (row.extraction ? "Yes" : "No"),
                id: "extraction",
                header: "Allow Data Extraction",
            },
            { accessorKey: "enddt", header: "Expiry Date" },
            {
                accessorFn: row => row,
                id: "document",
                header: "Document",
                Cell: ({ cell }) => (
                    <Tooltip
                        title={
                            cell.getValue()?.document
                                ? "Click to open documentation"
                                : "Documentation not available at the moment"
                        }
                    >
                        <div>
                            {!cell.getValue()?.document}
                            <IconButton
                                disabled={!cell.getValue()?.document}
                                onClick={() => {
                                    setDialogOpen(true);
                                    setSelectedDatabaseDetails(cell.getValue());
                                }}
                                size="medium"
                            >
                                <DescriptionOutlinedIcon fontSize="medium" />
                            </IconButton>
                        </div>
                    </Tooltip>
                ),
            },
        ],
        []
    );

    const table = useMaterialReactTable({
        columns,
        data: databaseDetails,
        enableColumnActions: false,
        enableColumnFilters: false,
        enableColumnOrdering: false,
        enableGlobalFilter: true,
        columnFilterDisplayMode: "popover",
        enableDensityToggle: false,
        enableFullScreenToggle: false,
    });

    return (
        <div style={{ margin: "20px", padding: "20px" }}>
            <Paper elevation={2} style={{ padding: "20px" }}>
                <Typography component="div">
                    <div
                        className={
                            theme.palette.mode === "dark"
                                ? "markdown-body-dark"
                                : "markdown-body-light"
                        }
                    >
                        <ReactMarkdown remarkPlugins={[[remarkGfm, { singleTilde: false }]]}>
                            {"# My Databases"}
                        </ReactMarkdown>
                    </div>
                </Typography>
                <div style={{ margin: "10px 0 0 0" }}>
                    {!databaseDetails?.length > 0 && (
                        <Typography component="div">No Data Available</Typography>
                    )}
                    {databaseDetails?.length > 0 && <MaterialReactTable table={table} />}
                    <Dialog open={dialogOpen} maxWidth="lg" fullWidth>
                        <DialogTitle>Documentation for {selectedDatabaseDetails?.name}</DialogTitle>
                        <DialogContent>
                            <GetDocument id={selectedDatabaseDetails?.document?.id} />
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={() => {
                                    setDialogOpen(false);
                                }}
                            >
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </Paper>
        </div>
    );
};
