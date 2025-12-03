import React from "react";
import { observer } from "mobx-react";
import { BasicButton, DisplayAvatar, ShowSuccess } from "../Common";
import makeStyles from "@mui/styles/makeStyles";
import { Button, Chip, Grid2 as Grid, IconButton, Tooltip } from "@mui/material";
import { useAddCodes } from "../../Services/useAddCodes";
import Alert from "@mui/material/Alert";
import events from "../../lib/events";
import { InfoOutlined, TextSnippetOutlined } from "@mui/icons-material";
import MUIDataTable from "mui-datatables";
import {
    AHD_BEAN_LIST_LABEL,
    CLINICAL_CODELIST_MEDICAL_LABEL,
    CLINICAL_CODELIST_THERAPY_LABEL,
    CODE_BUILDER_TYPE,
    GetIconForThisCodeStatus,
    MUIDataTableOptionForAddCode,
} from "../../constants";
import { createCodeObject, formatDate, pluralize } from "../../utils";
import studyDatabase from "../../state/store/study/database";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { TabPanel } from "../Common/TabPanel";

import Grow from "@mui/material/Grow";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import RichTextDocumentationEditor from "../CodeBuilder/Common/RichTextDocumentationEditor";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import { useDocument } from "../../Services/useDocument";
import Typography from "@mui/material/Typography";
import _ from "lodash";
import Badge from "@mui/material/Badge";
import GradeIcon from "@mui/icons-material/Grade";
import GradeOutlinedIcon from "@mui/icons-material/GradeOutlined"; //#region

//#region
const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
        width: "100%",
        //backgroundColor: theme.palette.background.paper,
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 200,
    },
    button: {
        marginRight: theme.spacing(1),
    },
    main: {
        display: "flex",
        flex: "1 0 auto",
        alignItems: "center",
    },
    searchIcon: {
        color: theme.palette.text.secondary,
        marginRight: "8px",
    },
    searchText: {
        flex: "0.8 0",
    },
    clearIcon: {
        "&:hover": {
            color: theme.palette.error.main,
        },
    },
}));

const ACTIVE_TAB = 0;
const MAX_ROWS = 250;

function a11yProps(index) {
    return {
        id: `scrollable-force-tab-${index}`,
        "aria-controls": `scrollable-force-tabpanel-${index}`,
    };
}

const CODES_BEAN_LIST_TYPE = {
    MEDICAL: CLINICAL_CODELIST_MEDICAL_LABEL,
    DRUG: CLINICAL_CODELIST_THERAPY_LABEL,
    AHD: AHD_BEAN_LIST_LABEL,
};

const processCodes = (results, type) => {
    if (type === CODES_BEAN_LIST_TYPE.AHD) {
        const need = createCodeObject();

        return Object.keys(need)
            .filter(key => results.data[type][0][key] === true)
            .map(e => e + "-" + results.data[type][0][need[e]])
            .join("\n");
    } else {
        return Object.keys(results?.data[type][0]?.codes)
            .map(key => `${key} : ${results.data[type][0]?.codes[key]}`)
            .join("\n");
    }
};

const GetCodes = ({ rowData, type }) => {
    const [show, setShow] = React.useState(false);

    const label = type === AHD_BEAN_LIST_LABEL ? rowData.ahdCode : rowData.id;
    let code = "ahd";
    if (type?.indexOf(CLINICAL_CODELIST_MEDICAL_LABEL) !== -1) {
        code = "medical";
    }
    if (type?.indexOf(CLINICAL_CODELIST_THERAPY_LABEL) !== -1) {
        code = "drug";
    }

    const { results } = useAddCodes(label, code, show);

    const tip = results !== undefined ? processCodes(results, type) : "";

    return (
        <div>
            <Tooltip
                title={
                    results ? (
                        <div
                            style={{
                                whiteSpace: "pre-wrap",
                                maxHeight: "500px",
                                overflow: "auto",
                            }}
                        >
                            {tip}
                        </div>
                    ) : (
                        "Loading.."
                    )
                }
                placement="right"
                aria-label="list of Medical codes"
            >
                <InfoOutlined
                    onMouseEnter={() =>
                        setTimeout(() => {
                            setShow(true);
                        }, 500)
                    }
                    onMouseLeave={() => setShow(true)}
                    sx={{ verticalAlign: "middle" }}
                    // TODO: On Mouse leave, cancel the previous API Call if possible.
                />
            </Tooltip>
        </div>
    );
};

