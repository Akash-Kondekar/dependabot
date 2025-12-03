import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react";

import { Box, Button, Chip, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import MUIDataTable from "mui-datatables";
import drugStore from "../../../../state/store/codebuilder/drugs";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";

import { Search } from "./Search";
import DeleteIcon from "@mui/icons-material/Delete";

import { DisplayAvatar } from "../../../Common";
import session from "../../../../state/store/session";
import { formatDate, getCodeBuilderLibrarySearchQuery, verticalAlign } from "../../../../utils";

import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import CloudDownloadOutlinedIcon from "@mui/icons-material/CloudDownloadOutlined";
import makeStyles from "@mui/styles/makeStyles";
import {
    GetIconForThisCodeStatus,
    PHENOTYPE_NAME_MAX_LENGTH,
    PHENOTYPE_STATE,
    SESSION_EXPIRED,
} from "../../../../constants";

import { drugColumnsForCompareTable } from "../../Drugs/table-data";
import { DisplayDialogue } from "../../Common/DisplayDialogue";
import { PlagiarismOutlined } from "@mui/icons-material";
import { ShowError, ShowSuccess } from "../../../../componentsV2/Common/Toast";
import { Confirm } from "../../../../componentsV2/Common/Confirm";
import Badge from "@mui/material/Badge";
import GradeIcon from "@mui/icons-material/Grade";
import GradeOutlinedIcon from "@mui/icons-material/GradeOutlined";

const useStyles = makeStyles(theme => ({
    paper: {
        marginTop: theme.spacing(5),
        paddingBottom: theme.spacing(2),
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        paddingTop: 0,
        textAlign: "left",
    },
}));

const noData = {
    fontSize: "1.17em",
    fontWeight: "bold",
};

const DOWNLOAD_LIMIT = 30;

const optionsForCompareTable = {
    filter: true,
    filterType: "textField",
    filterArrayFullMatch: false,
    responsive: "vertical",
    rowsPerPage: 50,
    selectableRows: "none",
    print: false,
    enableNestedDataAccess: ".",
    rowsPerPageOptions: [50, 100, 200],
    tableBodyMaxHeight: "300px",
    confirmFilters: true,
    customFilterDialogFooter: (_, applyNewFilters) => {
        return (
            <div style={{ marginTop: "40px" }}>
                <Button variant="contained" onClick={applyNewFilters}>
                    Apply Filters
                </Button>
            </div>
        );
    },
    setTableProps: () => {
        return { size: "small" };
    },

    download: true,
};

const DrugLibrary = observer(() => {
    const navigate = useNavigate();

    const [compareResults, setCompareResults] = React.useState({});
    const [rowsChecked, setRowsChecked] = React.useState([]);

    const optionsForBankTable = {
        filter: true,
        viewColumns: false,
        filterType: "textField",
        responsive: "vertical",
        rowsPerPage: 10,
        download: false,
        delete: false,
        selectableRows: "multiple",
        print: false,
        enableNestedDataAccess: ".",
        rowsPerPageOptions: [10, 20, 100],
        setTableProps: () => {
            return { size: "small" };
        },
        rowsSelected: [...rowsChecked],
        onRowSelectionChange: (_, allRowsSelected, __) => {
            const dataIndexesToAdd = allRowsSelected.map(item => item.dataIndex);
            const selectedDetails = dataIndexesToAdd.map(index => drugStore.libraryCodeList[index]);
            const rows = allRowsSelected.map(row => row.dataIndex);
            setRowsChecked(rows);
            drugStore.setCodeForAction(selectedDetails);
        },
        customToolbarSelect: () => {
            return <CustomToolBar />;
        },
    };

    React.useEffect(() => {
        async function reloadCompare() {
            if (drugStore.codeListsToCompare.length === 2) {
                await drugStore.fetchCodesToCompare();
                const results = drugStore.compareCodesAndGetResults;
                setCompareResults(results);
            }
        }

        reloadCompare();
    }, []);

    const CustomToolBar = observer(() => {
        async function download() {
            const tokenExpired = await session.isTokenExpired();
            if (tokenExpired) {
                await session.logout();
                ShowError(SESSION_EXPIRED);
                return;
            }

            if (drugStore.codeIdToAction?.length < 1) {
                return;
            }
            ShowSuccess("Download initiated successfully.");

            const newTab = window.open("", "_blank");
            const link = document.createElement("a");

            let address = `${import.meta.env.VITE_APP_API_VIP}/dexter/drug/codes/download`;
            address += `?userId=${encodeURIComponent(
                session.loggedInUser
            )}&codeIds=${drugStore.codeIdToAction.join()}&token=${session.bearerToken}`;

            link.href = address;

            link.setAttribute("target", "_blank");
            link.setAttribute("download", "");

            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            // Close the tab after initiating the request.
            setTimeout(() => {
                newTab.close();
            }, 500);
        }

        const canDownload = drugStore.codeForAction?.length <= DOWNLOAD_LIMIT;

        const MAX_LIMIT = 1; //maximum code that can be selected for review

        const canShare =
            drugStore.codeForAction?.length === MAX_LIMIT &&
            drugStore.codeForAction[0]?.status === PHENOTYPE_STATE.DRAFT &&
            (drugStore.codeForAction[0]?.owner === session.loggedInUser || session.isAdmin);

        const GetTooltipContent = () => {
            if (!canShare && drugStore.codeForAction[0]?.status !== PHENOTYPE_STATE.DRAFT) {
                return "Please edit the code in order to re-share";
            }

            if (drugStore.codeForAction?.length > MAX_LIMIT) {
                return "Only one code can be selected for review";
            }

            if (drugStore.codeForAction[0]?.owner !== session.loggedInUser && !session.isAdmin) {
                return "Only owners can share the code";
            }
            return "Request a review for this list";
        };

        return (
            <div style={{ marginRight: "20px" }}>
                <Tooltip
                    title={
                        canDownload
                            ? `Download`
                            : `Upto ${DOWNLOAD_LIMIT} codes can be downloaded. You have selected ${drugStore.codeForAction?.length} codes`
                    }
                >
                    <span>
                        <IconButton onClick={download} disabled={!canDownload}>
                            <CloudDownloadOutlinedIcon
                                color={canDownload ? "primary" : "disabled"}
                            />
                        </IconButton>
                    </span>
                </Tooltip>

                <DisplayDialogue
                    store={drugStore}
                    selectedUserTags={drugStore.codeForAction?.selectedUserTags}
                    richTextContent={drugStore.codeForAction?.richTextContent}
                    title={GetTooltipContent()}
                    canShare={canShare}
                    codeForAction={drugStore.codeForAction}
                    setRowsChecked={setRowsChecked}
                    rowsChecked={rowsChecked}
                />
            </div>
        );
    });

    const viewCode = codeDetails => {
        const selectedIndex = codeDetails.rowIndex;
        const data = codeDetails.currentTableData[selectedIndex];
        const codesArray = data.data;

        const codeToView = {
            id: codesArray[8],
            name: codesArray[0],
            owner: codesArray[9],
            ownerName: codesArray[1],
            createdOn: codesArray[2],
            modifiedOn: codesArray[7],
            modifiedBy: codesArray[6],
            dbNames: codesArray[3],
            tags: codesArray[4],
            status: codesArray[12],
            reviewer: codesArray[13],
            approvedBy: codesArray[10],
            approvedOn: codesArray[11],
            favoritedByUser: codesArray[14],
            favoriteCount: codesArray[15],
        };

        drugStore.setMasterCodeListForView([]); // Reset existing values;
        drugStore.setRichTextContentInLibrary(undefined); // Reset existing values;
        drugStore.setCodeDetailsToView(codeToView);

        navigate("/builder/library/drug/view", { state: { title: "Library" } });
    };

    const commonColumnsToBeHidden = [
        {
            name: "bankCodesSet",
            label: "BankCodesSet",
            options: {
                display: false,
                filter: false,
                filterType: "textField",
            },
        },
        {
            name: "modifiedBy",
            label: "Last modified by",
            options: {
                display: false,
                filter: false,
                filterType: "textField",
            },
        },
        {
            name: "modifiedOn",
            label: "Modified on",
            options: {
                display: false,
                filter: false,
                filterType: "textField",
            },
        },
        {
            name: "id",
            label: "Bank Id",
            options: {
                display: false,
                filter: false,
                filterType: "textField",
            },
        },
        {
            name: "owner",
            label: "Owner Id",
            options: {
                display: false,
                filter: false,
                filterType: "textField",
            },
        },
        {
            name: "approvedBy",
            label: "Approved By",
            options: {
                display: false,
                filter: false,
                filterType: "textField",
            },
        },
        {
            name: "approvedOn",
            label: "Approved On",
            options: {
                display: false,
                filter: false,
                filterType: "textField",
            },
        },
    ];

    const columnsForBankTable = [
        {
            name: "name",
            label: "Name",
            options: {
                filter: true,
                filterType: "textField",
                customBodyRender: value => {
                    const displayName =
                        value?.length > PHENOTYPE_NAME_MAX_LENGTH
                            ? value.substring(0, PHENOTYPE_NAME_MAX_LENGTH) + "..."
                            : value;
                    return (
                        <div>
                            <Tooltip title={value}>
                                <div>{displayName}</div>
                            </Tooltip>
                        </div>
                    );
                },
            },
        },
        {
            name: "ownerName",
            label: "Created By",
            options: {
                filter: true,
                filterType: "textField",
                customBodyRender: value => {
                    return (
                        <Tooltip title={value}>
                            <div style={{ display: "flex", justifyContent: "start" }}>
                                <DisplayAvatar
                                    value={value}
                                    randomColor={true}
                                    size="small"
                                    fontSize="0.75rem"
                                />
                            </div>
                        </Tooltip>
                    );
                },
            },
        },
        {
            name: "createdOn",
            label: "Created On",
            options: {
                filter: true,
                customBodyRenderLite: dataIndex => {
                    const value =
                        drugStore?.libraryCodeList?.length > dataIndex &&
                        drugStore?.libraryCodeList?.[dataIndex] &&
                        drugStore.libraryCodeList[dataIndex].createdOn;

                    return <div>{value && formatDate(value)}</div>;
                },
                //
            },
        },
        {
            name: "dbNames",
            label: "Database",
            options: {
                filter: true,
                filterType: "multiselect",
                customBodyRenderLite: dataIndex => {
                    const value =
                        drugStore.libraryCodeList?.length > dataIndex &&
                        drugStore.libraryCodeList?.[dataIndex] &&
                        drugStore.libraryCodeList[dataIndex].dbNames;
                    const tooltipValue = verticalAlign(value);
                    return (
                        <Tooltip
                            title={<div style={{ whiteSpace: "pre-line" }}>{tooltipValue}</div>}
                        >
                            <div>
                                {value &&
                                    value.map(val => {
                                        return (
                                            <Chip
                                                key={val}
                                                style={{ margin: "1px" }}
                                                size="small"
                                                label={val}
                                            />
                                        );
                                    })}
                            </div>
                        </Tooltip>
                    );
                },
            },
        },
        {
            name: "tags",
            label: "Tags",
            options: {
                filter: true,
                filterType: "textField",
                customBodyRenderLite: dataIndex => {
                    const value =
                        drugStore.libraryCodeList?.length > dataIndex &&
                        drugStore.libraryCodeList?.[dataIndex] &&
                        drugStore.libraryCodeList[dataIndex].tags;
                    const tooltipValue = verticalAlign(value);
                    return (
                        <Tooltip
                            title={<div style={{ whiteSpace: "pre-line" }}>{tooltipValue}</div>}
                        >
                            <div>
                                {value &&
                                    value.map(val => {
                                        return (
                                            <Chip
                                                key={val}
                                                style={{ margin: "1px" }}
                                                size="small"
                                                label={val}
                                            />
                                        );
                                    })}
                            </div>
                        </Tooltip>
                    );
                },
            },
        },
        ...commonColumnsToBeHidden,
        {
            name: "status",
            label: "Status",
            options: {
                filterType: "dropdown",
                customBodyRender: value => {
                    return <GetIconForThisCodeStatus status={value} />;
                },
            },
        },
        {
            name: "reviewer",
            label: "Reviewer",
            options: {
                display: false,
                filter: false,
            },
        },
        {
            name: "favoritedByUser",
            label: "Favorited By User",
            options: {
                display: false,
                filter: false,
                filterType: "textField",
            },
        },
        {
            name: "favoriteCount",
            label: "Favorite count",
            options: {
                display: false,
                filter: false,
                filterType: "textField",
            },
        },
        {
            name: "Actions",
            options: {
                filter: false,
                display: rowsChecked.length <= 0,
                sort: false,
                empty: true,
                customBodyRender: (_, tableMeta, __) => {
                    const codeOwner = tableMeta.rowData[9].toLowerCase();
                    // tableMeta.rowData[9] holds the user who created the code.
                    const canDelete = session.isAdmin || codeOwner === session.loggedInUser;
                    const canAddToCompare = drugStore.codeListsToCompare.length < 2;
                    const favoritedByUser = tableMeta.rowData[14];
                    const favoriteCount = tableMeta.rowData[15];

                    async function compareCodes() {
                        await drugStore.fetchCodesToCompare();
                        const results = drugStore.compareCodesAndGetResults;
                        setCompareResults(results);
                    }

                    return (
                        <div>
                            <Tooltip
                                title={
                                    favoritedByUser ? `Remove from Favorites` : `Add to Favorites`
                                }
                            >
                                <IconButton
                                    disabled={drugStore.loading === true}
                                    aria-label={
                                        favoritedByUser
                                            ? `Remove from Favorites`
                                            : `Add to Favorites`
                                    }
                                    onClick={async () => {
                                        const data = tableMeta.currentTableData[tableMeta.rowIndex];
                                        const id = data.data[8]; //id
                                        drugStore.favoriteCode(id);
                                    }}
                                >
                                    <Badge badgeContent={favoriteCount}>
                                        {favoritedByUser ? (
                                            <GradeIcon sx={{ color: "darkorange" }} />
                                        ) : (
                                            <GradeOutlinedIcon color="secondary" />
                                        )}
                                    </Badge>
                                </IconButton>
                            </Tooltip>
                            <IconButton
                                onClick={() => {
                                    const data = tableMeta.currentTableData[tableMeta.rowIndex];
                                    const codesArray = data.data;
                                    const codeToCompare = {
                                        id: codesArray[8],
                                        name: codesArray[0],
                                        owner: codesArray[9],
                                    };
                                    drugStore.addToCodeListsToCompare(codeToCompare);
                                    const tempList = drugStore.libraryCodeList;
                                    drugStore.setLibraryCodeList([]);
                                    drugStore.setLibraryCodeList(tempList);
                                    if (drugStore.codeListsToCompare.length === 2) {
                                        compareCodes();
                                    }
                                }}
                                disabled={!canAddToCompare}
                            >
                                <Tooltip title={`Add to compare`}>
                                    <span>
                                        <CompareArrowsIcon
                                            color={canAddToCompare ? "secondary" : "disabled"}
                                        />
                                    </span>
                                </Tooltip>
                            </IconButton>
                            <IconButton
                                onClick={() => {
                                    viewCode(tableMeta);
                                }}
                            >
                                <Tooltip title="View" aria-label="View">
                                    <VisibilityIcon color="secondary" fontSize="small" />
                                </Tooltip>
                            </IconButton>
                            <IconButton
                                onClick={async () => {
                                    const status = tableMeta.rowData[12];
                                    let confirmationMsg = `This will overwrite your workspace with details from ${tableMeta.rowData[0]}. Continue?`;
                                    if (
                                        status === PHENOTYPE_STATE.PUBLIC_RELEASE ||
                                        status === PHENOTYPE_STATE.APPROVED
                                    ) {
                                        confirmationMsg = `This will overwrite your workspace with details from ${tableMeta.rowData[0]}. It will also reset status back to draft. Continue?`;
                                    }

                                    const { isConfirmed } = await Confirm(
                                        `Edit ${tableMeta.rowData[0]}`,
                                        confirmationMsg
                                    );
                                    if (isConfirmed) {
                                        drugStore.setCodeDetailsToEdit(
                                            tableMeta.rowData[0],
                                            tableMeta.rowData[8]
                                        );
                                        navigate("/builder/drugs", { state: { title: "Drugs" } });
                                    }
                                }}
                            >
                                <Tooltip title="Edit" aria-label="Edit">
                                    <EditIcon color="secondary" fontSize="small" />
                                </Tooltip>
                            </IconButton>

                            <IconButton
                                disabled={!canDelete}
                                onClick={async () => {
                                    const { isConfirmed } = await Confirm(
                                        "Confirm",
                                        "Are you sure you want to remove this?"
                                    );

                                    if (isConfirmed) {
                                        await drugStore.delete(tableMeta.rowData[8]);
                                    }
                                }}
                            >
                                <Tooltip title="Delete" aria-label="Delete">
                                    <DeleteIcon
                                        color={canDelete ? "secondary" : "disabled"}
                                        fontSize="small"
                                    />
                                </Tooltip>
                            </IconButton>
                        </div>
                    );
                },
            },
        },
    ];

    const [showCodesToReviewTable, setShowCodesToReviewTable] = useState(false);
    const resultRef = useRef(null);

    React.useEffect(() => {
        async function fetchUserRecords() {
            // await drugStore.loadUsersRecords();
            if (!drugStore.query) {
                await drugStore.loadUsersRecords();
            } else {
                const keyword = drugStore.query?.keyword ?? "";
                const codeName = drugStore.query?.codeName ?? "";
                const userId = drugStore.query?.userId ?? "";
                const favoriteOnly = drugStore.query?.favoriteOnly ?? "";

                const query = getCodeBuilderLibrarySearchQuery(
                    codeName,
                    keyword,
                    userId,
                    favoriteOnly ? session.loggedInUser : ""
                );
                await drugStore.searchDrugBank(query);
            }
        }

        fetchUserRecords();
    }, []);

    return (
        <>
            <div>
                <Search
                    clearSelection={() => {
                        setRowsChecked([]);
                    }}
                />
            </div>
            <div style={{ margin: "15px" }}>
                {showCodesToReviewTable && (
                    <Chip
                        icon={<PlagiarismOutlined />}
                        label="Pending code review, click to view"
                        variant="outlined"
                        color="warning"
                        onClick={() => {
                            resultRef.current?.scrollIntoView({ behavior: "smooth" });

                            // Trigger the highlight after a short delay
                            setTimeout(() => {
                                if (resultRef.current && resultRef.current.highlight) {
                                    resultRef.current.highlight();
                                }
                            }, 500);
                        }}
                    />
                )}
            </div>
            <div>
                <Results
                    columnsForBankTable={columnsForBankTable}
                    optionsForBankTable={optionsForBankTable}
                    compareResults={compareResults}
                    setCompareResults={setCompareResults}
                />
            </div>
            <br />
            <div>
                <CodesUnderReview
                    commonColumnsToBeHidden={commonColumnsToBeHidden}
                    showMessage={setShowCodesToReviewTable}
                    resultRef={resultRef}
                />
            </div>
        </>
    );
});

const NoResults = observer(({ message }) => <span style={noData}> {message}</span>);

const Results = observer(
    ({ columnsForBankTable, optionsForBankTable, compareResults, setCompareResults }) => {
        const { common, uniqueInCode1, uniqueInCode2 } = compareResults;
        const code1 =
            drugStore?.codeListsToCompare?.length > 0 && drugStore.codeListsToCompare?.[0]?.name; // Get from compareList instead
        const code2 =
            drugStore?.codeListsToCompare?.length > 1 && drugStore.codeListsToCompare?.[1]?.name;

        const classes = useStyles();

        return (
            <>
                <MUIDataTable
                    columns={columnsForBankTable}
                    data={drugStore.libraryCodeList?.slice()}
                    options={optionsForBankTable}
                />
                <Paper
                    className={classes.paper}
                    elevation={4}
                    sx={{ display: code1 ? "block" : "none", padding: "10px" }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginY: "10px",
                        }}
                    >
                        <Typography variant="h6" sx={{ marginY: "10px" }}>
                            {"Comparison Results for "}
                            <Chip
                                label={code1}
                                variant="outlined"
                                onDelete={() => {
                                    const codeList = drugStore.codeListsToCompare;
                                    codeList?.shift();
                                    drugStore.setCodeListsToCompare(codeList);
                                    setCompareResults([]);
                                }}
                            />
                            {" and "}
                            <Typography
                                fontStyle="italic"
                                sx={{ display: code2 ? "none" : "inline" }}
                            >
                                {"(please select another code list for comparison)"}
                            </Typography>
                            <Chip
                                label={code2}
                                variant="outlined"
                                sx={{ display: code2 ? "inline-flex" : "none" }}
                                onDelete={() => {
                                    const codeList = drugStore.codeListsToCompare;
                                    codeList?.pop();
                                    drugStore.setCodeListsToCompare(codeList);
                                    setCompareResults([]);
                                }}
                            />
                        </Typography>

                        <Tooltip title="Clear All" aria-label="Clear All" sx={{ marginY: "10px" }}>
                            <ClearAllIcon
                                onClick={() => {
                                    setCompareResults([]);
                                    drugStore.removeCodeListsToCompare();
                                }}
                            />
                        </Tooltip>
                    </Box>
                    <Box
                        sx={{
                            display:
                                common?.length > 0 ||
                                uniqueInCode1?.length > 0 ||
                                uniqueInCode2?.length > 0
                                    ? "block"
                                    : "none",
                        }}
                    >
                        <Box sx={{ marginY: "10px" }}>
                            {common?.length > 0 ? (
                                <MUIDataTable
                                    title={
                                        <Typography variant="h6">
                                            {common.length} Common Code(s) between {code1} & {code2}
                                        </Typography>
                                    }
                                    columns={drugColumnsForCompareTable}
                                    data={common}
                                    options={optionsForCompareTable}
                                />
                            ) : (
                                <NoResults
                                    message={`No common code found between ${code1} & ${code2}`}
                                />
                            )}
                        </Box>
                        <Box sx={{ marginY: "10px" }}>
                            {uniqueInCode1?.length > 0 ? (
                                <MUIDataTable
                                    title={
                                        <Typography variant="h6">
                                            {uniqueInCode1.length} Unique Code(s) in {code1}
                                        </Typography>
                                    }
                                    columns={drugColumnsForCompareTable}
                                    data={uniqueInCode1}
                                    options={optionsForCompareTable}
                                />
                            ) : (
                                <NoResults message={`No Unique code in ${code1}`} />
                            )}
                        </Box>
                        <Box sx={{ marginY: "10px" }}>
                            {uniqueInCode2?.length > 0 ? (
                                <MUIDataTable
                                    title={
                                        <Typography variant="h6">
                                            {uniqueInCode2.length} Unique Code(s) in {code2}
                                        </Typography>
                                    }
                                    columns={drugColumnsForCompareTable}
                                    data={uniqueInCode2}
                                    options={optionsForCompareTable}
                                />
                            ) : (
                                <NoResults message={`No Unique code in ${code2}`} />
                            )}
                        </Box>
                    </Box>
                </Paper>
            </>
        );
    }
);

