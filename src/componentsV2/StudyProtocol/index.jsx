import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import StudyProtocolStore from "../../state/store/studyProtocol";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material";
import ProtocolList from "./ProtocolList";
import AddNewProtocol from "./AddNewProtocol";
import SearchBar from "./SearchBar";
import ViewOrEditProtocolDetails from "./ViewOrEditProtocolDetails";
import { OperationTypeEnum } from "../../constants";
import { BasicButton } from "../Common/BasicButton";

const StudyProtocol = observer(() => {
    const protocols = StudyProtocolStore.list;
    const pagination = StudyProtocolStore.page;
    const loading = StudyProtocolStore.loading;

    const [searchState, setSearchState] = useState({
        lastSearchedTerm: "",
        errorText: "",
    });

    const [selectedOperationType, setSelectedOperationType] = useState(OperationTypeEnum.NONE);
    const [selectedProtocol, setSelectedProtocol] = useState(null);
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";

    const fetchProtocols = async (page = 0, size = pagination.size, searchTerm = "") => {
        await StudyProtocolStore.load(page, size, searchTerm);
    };

    useEffect(() => {
        fetchProtocols();
    }, []);

    const handlePageChange = (event, newPage) => {
        fetchProtocols(newPage, pagination.size);
    };

    const handleOnDialogCloseOperations = emittedObj => {
        if (emittedObj?.operationType === OperationTypeEnum.UPDATE) {
            setSelectedProtocol(null);
        }
        setSelectedOperationType(OperationTypeEnum.NONE);
    };

    const performUserClickOperation = async emittedObj => {
        if (!emittedObj?.operationType) return;

        switch (emittedObj.operationType) {
            case OperationTypeEnum.SEARCH:
                await handleSearchOperation(emittedObj);
                break;

            case OperationTypeEnum.DOWNLOAD:
                if (emittedObj.obj?.selectedProtocolObj?.id) {
                    await downloadProtocolFile(emittedObj.obj.selectedProtocolObj);
                }
                break;

            case OperationTypeEnum.ADD:
                setSelectedOperationType(OperationTypeEnum.ADD);
                break;

            case OperationTypeEnum.UPDATE:
                setSelectedOperationType(OperationTypeEnum.UPDATE);
                setSelectedProtocol(emittedObj.obj?.selectedProtocolObj);
                break;

            case OperationTypeEnum.DELETE:
                if (emittedObj.obj?.selectedProtocolObj?.id) {
                    await StudyProtocolStore.delete(emittedObj.obj.selectedProtocolObj.id, true);
                }
                break;

            case OperationTypeEnum.NONE:
            default:
                break;
        }
    };

    const handleSearchOperation = async emittedObj => {
        const searchTerm = emittedObj.obj?.searchTerm?.trim() ?? "";
        if (!searchTerm) {
            setSearchState({ lastSearchedTerm: "", errorText: "" });
            await fetchProtocols(0, pagination.size);
        } else if (searchTerm.toLowerCase() === searchState.lastSearchedTerm.toLowerCase()) {
            setSearchState(prev => ({
                ...prev,
                errorText: "Please modify your search term to search again",
            }));

            setTimeout(() => {
                setSearchState(prev => ({ ...prev, errorText: "" }));
            }, 3000);
        } else {
            setSearchState({ lastSearchedTerm: searchTerm, errorText: "" });
            await fetchProtocols(0, pagination.size, searchTerm);
        }
    };

    const downloadProtocolFile = async selectedProtocolObj => {
        const content = await StudyProtocolStore.download(selectedProtocolObj?.id);
        if (content) {
            const url = window.URL.createObjectURL(content);
            const a = document.createElement("a");
            a.href = url;
            a.download = selectedProtocolObj?.fileName || "protocol.pdf";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        }
    };

    return (
        <Container maxWidth="xl">
            <Box sx={{ my: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" py={2}>
                    <Typography
                        variant="h4"
                        fontWeight={600}
                        letterSpacing="-0.01em"
                        color={theme.palette.grey.contrastText}
                    >
                        Study Protocol Management
                    </Typography>
                    <BasicButton
                        color="primary"
                        size="large"
                        aria-controls="simple-menu"
                        aria-haspopup="true"
                        onClick={() =>
                            performUserClickOperation({
                                operationType: OperationTypeEnum.ADD,
                                obj: null,
                            })
                        }
                        buttonText="Add New Protocol"
                    />
                </Box>

                <Typography
                    variant="h6"
                    fontWeight={400}
                    component="p"
                    color={theme.palette.grey.blackMetal}
                >
                    Upload and manage your study protocols. Protocols define the blueprint for
                    conducting research studies, ensuring consistency and adherence to scientific
                    standards.
                </Typography>

                <Box
                    sx={{
                        my: 3,
                        p: 3,
                        borderRadius: 4,
                        backgroundColor: isDarkMode ? "grey.main" : "grey.light",
                        borderWidth: "1px",
                        borderStyle: "solid",
                        borderColor: isDarkMode ? "grey.light" : "grey.main",
                    }}
                >
                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <SearchBar
                                handleUserClick={performUserClickOperation}
                                errorText={searchState.errorText}
                                lastSearchedTerm={searchState.lastSearchedTerm}
                            />
                            <ProtocolList
                                protocols={protocols}
                                pagination={pagination}
                                onPageChange={handlePageChange}
                                handleUserClick={performUserClickOperation}
                            />
                        </>
                    )}

                    {selectedOperationType === OperationTypeEnum.ADD && (
                        <AddNewProtocol onClose={handleOnDialogCloseOperations} />
                    )}

                    {selectedOperationType === OperationTypeEnum.UPDATE && (
                        <ViewOrEditProtocolDetails
                            selectedProtocol={selectedProtocol}
                            onClose={handleOnDialogCloseOperations}
                        />
                    )}
                </Box>
            </Box>
        </Container>
    );
});

export default StudyProtocol;