const GetDocument = ({ id }) => {
    const [show, setShow] = React.useState(false);

    const results = useDocument(id, show);

    const data =
        results && results?.response !== undefined ? results?.response?.data?.richText : "";

    // Don't render anything if there's no document ID or no data
    if (!id || id === 0) {
        return null;
    }

    return (
        <>
            <Tooltip
                title={
                    <div
                        style={{
                            whiteSpace: "pre-wrap",
                            maxHeight: "500px",
                            overflow: "auto",
                        }}
                    >
                        <RichTextDocumentationEditor
                            readOnly={true}
                            richTextContent={data}
                            updateContent={() => {}}
                        />
                    </div>
                }
                placement="bottom"
                aria-label="documentation"
            >
                <TextSnippetOutlined
                    size="medium"
                    sx={{ verticalAlign: "middle", marginRight: "5px" }}
                    onMouseEnter={() =>
                        setTimeout(() => {
                            setShow(true);
                        }, 500)
                    }
                    onMouseLeave={() => setShow(false)} // Fixed: should be false, not true
                />
            </Tooltip>
        </>
    );
};

export const ahdCodesColumns = [
    {
        label: "Description",
        name: "label",
        options: {
            filter: false,
            sort: false,
        },
    },
    { label: "AHD Code", name: "ahdCode" },
    {
        label: "Data Description",
        name: "description",
        options: {
            filter: false,
            sort: false,
            customBodyRender: (__, tableMeta, _) => {
                const rowData =
                    tableMeta.tableData[tableMeta.currentTableData[tableMeta.rowIndex].index];
                return <GetCodes rowData={rowData} type={CODES_BEAN_LIST_TYPE.AHD} />;
            },
        },
    },
];

const transformMedicalAndDrugCodesData = codes => {
    const transformedData = [];

    codes?.data?.read?.forEach(item => {
        const modifiedItem = {
            type: CODE_BUILDER_TYPE.MEDICAL,
            filename: item.name,
            date: item.createdOn,
            tags: item.tags,
            owner: item.ownerName,
            documentId: item.documentId,
            id: item.id,
            status: item.status,
            favoritedByUser: item.favoritedByUser,
            favoriteCount: item.favoriteCount,
        };

        transformedData.push(modifiedItem);
    });

    codes?.data?.drug?.forEach(item => {
        const modifiedItem = {
            type: CODE_BUILDER_TYPE.DRUG,
            filename: item.name,
            date: item.createdOn,
            tags: item.tags,
            owner: item.ownerName,
            documentId: item.documentId,
            id: item.id,
            status: item.status,
            favoritedByUser: item.favoritedByUser,
            favoriteCount: item.favoriteCount,
        };

        transformedData.push(modifiedItem);
    });

    return transformedData;
};

const handleMedAndDrugRowSelection = (
    rowsSelected,
    setSelectedMedAndDrugCodes,
    allRowsSelected,
    medicalAndDrugCodes,
    props
) => {
    const selectedCodes = rowsSelected.map(i => medicalAndDrugCodes[i]);
    const medicalCodes = selectedCodes.filter(code => code.type === CODE_BUILDER_TYPE.MEDICAL);
    const drugCodes = selectedCodes.filter(code => code.type === CODE_BUILDER_TYPE.DRUG);

    props.setReadCodesLocal(medicalCodes);

    props.setDrugCodesLocal(drugCodes);

    setSelectedMedAndDrugCodes(allRowsSelected.map(i => i.dataIndex));
};