const CodesUnderReview = observer(({ commonColumnsToBeHidden, showMessage, resultRef }) => {
    const [isHighlighted, setIsHighlighted] = useState(false);
    const navigate = useNavigate();
    const libraryCodeForReview = drugStore.libraryCodeList
        ?.slice()
        ?.filter(
            code =>
                code.status === PHENOTYPE_STATE.UNDER_REVIEW &&
                code.reviewer === session.loggedInUser
        );
    const hasCodesToReview = libraryCodeForReview?.length > 0;

    // function called when the scroll happens
    const highlightResult = () => {
        setIsHighlighted(true);
        // Reset the highlight after animation completes
        setTimeout(() => {
            setIsHighlighted(false);
        }, 500); // Duration slightly longer than animation
    };

    useEffect(() => {
        showMessage(hasCodesToReview);
    }, [hasCodesToReview]);

    useEffect(() => {
        if (resultRef.current) {
            resultRef.current.highlight = highlightResult;
        }
    }, [resultRef]);

    const optionsForReviewTable = {
        filter: true,
        viewColumns: false,
        filterArrayFullMatch: false,
        filterType: "textField",
        responsive: "vertical",
        rowsPerPage: 10,
        download: false,
        delete: false,
        selectableRows: "none",
        print: false,
        enableNestedDataAccess: ".",
        rowsPerPageOptions: [10, 20, 100],
        setTableProps: () => {
            return { size: "small" };
        },
    };

    const viewCodeToBeReviewed = codeDetails => {
        const selectedIndex = codeDetails.rowIndex;
        const data = codeDetails.currentTableData[selectedIndex];
        const codesArray = data.data;

        let code = [];

        if (codesArray.length >= 7) {
            code = drugStore.libraryCodeList.filter(item => item.id === codesArray[7]);
        }

        const tags = code[0]?.tags ?? [];

        const codeToView = {
            id: codesArray[7],
            name: codesArray[0],
            owner: codesArray[8],
            ownerName: codesArray[12],
            createdOn: codesArray[2],
            modifiedOn: codesArray[6],
            modifiedBy: codesArray[5],
            dbNames: codesArray[3],
            tags,
            status: codesArray[11],
            reviewer: codesArray[1],
            approvedBy: codesArray[9],
            approvedOn: codesArray[10],
            favoritedByUser: codesArray[14],
            favoriteCount: codesArray[15],
        };

        drugStore.setMasterCodeListForView([]); // Reset existing values;
        drugStore.setRichTextContentInLibrary(""); // Reset existing values;
        drugStore.setCodeDetailsToView(codeToView);

        navigate("/builder/library/drug/view", { state: { title: "Library" } });
    };

    const columnsForReviewTable = [
        {
            name: "name",
            label: "Name",
            options: {
                filter: true,
                filterType: "textField",
                customBodyRender: value => {
                    const displayName =
                        value?.length > PHENOTYPE_NAME_MAX_LENGTH
                            ? value.substring(0, PHENOTYPE_NAME_MAX_LENGTH) + "..."
                            : value;
                    return (
                        <div>
                            <Tooltip title={value}>
                                <div>{displayName}</div>
                            </Tooltip>
                        </div>
                    );
                },
            },
        },
        {
            name: "reviewer",
            label: "Reviewer",
            options: {
                filter: true,
                filterType: "textField",
                customBodyRenderLite: dataIndex => {
                    const reviewer =
                        libraryCodeForReview?.length > dataIndex &&
                        libraryCodeForReview?.[dataIndex] &&
                        libraryCodeForReview[dataIndex].reviewer;
                    return (
                        <Tooltip title={reviewer} placement="bottom" aria-label="reviewer">
                            <span>
                                {reviewer && (
                                    <DisplayAvatar
                                        value={reviewer}
                                        randomColor={true}
                                        size="small"
                                        fontSize="0.75rem"
                                    />
                                )}
                            </span>
                        </Tooltip>
                    );
                },
            },
        },
        {
            name: "createdOn",
            label: "Created On",
            options: {
                filter: true,
                filterType: "textField",
                customBodyRenderLite: dataIndex => {
                    const value =
                        libraryCodeForReview?.length > dataIndex &&
                        libraryCodeForReview?.[dataIndex] &&
                        libraryCodeForReview[dataIndex].createdOn;

                    return <div>{value && formatDate(value)}</div>;
                },
                //
            },
        },
        {
            name: "dbNames",
            label: "Database",
            options: {
                filter: true,
                filterType: "multiselect",
                customBodyRenderLite: dataIndex => {
                    const value =
                        libraryCodeForReview?.length > dataIndex &&
                        libraryCodeForReview?.[dataIndex] &&
                        libraryCodeForReview[dataIndex].dbNames;

                    return (
                        <Tooltip title={value?.toString()}>
                            <div>
                                {value &&
                                    value.map(val => {
                                        return (
                                            <Chip
                                                key={val}
                                                style={{ margin: "1px" }}
                                                size="small"
                                                label={val}
                                            />
                                        );
                                    })}
                            </div>
                        </Tooltip>
                    );
                },
            },
        },
        ...commonColumnsToBeHidden,
        {
            name: "status",
            label: "Status",
            options: {
                filterType: "dropdown",
                customBodyRender: value => {
                    return <GetIconForThisCodeStatus status={value} />;
                },
            },
        },
        {
            name: "ownerName",
            label: "Created By",
            options: {
                display: false,
                filter: false,
            },
        },
        {
            name: "Actions",
            options: {
                filter: false,
                sort: false,
                empty: true,
                customBodyRender: (_, tableMeta, __) => {
                    return (
                        <div>
                            <IconButton
                                onClick={() => {
                                    viewCodeToBeReviewed(tableMeta);
                                }}
                            >
                                <Tooltip title="View" aria-label="View">
                                    <VisibilityIcon color="secondary" fontSize="small" />
                                </Tooltip>
                            </IconButton>
                        </div>
                    );
                },
            },
        },
    ];
    return (
        <div ref={resultRef} className={isHighlighted ? "highlight-animation" : ""}>
            {hasCodesToReview && (
                <MUIDataTable
                    title="Codes For Your Review"
                    columns={columnsForReviewTable}
                    data={libraryCodeForReview}
                    options={optionsForReviewTable}
                />
            )}
        </div>
    );
});

export default DrugLibrary;