const CustomSearch = props => {
    const {
        medAndDrugCodes,
        setMatchesFoundWithMedAndDrug,
        ahdCodes,
        setMatchesFoundWithAhd,
        searchTerm,
        setSearchTerm,
        onSearch,
    } = props;

    const classes = useStyles();

    const handleTextChange = event => {
        const searchText = event.target.value?.toLowerCase();
        setSearchTerm(searchText);

        onSearch(event.target.value);

        const medAndDrugColumns = Object.keys(Object.assign({}, ...medAndDrugCodes));
        const ahdColumns = Object.keys(Object.assign({}, ...ahdCodes));

        if (searchText) {
            const filteredMedAndDrugList = medAndDrugCodes.filter(data =>
                medAndDrugColumns.some(col =>
                    data[col]?.toString()?.toLowerCase()?.includes(searchText)
                )
            );

            setMatchesFoundWithMedAndDrug(filteredMedAndDrugList.length);

            const filteredAhdList = ahdCodes.filter(data =>
                ahdColumns.some(col => data[col]?.toString()?.toLowerCase()?.includes(searchText))
            );

            setMatchesFoundWithAhd(filteredAhdList.length);
        } else {
            setMatchesFoundWithMedAndDrug("");

            setMatchesFoundWithAhd("");
        }
    };

    return (
        <Grow appear in={true} timeout={300}>
            <div className={classes.main}>
                <SearchIcon className={classes.searchIcon} />
                <TextField
                    className={classes.searchText}
                    value={searchTerm}
                    autoFocus={true}
                    variant="standard"
                    onChange={handleTextChange}
                    fullWidth={true}
                />
            </div>
        </Grow>
    );
};

const DisplayAddCodesTabs = observer(props => {
    const [value, setValue] = React.useState(ACTIVE_TAB);

    const [selectedMedAndDrugCodes, setSelectedMedAndDrugCodes] = React.useState([]);
    const [tableRefAHDs, setTableRefAHDs] = React.useState([]);
    const [matchesFoundWithMedAndDrug, setMatchesFoundWithMedAndDrug] = React.useState("");
    const [medicalAndDrugCodes, setMedicalAndDrugCodes] = React.useState([]);
    const [matchesFoundWithAhd, setMatchesFoundWithAhd] = React.useState("");
    const [searchTerm, setSearchTerm] = React.useState("");

    const classes = useStyles();
    const { codes, tab = undefined } = props;

    React.useEffect(() => {
        const transformedMedAndDrugCodes = transformMedicalAndDrugCodesData(codes);
        setMedicalAndDrugCodes(transformedMedAndDrugCodes);
        // We depend on the observable arrays so the table updates when favorite status changes
    }, [codes?.data?.read, codes?.data?.drug]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const localization = {
        toolbar: {
            nRowsSelected: rowCount => {
                const suffix = rowCount > 60 ? `(Max ${MAX_ROWS})` : "";
                return `${rowCount} ${rowCount === 1 ? "row" : "rows"} selected ${suffix}`;
            },
        },
    };

    const clearSelections = () => {
        setSelectedMedAndDrugCodes([]);
        setTableRefAHDs([]);
        setMatchesFoundWithMedAndDrug("");
        setMatchesFoundWithAhd("");
    };

    events.on("clear.table", clearSelections);

    const toggleFav = async (id, type) => {
        codes.favoriteCode(id, type);
    };

    const filterOptionsForTag = medicalAndDrugCodes
        ?.flatMap(item => item?.tags)
        .filter(item => item);

    const filterOptionsForStatus = medicalAndDrugCodes
        ?.flatMap(item => item?.status)
        .filter(item => item);

    const columnsForMedAndDrugCodes = [
        {
            label: "Status",
            name: "status",
            options: {
                filter: filterOptionsForStatus?.length > 0,
                filterOptions: {
                    names: [...new Set(filterOptionsForStatus)],
                },
                customBodyRender: value => {
                    return <GetIconForThisCodeStatus status={value} />;
                },
                setCellProps: () => ({
                    style: {
                        width: 24,
                    },
                }),
            },
        },
        {
            label: "Name",
            name: "filename",
            options: {
                filter: false,
                sort: false,
                setCellProps: () => ({
                    style: {
                        minWidth: "400px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "wrap",
                    },
                }),
            },
        },
        {
            label: "Tags",
            name: "tags",
            options: {
                filter: filterOptionsForTag?.length > 0,
                filterOptions: {
                    names: [...new Set(filterOptionsForTag)],
                },
                sort: false,
                filterType: "dropdown",
                searchable: true,
                setCellProps: () => ({
                    style: {
                        minWidth: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "wrap",
                    },
                }),
                customBodyRenderLite: dataIndex => {
                    const tags =
                        medicalAndDrugCodes?.length > dataIndex &&
                        medicalAndDrugCodes?.[dataIndex] &&
                        medicalAndDrugCodes[dataIndex].tags;
                    const MAX_CHAR_LIMIT = 25;
                    return (
                        <div>
                            {tags &&
                                tags.length > 0 &&
                                tags.map(tag => {
                                    return (
                                        tag !== "" && (
                                            <Chip
                                                key={tag?.slice(0, MAX_CHAR_LIMIT)}
                                                style={{ margin: "1px" }}
                                                size="small"
                                                label={tag}
                                                variant="outlined"
                                                color="primary"
                                            />
                                        )
                                    );
                                })}
                        </div>
                    );
                },
            },
        },
        {
            label: "Date",
            name: "date",
            options: {
                filter: false,
                sort: true,
                setCellProps: () => ({
                    style: {
                        minWidth: "80px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    },
                }),
                customBodyRender: (value, tableMeta) => {
                    const rowData =
                        tableMeta.tableData[tableMeta.currentTableData[tableMeta.rowIndex].index];

                    let date = ""; // defaults to blank.
                    if (value) {
                        date = formatDate(value); // value is lastModifiedOn
                    } else if (rowData.createdOn) {
                        // fallback to createdOn
                        date = formatDate(rowData.createdOn);
                    }

                    return date;
                },
            },
        },
        {
            label: "Info",
            name: "Actions",
            options: {
                filter: false,
                sort: false,
                empty: true,
                setCellProps: () => ({
                    style: {
                        width: "100px",
                    },
                }),
                customBodyRenderLite: dataIndex => {
                    const type =
                        medicalAndDrugCodes?.length > dataIndex &&
                        medicalAndDrugCodes?.[dataIndex] &&
                        medicalAndDrugCodes[dataIndex].type;

                    const id =
                        medicalAndDrugCodes?.length > dataIndex &&
                        medicalAndDrugCodes?.[dataIndex] &&
                        medicalAndDrugCodes[dataIndex].id;
                    const owner =
                        medicalAndDrugCodes?.length > dataIndex &&
                        medicalAndDrugCodes?.[dataIndex] &&
                        medicalAndDrugCodes[dataIndex].owner;

                    const documentId =
                        medicalAndDrugCodes?.length > dataIndex &&
                        medicalAndDrugCodes?.[dataIndex] &&
                        medicalAndDrugCodes[dataIndex].documentId;

                    const favoritedByUser =
                        medicalAndDrugCodes?.length > dataIndex &&
                        medicalAndDrugCodes?.[dataIndex] &&
                        medicalAndDrugCodes[dataIndex].favoritedByUser;

                    const favoriteCount =
                        medicalAndDrugCodes?.length > dataIndex &&
                        medicalAndDrugCodes?.[dataIndex] &&
                        medicalAndDrugCodes[dataIndex].favoriteCount;

                    return (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <Tooltip
                                title={
                                    favoritedByUser ? "Remove from favorites" : "Add to favorites"
                                }
                            >
                                <IconButton
                                    disabled={codes.loading === true}
                                    aria-label={
                                        favoritedByUser
                                            ? "Remove from favorites"
                                            : "Add to favorites"
                                    }
                                    onClick={async event => {
                                        event.stopPropagation();
                                        toggleFav(id, type);
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
                            <Chip
                                label={type}
                                color="primary"
                                variant="outlined"
                                sx={{ textTransform: "capitalize", marginRight: "10px" }}
                            />
                            <Tooltip title={owner} placement="bottom" aria-label="owner">
                                <span style={{ marginRight: "10px" }}>
                                    {owner ? (
                                        <DisplayAvatar
                                            value={owner}
                                            randomColor={true}
                                            size="small"
                                            fontSize="0.75rem"
                                        />
                                    ) : (
                                        <div style={{ marginRight: "22px" }} />
                                    )}
                                </span>
                            </Tooltip>

                            <GetDocument id={documentId} />
                            <GetCodes
                                rowData={medicalAndDrugCodes?.[dataIndex]}
                                type={CODES_BEAN_LIST_TYPE[type?.toUpperCase()]}
                            />
                        </div>
                    );
                },
            },
        },
        {
            label: "Owner",
            name: "owner",
            options: {
                filter: true,
                display: true,
                searchable: true,
                setCellHeaderProps: () => ({ style: { display: "none" } }),
                // MUI display false option disables the search capability for this column, which is required for our use case where we want to search the value but hide
                //the display on UI. Hence adding custom render with empty element.
                customBodyRender: (__, ___, _) => {
                    return <div />;
                },
                setCellProps: () => ({
                    style: {
                        width: 0,
                        padding: 0,
                    },
                }),
            },
        },
        {
            label: "Type",
            name: "type",
            options: {
                filter: true,
                display: true,
                searchable: true,
                setCellHeaderProps: () => ({ style: { display: "none" } }),
                // MUI display false option disables the search capability for this column, which is required for our use case where we want to search the value but hide
                //the display on UI. Hence adding custom render with empty element.
                customBodyRender: (__, ___, _) => {
                    return <div />;
                },
                setCellProps: () => ({
                    style: {
                        width: 0,
                        padding: 0,
                    },
                }),
            },
        },
        {
            label: "Show Only Favourites",
            name: "favoritedByUser",
            options: {
                filter: true,
                display: true,
                searchable: true,
                setCellHeaderProps: () => ({ style: { display: "none" } }),
                // Ensure filter chip shows a readable value for boolean filters
                customFilterListOptions: {
                    render: v => {
                        if (v === true) return "Show only favorites";
                        if (v === false) return "Hide favorite codes";
                        return String(v);
                    },
                },
                // MUI display false option disables the search capability for this column, which is required for our use case where we want to search the value but hide
                // the display on UI. Hence adding custom render with empty element.
                customBodyRender: (__, ___, _) => {
                    return <div />;
                },
                setCellProps: () => ({
                    style: {
                        width: 0,
                        padding: 0,
                    },
                }),
            },
        },
    ];

    const options = {
        ...MUIDataTableOptionForAddCode,
        searchText: searchTerm,

        customSearchRender: (_, handleSearch) => {
            return (
                <CustomSearch
                    medAndDrugCodes={medicalAndDrugCodes}
                    setMatchesFoundWithMedAndDrug={setMatchesFoundWithMedAndDrug}
                    ahdCodes={codes?.data?.ahd}
                    setMatchesFoundWithAhd={setMatchesFoundWithAhd}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onSearch={handleSearch}
                />
            );
        },
    };

    return (
        <div className={classes.root}>
            <Tabs
                value={value}
                centered
                onChange={handleChange}
                scrollButtons
                aria-label="add variables scrollable tabs"
                allowScrollButtonsMobile
            >
                <Tab label={`Medical/Drug Codes ${matchesFoundWithMedAndDrug}`} {...a11yProps(0)} />
                <Tab label={`AHD Codes ${matchesFoundWithAhd}`} {...a11yProps(1)} />
            </Tabs>
            <TabPanel value={value} index={0}>
                <MUIDataTable
                    columns={columnsForMedAndDrugCodes}
                    data={medicalAndDrugCodes}
                    options={{
                        ...options,
                        onRowSelectionChange: (_, allRowsSelected, rowsSelected) => {
                            handleMedAndDrugRowSelection(
                                rowsSelected,
                                setSelectedMedAndDrugCodes,
                                allRowsSelected,
                                medicalAndDrugCodes,
                                props
                            );
                        },
                        rowsSelected: selectedMedAndDrugCodes,
                        filterArrayFullMatch: false,
                    }}
                    localization={localization}
                />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <MUIDataTable
                    title="AHD Codes"
                    columns={ahdCodesColumns}
                    data={
                        tab === "match"
                            ? (codes?.data?.ahd || []).filter(e => e.enableMatchingBtn === true)
                            : codes?.data?.ahd
                    }
                    options={{
                        ...options,
                        onRowSelectionChange: (_, allRowsSelected, rowsSelected) => {
                            const dataToAdd =
                                tab === "match"
                                    ? (codes?.data?.ahd || []).filter(
                                          e => e.enableMatchingBtn === true
                                      )
                                    : codes?.data?.ahd;
                            props.setAHDCodesLocal(rowsSelected.map(i => dataToAdd[i]));
                            setTableRefAHDs(allRowsSelected.map(i => i.dataIndex));
                        },
                        rowsSelected: tableRefAHDs,
                    }}
                />
            </TabPanel>
        </div>
    );
});

const handleAddVariables = async (
    readCodesLocal,
    drugCodesLocal,
    ahdCodesLocal,
    setReadCodesLocal,
    setDrugCodesLocal,
    setAHDCodesLocal,
    totalCodesSelected,
    props
) => {
    const { setReadCodes, setAHDCodes, setDrugCodes } = props;

    if (readCodesLocal.length === 0 && drugCodesLocal.length === 0 && ahdCodesLocal.length === 0)
        return;

    if (props.tab !== undefined) {
        let filteredReads = readCodesLocal;
        let filteredDrugs = drugCodesLocal;
        let filteredAHDs = ahdCodesLocal;

        const noDuplicateCodes =
            props.tab === "Exposure" || props.tab === "Unexposed" || props.tab === "Population";

        // Read the appropriate store structure.

        const isPopulationTab = props.tab === "Population";

        const data = isPopulationTab ? props.store.data.population : props.store.data;

        const reads = noDuplicateCodes ? data.clinicalCodeListMedical : data.clinicalCodeList;

        const drugs = noDuplicateCodes ? data.clinicalCodeListTherapy : data.clinicalCodeList;

        if (noDuplicateCodes) {
            filteredReads = readCodesLocal.filter(
                code => !reads.find(e => code.filename === e.filename)
            );
            filteredDrugs = drugCodesLocal.filter(
                code => !drugs.find(e => code.filename === e.filename)
            );

            filteredAHDs = ahdCodesLocal.filter(
                code => !data.ahdBeanList.find(e => code.ahdCode === e.ahdCode)
            );
        }

        const payload = {};

        payload.read = filteredReads.map(code => code.id);
        payload.drug = filteredDrugs.map(code => code.id);

        payload.ahd = filteredAHDs.map(code => code.ahdCode);

        const response = await props.codes.loadWithCodes(payload, studyDatabase.data?.id);

        // Check if value is present in the response.
        if (response?.data?.clinicalCodeListMedical) {
            setReadCodes(response.data.clinicalCodeListMedical);
        } else {
            setReadCodes([]);
        }

        if (response?.data?.clinicalCodeListTherapy) {
            setDrugCodes(response.data.clinicalCodeListTherapy);
        } else {
            setDrugCodes([]);
        }

        if (response?.data?.ahdBeanList?.length) {
            setAHDCodes(response.data.ahdBeanList);
        } else {
            setAHDCodes([]);
        }

        const selectedMedCodeIDs = readCodesLocal.map(item => item.id);
        const selectedDrugCodeIDs = drugCodesLocal.map(item => item.id);
        const selectedAhdCodes = ahdCodesLocal.map(item => item.ahdCode);

        const clinicalCodeListMedicalIds = reads.map(item => item.id);
        const clinicalCodeListTherapyIds = drugs.map(item => item.id);
        const ahdBeanListIds = data.ahdBeanList.map(item => item.ahdCode);

        const existingMedCodes = _.intersection(selectedMedCodeIDs, clinicalCodeListMedicalIds);
        const existingDrugCodes = _.intersection(selectedDrugCodeIDs, clinicalCodeListTherapyIds);
        const existingAhdCodes = _.intersection(selectedAhdCodes, ahdBeanListIds);

        const existingCodesCount =
            existingMedCodes?.length + existingDrugCodes?.length + existingAhdCodes?.length;

        if (totalCodesSelected > 0) {
            const newCodesCount = totalCodesSelected - existingCodesCount;

            let message = `Added ${pluralize(newCodesCount, "Variable", "Variables")}`;

            if (existingCodesCount > 0) {
                message += `, ${pluralize(
                    existingCodesCount,
                    "variable already exists",
                    "variables already exist"
                )}`;
            }

            ShowSuccess(message);
        }
        setReadCodesLocal([]);
        setDrugCodesLocal([]);
        setAHDCodesLocal([]);
        events.emit("clear.table");
    }
};

export const FetchAndDisplayAddCodes = observer(props => {
    const [readCodesLocal, setReadCodesLocal] = React.useState([]);
    const [drugCodesLocal, setDrugCodesLocal] = React.useState([]);
    const [ahdCodesLocal, setAHDCodesLocal] = React.useState([]);

    const { setReadCodes, setAHDCodes, setDrugCodes } = props;

    const localSetters = {
        setReadCodesLocal,
        setDrugCodesLocal,
        setAHDCodesLocal,
        readCodesLocal,
        drugCodesLocal,
        ahdCodesLocal,
    };
    const classes = useStyles();

    const maxLimit =
        readCodesLocal.length + drugCodesLocal.length + ahdCodesLocal.length > MAX_ROWS - 1;

    const totalCodesSelected = readCodesLocal.length + drugCodesLocal.length + ahdCodesLocal.length;

    return (
        <>
            <form className={classes.root} noValidate autoComplete="off">
                <Grid container spacing={2} justifyContent="space-between">
                    <Grid>
                        <Typography variant="h6"> Add Variables</Typography>
                    </Grid>
                    <Grid>
                        <Button
                            className={classes.button}
                            variant="outlined"
                            onClick={e => {
                                // Reset the local states (readCodesLocal, drugCodesLocal and AhdCodesLocal) back to empty arrays
                                setReadCodes([]);
                                setAHDCodes([]);
                                setDrugCodes([]);
                                props.toggleDrawer(false)(e);
                                events.emit("clear.table");
                            }}
                        >
                            Close
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={props.codes.loading || maxLimit}
                            onClick={() => {
                                handleAddVariables(
                                    readCodesLocal,
                                    drugCodesLocal,
                                    ahdCodesLocal,
                                    setReadCodesLocal,
                                    setDrugCodesLocal,
                                    setAHDCodesLocal,
                                    totalCodesSelected,
                                    props
                                );
                            }}
                        >
                            {`Add (${totalCodesSelected})`}
                        </Button>
                    </Grid>
                </Grid>
                <Grid container spacing={1}>
                    <Grid
                        size={{
                            xs: 12,
                            md: 12,
                            lg: 12,
                        }}
                    >
                        <DisplayAddCodesTabs {...props} {...localSetters} />
                    </Grid>

                    {maxLimit && (
                        <Alert severity="error" style={{ marginTop: "10px" }}>
                            Only {MAX_ROWS} selections allowed.
                        </Alert>
                    )}
                </Grid>
            </form>
        </>
    );
});

export function AddCodesDrawer(props) {
    const [displayDrawer, setDisplayDrawer] = React.useState(false);
    const activeDatabase = studyDatabase.data?.id !== undefined && studyDatabase.data;
    const currentTheme = useTheme();
    const theme = createTheme({
        palette: {
            mode: currentTheme.palette.mode,
        },
        components: {
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        overflowY: "hidden",
                    },
                },
            },
        },
    });

    const toggleDrawer = open => event => {
        if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
            return;
        }
        setDisplayDrawer(open);
    };

    const resetStoresAndClose = e => {
        const { setReadCodes, setAHDCodes, setDrugCodes } = props;
        setReadCodes([]);
        setAHDCodes([]);
        setDrugCodes([]);
        events.emit("clear.table");
        toggleDrawer(false)(e);
    };

    return (
        <div>
            <React.Fragment>
                <BasicButton
                    handleClick={toggleDrawer(true)}
                    buttonText="Add Variables"
                    disabled={props.mode === "modify" || activeDatabase?.name === undefined}
                />
                <ThemeProvider theme={theme}>
                    <Dialog
                        open={displayDrawer}
                        onClose={resetStoresAndClose}
                        aria-labelledby="add-variables-dialog"
                        aria-describedby="add-variables-dialog"
                        fullWidth={true}
                        maxWidth="xl"
                    >
                        <DialogContent>
                            <DialogContentText id="add-variables-dialog-content" component="span">
                                <FetchAndDisplayAddCodes toggleDrawer={toggleDrawer} {...props} />
                            </DialogContentText>
                        </DialogContent>
                    </Dialog>
                </ThemeProvider>
            </React.Fragment>
        </div>
    );
}

export const AddCodes = props => {
    return <AddCodesDrawer {...props} />;
};
