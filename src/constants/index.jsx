//#region - General
import React from "react";
import Tooltip from "@mui/material/Tooltip";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import IconButton from "@mui/material/IconButton";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import InfoIcon from "@mui/icons-material/Info";
import InventoryIcon from "@mui/icons-material/Inventory";
import { debounceSearchRender } from "mui-datatables";
import {
    BlockOutlined,
    EditNote,
    NoteAltOutlined,
    PlagiarismOutlined,
    VerifiedOutlined,
} from "@mui/icons-material";
import Button from "@mui/material/Button";

export const ACTIVE = "Active";
export const ALL = "All";
export const ANY = "Any";
export const EMAIL = "Email";
export const SESSION_EXPIRED = "Session expired. Please login again.";
export const FULL_DB_EXTRACTION = "Full DB Extraction Request";
export const ARCHIVED = "Archived";
export const DELETE = "DELETE";
export const REACTIVATE = "Reactivate";
export const USERSTATUS = {
    DELETE,
    REACTIVATE,
};

export const SNACK_SEVERITY = {
    SUCCESS: "success",
    ERROR: "error",
    WARNING: "warning",
    INFO: "info",
};

export const CURRENT_DATE = new Date();
export const nonFloatDataFiles = ["ADDITIONAL", "CLINICAL", "IMMS"];
export const SYSTEM_ROLE = {
    PENDING: 0,
    USER: 1,
    MODERATOR: 2,
    ADMIN: 3,
};

export const PROJECT_ROLE = {
    VIEW_ONLY: 1,
    CO_OWNER: 2,
    OWNER: 3,
};

// 1-INQUEUE,2-PROCESSING,3-COMPLETED,4-CANCELLED,5-ARCHIVED, 7- fullDBExtractionRequest

export const JOB_STATUS = {
    QUEUE: 1,
    PROCESSING: 2,
    COMPLETED: 3,
    CANCELLED: 4,
    ARCHIVED: 5,
    DRAFT: 6,
    FULL_DB_EXTRACTION_REQUEST: 7,
};

export const ANALYTICS_JOB_STATUS = {
    QUEUE: 1,
    PROCESSING: 2,
    COMPLETED: 3,
    CANCELLED: 4,
    DELETED: 7,
};

//#endregion

//#region - Study Details
/* Study Details  */

export const CROSS_SECTIONAL = "CROSS_SECTIONAL";
export const INC_PREV = "INC_PREV";
export const FEASIBILITY = "FEASIBILITY";
export const CASE_CONTROL = "CASE_CONTROL";
export const COHORT = "COHORT";

export const STUDY_TYPES = {
    [FEASIBILITY]: "Feasibility Study",
    [COHORT]: "Cohort",
    [CASE_CONTROL]: "Case Control",
    [INC_PREV]: "Incidence Prevalence",
    [CROSS_SECTIONAL]: "Cross Sectional",
};

export const UNIT_OF_TIME = "day(s)";

export const AMR_DATE_FULL =
    "How long after the Standardisation date should the care provider site be eligible for inclusion in the study?";

export const EMR_SYSTEM = "EMR System eligible Days before Inclusion ?";

export const PATIENT_REGISTERED_FULL =
    "How long should participants be registered before becoming eligible to join the study";

export const PATIENT_AGE_FULL =
    "What should be the participant's minimum age at start of follow-up?";

export const PATIENT_AGE_MAX_FULL =
    "What should be the participant's maximum age at start of follow-up?";

export const PATIENT_EXIT_AGE_FULL =
    "What is the maximum age that you would like to follow-up the participants until? (Participants will be censored if they reach this age during the study)";

export const FULL_DATABASE_VALUE = 0;
export const ALL_PATIENTS_VALUE = 0;
export const MALE_PATIENTS_VALUE = 1;
export const FEMALE_PATIENTS_VALUE = 2;
// export const STARTS_WITH_PRACTICE_VALUE = 1;
export const TRIAL_RUN_STUDY_VALUE = 2;

export const FULL_DATABASE = "Full Database";
export const ALL_PATIENTS_LABEL = "All Participants";
export const MALE_PATIENTS_LABEL = "Male Only";
export const FEMALE_PATIENTS_LABEL = "Female Only";
// export const STARTS_WITH_PRACTICE = "Select Practices that start with ";
export const PILOT_RUN_TOOL_TIP = (
    <>
        <b>Pilot run:</b>
        <br />
        {"Study will be conducted on <2% of overall data"}
    </>
);
export const TRIAL_RUN_STUDY = (
    <>
        Pilot run
        <Tooltip title={PILOT_RUN_TOOL_TIP}>
            <IconButton style={{ cursor: "default" }} aria-label="pilot run">
                <InfoIcon sx={{ fontSize: "medium" }} />
            </IconButton>
        </Tooltip>
    </>
);

export const TRIAL_RUN_STUDY_TEXT = "Pilot run";

export const radioOptionsSexOfThePopulation = [
    { value: ALL_PATIENTS_VALUE, label: ALL_PATIENTS_LABEL },
    { value: MALE_PATIENTS_VALUE, label: MALE_PATIENTS_LABEL },
    { value: FEMALE_PATIENTS_VALUE, label: FEMALE_PATIENTS_LABEL },
];

export const summaryForSexOfThePopulation = [
    { value: ALL_PATIENTS_VALUE, label: "all sexes" },
    { value: MALE_PATIENTS_VALUE, label: "male only participants" },
    { value: FEMALE_PATIENTS_VALUE, label: "female only participants" },
];

export const radioOptionsDatabaseTypes = [
    { value: FULL_DATABASE_VALUE, label: FULL_DATABASE, text: FULL_DATABASE },
    {
        value: TRIAL_RUN_STUDY_VALUE,
        label: TRIAL_RUN_STUDY,
        text: TRIAL_RUN_STUDY_TEXT,
    },
];

//#endregion

//#region - Exposed
/* Exposed  */

export const STUDY_NEED_EXPOSURE = "Does the study include an exposed group?";

export const STUDY_NEED_EXPOSURE_FOR_CASE_CONTROL = "Does the study include a case group?";

export const STUDY_NEED_EXPOSURE_FOR_INV_PREV_AND_CROSS_SECTIONAL =
    "Does the study include participants who meet additional criteria?";

export const YES = "Yes";
export const NO = "No";

export const INCLUDE = "Include";
export const EXCLUDE = "Exclude";

export const INCLUDE_VALUE = "1";
export const EXCLUDE_VALUE = "0";

export const radioOptionsExposedYesNo = [
    { value: true, label: YES },
    { value: false, label: NO },
];

export const radioOptionsStrictLoose = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
];

//#endregion

//#region - Unexposed

/* Unexposed  */

export const STUDY_NEED_UNEXPOSED = "Are unexposed participants required for this study?";
export const STUDY_NEED_UNEXPOSED_FOR_CASE_CONTROL = "Are Controls required for this study?";

export const STUDY_NEED_UN_EXPOSURE_MATCH = "Do you want to match the two arms of the study?";

export const STUDY_SELECT_FROM_PRACTICE_UNEXPOSED =
    "Which practice should the comparator group be selected from?";
export const STUDY_UNEXPOSED_HOW_MANY = "How many unexposed would you need for every exposed?";
export const STUDY_UNEXPOSED_HOW_MANY_CASE_CONTROL =
    "How many controls would you need for every case?";

export const STUDY_SEX_MATCHING =
    "What criteria should be used for matching sex between the groups?";
export const STUDY_UNEXPOSED_MATCH_REGISTRATION =
    "Do you want participants to be registered with the practice for the same duration before matching?";
export const STUDY_UNEXPOSED_MATCH_ETHNICITY =
    "Do you want to match for ethnicity between the groups?";

export const STUDY_UNEXPOSED_PRIMARY_ONLY_MATCH = "Match only primary exposure";
export const STUDY_UNEXPOSED_HOW_MANY_YEARS =
    "How close in years of age should the unexposed be compared to exposed?";
export const STUDY_UNEXPOSED_HOW_MANY_YEARS_FOR_CASE_CONTROL =
    "How close in years of age should the controls be compared to cases?";

export const STUDY_UNEXPOSED_HOW_MANY_MONTHS_REGISTERED =
    "What is the maximum difference allowed in the length of registration between the unexposed and the exposed participants?";

export const STUDY_UNEXPOSED_HOW_MANY_MONTHS_REGISTERED_FOR_CASE_CONTROL =
    "What is the maximum difference allowed in the length of registration between the controls and the cases?";

export const STUDY_UNEXPOSED_DAYS_BEFORE_EXPOSURE = "How much time before can the exposure occur";
export const STUDY_UNEXPOSED_DAYS_AFTER_EXPOSURE = "How much time after can the exposure occur";

export const radioOptionsControlYesNo = [
    { value: true, label: YES },
    { value: false, label: NO },
];

export const radioOptionsMatchPrimaryExposureOnlyYesNo = [
    { value: true, label: YES },
    { value: false, label: NO },
];

export const SAME_SEX = "Same Sex";
export const OPPOSITE_SEX = "Opposite Sex";

export const SAME_AS_EXPOSED_INDEX = "The same as the exposed participant's Index Date";

export const SAME_AS_EXPOSED_INDEX_FOR_CASE_CONTROL = "The same as the case’s Index Date";

export const INDEPENDENT_OF_EXPOSED =
    "Independent of the exposed participant's index date but within the same year";

export const INDEPENDENT_OF_EXPOSED_CASE_CONTROL =
    "Independent of the case’s index date but within the same year";

export const SAME_SEX_VALUE = 1;
export const OPPOSITE_SEX_VALUE = 2;
export const ANY_VALUE = 3;

export const radioOptionsControlGender = [
    { value: SAME_SEX_VALUE, label: SAME_SEX },
    { value: OPPOSITE_SEX_VALUE, label: OPPOSITE_SEX },
    { value: ANY_VALUE, label: ANY },
];

export const radioOptionsControlIndexDate = [
    { value: 1, label: SAME_AS_EXPOSED_INDEX },
    {
        value: 2,
        label: (
            <Tooltip
                title={
                    "Only select this option if you have the requisite knowledge and expertise in pharmaco-epidemiological designs, and you know how to handle variance in index date and its implications."
                }
            >
                <div>
                    {INDEPENDENT_OF_EXPOSED}
                    <IconButton style={{ cursor: "default" }}>
                        <InfoIcon />
                    </IconButton>
                </div>
            </Tooltip>
        ),
    },
];

export const radioOptionsControlIndexDateForCaseControl = [
    { value: 1, label: SAME_AS_EXPOSED_INDEX_FOR_CASE_CONTROL },
    {
        value: 2,
        label: (
            <Tooltip
                title={
                    "Only select this option if you have the requisite knowledge and expertise in pharmaco-epidemiological designs, and you know how to handle variance in index date and its implications."
                }
            >
                <div>
                    {INDEPENDENT_OF_EXPOSED_CASE_CONTROL}
                    <IconButton style={{ cursor: "default" }}>
                        <InfoIcon />
                    </IconButton>
                </div>
            </Tooltip>
        ),
    },
];

export const controlPracticesDropDown = [
    { label: "Same Practice", value: 1 },
    { label: "Any Practice with the same Health Authority Region", value: 3 },
    { label: "Any Practice within the same Country", value: 4 },
];

//#endregion

//#region -  Baseline
/* Baseline  */

export const STUDY_BASELINE_LOGIC = "Define baseline variables and characteristics";
export const STUDY_BASELINE_LOGIC_FOR_INC_PREV =
    "Define variables for calculating incidence/prevalence";
export const STUDY_BASELINE_LOGIC_FOR_CROSS_SECTIONAL =
    "Define variables for calculating prevalence";

export const STUDY_BASELINE_LOGIC_FOR_CASE_CONTROL = "Define baseline variables and risk factors";

export const STUDY_BASELINE_RECORD_TYPES = {
    LATEST: 1,
    EARLIEST: 2,
    FIRST_EVER: 3,
};

//#endregion

//#region - Outcome

/* Outcome */

export const STUDY_OUTCOME_PATIENT_CENSORED =
    "Participants will be censored at the first occurrence of outcome event";
export const STUDY_NAME = "Study name";
export const STUDY_OUTCOME_CONSULTATIONS =
    "Do you want the number of consultations between Index date and Exit date ";

export const radioOptionsYesNo = [
    { value: true, label: YES },
    { value: false, label: NO },
];

const FLOWCHART_VIEW = "Flowchart View";
const TEXT_VIEW = "Text View";

export const radioOptionsFlowchartOrText = [
    { value: true, label: FLOWCHART_VIEW },
    { value: false, label: TEXT_VIEW },
];

export const radioOptionsMRYesNo = [
    { value: true, label: YES },
    { value: false, label: NO },
];

//#endregion

const baselineVariableTypeOfRecordLabelMap = new Map();
baselineVariableTypeOfRecordLabelMap.set(1, " latest record ");
baselineVariableTypeOfRecordLabelMap.set(2, " earliest record ");
baselineVariableTypeOfRecordLabelMap.set(3, " first event ever recorded regardless of index date ");
export { baselineVariableTypeOfRecordLabelMap };

const baselineVariableTypeOfMultipleRecordLabelMap = new Map();
baselineVariableTypeOfMultipleRecordLabelMap.set("all", " records in the database ");
baselineVariableTypeOfMultipleRecordLabelMap.set(
    "between",
    " all records between index and exit date "
);
baselineVariableTypeOfMultipleRecordLabelMap.set("afterindex", " records after index date ");
baselineVariableTypeOfMultipleRecordLabelMap.set("beforeindex", " records before index date ");
baselineVariableTypeOfMultipleRecordLabelMap.set("beforeexit", " records before exit date ");
export { baselineVariableTypeOfMultipleRecordLabelMap };

const inclusionCriteriaLabelMap = new Map();
inclusionCriteriaLabelMap.set(1, " an incident event");
inclusionCriteriaLabelMap.set(2, " first event recorded after registration into the practice");
inclusionCriteriaLabelMap.set(3, " first event ever recorded (incident or prevalent)");
inclusionCriteriaLabelMap.set(4, " first event ever recorded (incident or prevalent)");
export { inclusionCriteriaLabelMap };

const exclusionCriteriaLabelMap = new Map();
exclusionCriteriaLabelMap.set(1, " ever recorded");
exclusionCriteriaLabelMap.set(2, " recorded before index date ");
exclusionCriteriaLabelMap.set(3, " recorded within a certain time before index date");
export { exclusionCriteriaLabelMap };

export const baselineRightMarginTooltip =
    "Add or subtract time to adjust the index date before collecting variables. MIN=-18261, MAX=+18263. ZERO = no time limit.";
export const baselineLeftMarginTooltip =
    "Find records within specific time before index date or the right margin. MIN=-18263, MAX=RIGHT MARGIN. ZERO = no time limit.";

//#endregion

//#region - Admin Publications

export const PUBMED = "Pubmed";
export const CONFIRM_ADD_PUBLICATION = "Are you sure you want to add the following publication ?";
export const ADD_ARTICLE_HEADING = "Add Article";
export const FETCH_ARTICLE_BUTTON = "Fetch Article";

export const ARTICLE_PUBLISHED_TABLE_HEADING = "Published Articles";
export const ARTICLE_IDENTIFIER_INPUT_PLACEHOLDER = "Enter Article ID";
export const ARTICLE_ADDED_SUCCESS_MESSAGE = "Article Added Successfully";

export const PUBMED_WEBSITE = "https://pubmed.ncbi.nlm.nih.gov/";
export const PMCID = "pmc";
export const PMID = "pubmed";

export const radioOptionsAdminPublication = [
    { value: PMID, label: "PM ID" },
    { value: PMCID, label: "PMC ID" },
];

export const MUIDataTableOptionForAddCode = {
    actionsColumnIndex: -1,
    setTableProps: () => {
        return { size: "small" };
    },
    selectToolbarPlacement: "none",
    searchAlwaysOpen: true,
    selectableRowsOnClick: true,
    rowsPerPage: 10,
    rowsPerPageOptions: [10, 50, 100],
    download: false,
    print: false,
    viewColumns: false,
    customSearchRender: debounceSearchRender(500),
    jumpToPage: true,
    // These next two options allow you to make it so filters need to be confirmed.
    confirmFilters: true,
    // Calling the applyNewFilters parameter applies the selected filters to the table
    customFilterDialogFooter: (currentFilterList, applyNewFilters) => {
        return (
            <div style={{ marginTop: "40px" }}>
                <Button variant="contained" onClick={applyNewFilters}>
                    Apply Filters
                </Button>
            </div>
        );
    },
};

export const THEME = "THEME_20220808";

export const MUIDataTableDefaultOptions = {
    actionsColumnIndex: -1,
    setTableProps: () => {
        return { size: "small" };
    },
    rowsPerPage: 10,
    rowsPerPageOptions: [10, 50, 100],
    selectableRows: "none",
    download: false,
    responsive: "vertical",
    print: false,
    viewColumns: false,
    customSearchRender: debounceSearchRender(500),
    jumpToPage: true,
    // These next two options allow you to make it so filters need to be confirmed.
    confirmFilters: true,
    // Calling the applyNewFilters parameter applies the selected filters to the table
    customFilterDialogFooter: (currentFilterList, applyNewFilters) => {
        return (
            <div style={{ marginTop: "40px" }}>
                <Button variant="contained" onClick={applyNewFilters}>
                    Apply Filters
                </Button>
            </div>
        );
    },
};

export const baseMRTOptions = {
    muiPaginationProps: {
        rowsPerPageOptions: [10, 50, 100],
        showFirstButton: true,
        showLastButton: true,
    },
    muiTableBodyRowProps: {
        sx: {
            "&:hover .copy-button": {
                visibility: "visible",
            },
        },
    },
    globalFilterFn: "contains",
    enableFacetedValues: true,
    positionActionsColumn: "last",
    enableDensityToggle: false,
    enableFilterMatchHighlighting: false,
    enableFullScreenToggle: false,
    enableRowSelection: false,
    enableHiding: false,
    globalFilterDebounceMs: 100, // from debounceSearchRender(500)
};

//#endregion

//#region - Admin Studies

export const columnNames = {
    SL_NO: {
        label: "Sl No",
        name: "slNo",
    },
    ID: { label: "Id", name: "id" },
    PROJECT_ID: {
        label: "Project ID",
        name: "projectID",
    },
    PROJECT_NAME: {
        label: "Project Name",
        name: "projectName",
    },
    STUDY_ID: {
        label: "Study ID",
        name: "jobID",
    },
    STUDY_NAME: { label: "Study Name", name: "jobName" },
    STATUS: { label: "Status", name: "statusDescription" },
    DESIGN_BY: { label: "Designed By", name: "submittedByUserFullName" },
    CREATED_ON: { label: "Created On", name: "submittedOn" },
};

export const UPDATE_STATUS_TITLE = "Update Status";
export const UPDATE_STATUS_CONFIRMATION = "Are you sure you want to change the status?";
export const STATUS_CHANGE_SUCCESS = "Status changed successfully";

export const LOADING = "Loading..";
export const NO_RECORDS_FOUND = "No Records Found.";

export const adminStudiesTableHeader = "Queue";

export const JOBS = "jobs";
export const ADDONS = "addons";

export const TITLE_JOBS = "Jobs";
export const TITLE_ADDONS = "Add Ons";

export const radioOptionsJobsAndAddons = [
    { value: JOBS, label: "Jobs" },
    { value: ADDONS, label: "AddOns" },
];

export const PROJECT_STATUS_ACTIVE = 1;
export const PROJECT_STATUS_ARCHIVED = -1;
export const PROJECT_STATUS_ALL = "";

export const radioOptionsActiveAndArchivedProjects = [
    { value: PROJECT_STATUS_ACTIVE, label: ACTIVE },
    { value: PROJECT_STATUS_ARCHIVED, label: ARCHIVED },
    { value: PROJECT_STATUS_ALL, label: ALL },
];

export const GetJobStatusDesc = status => {
    switch (status) {
        case JOB_STATUS.COMPLETED:
            return "Completed";
        case JOB_STATUS.QUEUE:
            return "Inqueue";
        case JOB_STATUS.PROCESSING:
            return "Processing";
        case JOB_STATUS.CANCELLED:
            return "Cancelled";
        case JOB_STATUS.DRAFT:
            return "Draft";
        case JOB_STATUS.FULL_DB_EXTRACTION_REQUEST:
            return FULL_DB_EXTRACTION;
        case JOB_STATUS.ARCHIVED:
            return ARCHIVED;
        default:
            return "Unknown";
    }
};

export const GetIconForThisStatus = props => {
    const ToReturn = () => {
        if (props.desc === GetJobStatusDesc(JOB_STATUS.COMPLETED)) {
            return (
                <Tooltip title={props.desc}>
                    <CheckCircleIcon color={SNACK_SEVERITY.SUCCESS} />
                </Tooltip>
            );
        } else if (props.desc === GetJobStatusDesc(JOB_STATUS.DRAFT)) {
            return (
                <Tooltip title={props.desc}>
                    <EditNote color={SNACK_SEVERITY.WARNING} />
                </Tooltip>
            );
        } else if (props.desc === GetJobStatusDesc(JOB_STATUS.QUEUE)) {
            return (
                <Tooltip title={props.desc}>
                    <HourglassTopIcon color={SNACK_SEVERITY.WARNING} />
                </Tooltip>
            );
        } else if (props.desc === GetJobStatusDesc(JOB_STATUS.CANCELLED)) {
            return (
                <Tooltip title={props.desc}>
                    <DoDisturbIcon color={SNACK_SEVERITY.ERROR} />
                </Tooltip>
            );
        } else if (props.desc === GetJobStatusDesc(JOB_STATUS.PROCESSING)) {
            return (
                <Tooltip title={props.desc}>
                    <RotateRightIcon color={SNACK_SEVERITY.WARNING} />
                </Tooltip>
            );
        } else if (props.desc === GetJobStatusDesc(JOB_STATUS.FULL_DB_EXTRACTION_REQUEST)) {
            return (
                <Tooltip title={props.desc}>
                    <AllInclusiveIcon color={SNACK_SEVERITY.WARNING} />
                </Tooltip>
            );
        } else if (props.desc === GetJobStatusDesc(JOB_STATUS.ARCHIVED)) {
            return (
                <Tooltip title={props.desc}>
                    <InventoryIcon color={SNACK_SEVERITY.WARNING} />
                </Tooltip>
            );
        } else {
            return props.desc;
        }
    };
    return <ToReturn />;
};

export const adminJobsAddonsSelectOptions = [
    {
        value: JOB_STATUS.COMPLETED,
        label: (
            <GetIconForThisStatus
                desc={GetJobStatusDesc(JOB_STATUS.COMPLETED)}
                key={GetJobStatusDesc(JOB_STATUS.COMPLETED)}
            />
        ),
    },
    {
        value: JOB_STATUS.QUEUE,
        label: (
            <GetIconForThisStatus
                desc={GetJobStatusDesc(JOB_STATUS.QUEUE)}
                key={GetJobStatusDesc(JOB_STATUS.QUEUE)}
            />
        ),
    },
    {
        value: JOB_STATUS.PROCESSING,
        label: (
            <GetIconForThisStatus
                desc={GetJobStatusDesc(JOB_STATUS.PROCESSING)}
                key={GetJobStatusDesc(JOB_STATUS.PROCESSING)}
            />
        ),
    },
    {
        value: JOB_STATUS.CANCELLED,
        label: (
            <GetIconForThisStatus
                desc={GetJobStatusDesc(JOB_STATUS.CANCELLED)}
                key={GetJobStatusDesc(JOB_STATUS.CANCELLED)}
            />
        ),
    },
    {
        value: JOB_STATUS.DRAFT,
        label: (
            <GetIconForThisStatus
                desc={GetJobStatusDesc(JOB_STATUS.DRAFT)}
                key={GetJobStatusDesc(JOB_STATUS.DRAFT)}
            />
        ),
    },
    {
        value: JOB_STATUS.FULL_DB_EXTRACTION_REQUEST,
        label: (
            <GetIconForThisStatus
                desc={GetJobStatusDesc(JOB_STATUS.FULL_DB_EXTRACTION_REQUEST)}
                key={GetJobStatusDesc(JOB_STATUS.FULL_DB_EXTRACTION_REQUEST)}
            />
        ),
    },
    {
        value: JOB_STATUS.ARCHIVED,
        label: (
            <GetIconForThisStatus
                desc={GetJobStatusDesc(JOB_STATUS.ARCHIVED)}
                key={GetJobStatusDesc(JOB_STATUS.ARCHIVED)}
            />
        ),
    },
];

//#endregion

//#region  - admin/BroadcastMessages

export const adminBroadcastMessagesTableHeader = "Messages";
export const adminBroadcastColumnCreatedOn = "createdOn";
export const adminDatabaseTableHeader = "Databases";
export const adminServiceUsersTableHeader = "Service Users";

export const messageSeverity = [
    { value: "1", label: "High" },
    { value: "2", label: "Medium" },
    { value: "3", label: "Low" },
];

export const DATA_NOT_AVALIBLE = "Data not avalible at the moment";

export const CREATE_NEW_STUDY = "Extract Data";
export const CREATE_A_NEW_STUDY = "Create A New Study";
export const ALL_PROJECTS = "All Projects";
export const BACK_TO_ALL_PROJECTS = "Back to Projects";
export const ADD_USERS = "Add Users";

export const USER = "User";
export const CO_OWNER = "Co-Owner";

export const radioOptionsProjectUserRole = [
    { value: "1", label: USER },
    { value: "2", label: CO_OWNER },
];

export const projectTeamTableHeader = "Project Team";

//#endregion

//#region - Default API Response Messages (User-Facing)

export const FORGOT_PASSWORD_SUCCESS =
    "If an account is linked to this email, you'll receive a password reset link shortly. Please check your inbox.";
export const QR_RESET_SUCCESS_MSG =
    "If an account is linked to this email, you'll receive an email with instructions shortly. Please check your inbox.";

//#endregion

//#region - Multiple Records

export const MR_TITLE = "Multiple Records and Time Series data";

export const CONSULTATIONS = "Get Consultation Information?";
export const TIMESERIES = "Is this a Time Series Extract?";
export const LENGTH = "Specify the length of the Time Interval for your time series";

export const TYPE_OF_RECORD = "Type of records";

export const TYPE_OF_CONS_RECORD = "Type of consultation records";

export const MR_RECORDS_DEFAULT_ALL = "all";
export const MR_RECORDS = [
    { label: "All Records in the database", value: MR_RECORDS_DEFAULT_ALL },
    { label: "Records between Index date and Exit date", value: "between" },
    { label: "Records after Index date", value: "afterindex" },
    { label: "Records before Index date", value: "beforeindex" },
    { label: "Records before Exit date", value: "beforeexit" },
];

//#endregion

export const STUDY_DRUGS = 13;
export const STUDY_MEDS = 14;
export const STUDY_AHD = 15;

export const CASE_DRUGS = 1;
export const CASE_MEDS = 2;
export const CASE_AHD = 3;

export const CONTROL_DRUGS = 4;
export const CONTROL_MEDS = 5;
export const CONTROL_AHD = 6;

export const BASELINE_DRUGS = 7;
export const BASELINE_MEDS = 8;
export const BASELINE_AHD = 9;

export const OUTCOME_DRUGS = 10;
export const OUTCOME_MEDS = 11;
export const OUTCOME_AHD = 12;

export const UNEDITABLE_FILE = -999;

export const MEDICAL_FILE_TYPE = [STUDY_MEDS, CASE_MEDS, CONTROL_MEDS, BASELINE_MEDS, OUTCOME_MEDS];

export const CONTACT_ADMIN_MESSAGE = "Something went wrong. Please Connect with the Administrator.";

export const STATUS_FILTER = {
    ACTIVE: 1,
    DELETED: 0,
    ALL: -1,
};

export const REMOVE_FROM_BANK_RESULT = {
    DELETED: "deleted",
    NOT_AUTHORIZED: "NotAuth",
};

export const CLIENT_STATUS_DESC = {
    DELETED: "Deleted",
    ACTIVE: "Active",
    EXPIRED: "Expired",
    FUTURE: "Prospect",
};

export const CANNOT_DELETE = "You do not have access to perform this delete action.";

export const CODE_BUILDER_TYPE = {
    MEDICAL: "medical",
    DRUG: "drug",
    AHD: "AHD",
};

export const CODE_BUILDER_OR_DELIMITER = "___OR___";

export const DESC = "description:";
export const DATA_ID = "dataid:";
export const MEDICAL_CODE1 = "clinicalcode1:";
export const MEDICAL_CODE2 = "clinicalcode2:";
export const BNF1 = "bnf1:";
export const BNF2 = "bnf2:";
export const BNF3 = "bnf3:";
export const ATC = "atc:";

export const CODE_BUILDER_SEARCH_MODE = {
    SIMPLE: "simple",
    ADVANCED: "advanced",
    UPLOAD: "upload",
};

export const textOperatorForAdvancedSearch = [
    { name: "contains", value: "contains", label: "contains" },
    { name: "=", value: "=", label: "equals" },
    { name: "beginsWith", value: "beginsWith", label: "begins with" },
    { name: "endsWith", value: "endsWith", label: "ends with" },
    { name: "doesNotContain", value: "doesNotContain", label: "does not contain" },
    { name: "doesNotBeginWith", value: "doesNotBeginWith", label: "does not begin with" },
    { name: "doesNotEndWith", value: "doesNotEndWith", label: "does not end with" },
];

export const numericalOperatorForAdvancedSearch = [
    { name: "=", value: "=", label: "=" },
    { name: "!=", value: "!=", label: "!=" },
    { name: "<", value: "<", label: "<" },
    { name: ">", value: ">", label: ">" },
];

export const databaseOperatorForAdvancedSearch = [{ name: "=", value: "=", label: "=" }];

export const CB_LOCAL_STORAGE_KEYS = {
    TYPE: "searchType",
    SIMPLE_SEARCH_FILTER: "simpleSearchFilter",
    ADVANCED_SEARCH_FILTER: "advanceSearchFilter",
    CODES_TO_FILTER: "codeToFilter",
    SHORTLISTED_CODES: "shortlistedCodes",
    SHORTLISTED_INDEXES: "shortlistedIndexes",
};

export const PRIORITY_LABEL = {
    LOW: "Low",
    NORMAL: "Normal",
    HIGH: "High",
    HIGHEST: "Highest",
};

export const PRIORITY_VALUE = {
    [PRIORITY_LABEL.LOW]: 0,
    [PRIORITY_LABEL.NORMAL]: 1,
    [PRIORITY_LABEL.HIGH]: 2,
    [PRIORITY_LABEL.HIGHEST]: 3,
};

export const INCIDENCE = "Incidence";
export const PREVALENCE = "Prevalence";
export const SUBGROUP = "Subgroup";
export const OVERALL = "Overall";

export const INCIDENCE_PREVALENCE_OPTIONS = {
    INCIDENCE: {
        LABEL: INCIDENCE,
        NAME: "incidence",
    },
    PREVALENCE: {
        LABEL: PREVALENCE,
        NAME: "prevalence",
    },
    OVERALL: {
        LABEL: OVERALL,
        NAME: OVERALL,
    },
    SUBGROUP: {
        LABEL: SUBGROUP,
        NAME: SUBGROUP,
    },
};

export const StudyWizardLabels = {
    STUDY_DESIGN: "Study Details",
    STUDY_POPULATION: "Study Population",
    EXPOSED: "Exposed",
    EXPOSED_FOR_CASE_CONTROL: "Case",
    EXPOSED_FOR_INC_PREV_AND_CROSS_SEC: "Population",
    UNEXPOSED: "Unexposed",
    UNEXPOSED_FOR_CASE_CONTROL: "Control",
    MATCH: "Matching",
    MULTIPLE_RECORDS: "Multiple Records",
    MULTIPLE_RECORDS_AND_SUBMIT: "Multiple Records & Submit",
    BASELINE: "Baseline",
    BASELINE_FOR_INC_PREV_AND_CROSS_SEC: "Variables",
    BASELINE_FOR_INC_PREV_AND_CROSS_SEC_AND_SUBMIT: "Variables & Submit",
    BASELINE_FOR_CASE_CONTROL: "Baseline and Risk Factors",
    OUTCOME: "Outcome",
    OUTCOME_AND_SUBMIT: "Outcome & Submit",
    SUBMIT: "Submit",
};

export const POLICY = {
    PRIVACY: "privacy",
    COOKIE: "cookie",
};

export const THEME_COLOR = {
    DARK: "#90caf9",
    LIGHT: "#1976d2",
};

// Coupled with backend variable - MFAState.
// If you add or remove a variable here, please update frontend as well
export const MFA_STATE = {
    FIRST_VALIDATION_PENDING: "FIRST_VALIDATION_PENDING",
    VALIDATION_PENDING: "VALIDATION_PENDING",
    NOT_REGISTERED: "NOT_REGISTERED",
    SUCCESS: "SUCCESS",
    FAILED: "FAILED",
    STALE_USER: "STALE_USER",
};

export const MFA_TYPE = {
    QR: "QR",
    EMAIL: "EMAIL",
};

export const EmailVerificationStatus = {
    SUCCESS: "SUCCESS",
    RETRY: "RETRY",
    FAILED: "FAILED",
};

export const RESET_OPTIONS = {
    PASSWORD: "pwd",
    QR: "qr",
};

export const WILDCARD_TOOLTIP =
    " WILDCARDS[* _ %] Use * _ and % wildcards in your search. E.g., *Type 1 diabetes finds codes ending with the term, Type 1 diabetes* finds codes starting with it, and *Type 1 diabetes* finds codes containing it. Use _ to match a single character (Type _ diabetes matches Type 1, Type 2, etc.), and % for zero or more characters (hyp%tion matches hypersecretion, hyperpigmentation, etc.).";

export const CODE_LIST_NAMING_CONVENTION =
    'Code list names should only include the relevant clinical term, e.g., "LungDisease" for lung disease code list. Dexter automatically logs the creator\'s ID, creation date, and the target database system for each code list. Please use simple, generic names without personal additions to ensure broader accessibility. Alphanumeric and Underscore Allowed (No Spaces), Max length of 60 characters.';

export const INPUT_TYPE_TEXT = "text";
export const INPUT_TYPE_PASSWORD = "password";

export const PROTOCOL_MANDATORY = "Mandatory";
export const PROTOCOL_OPTIONAL = "Optional";

export const DATABASE_FIELDS = [
    { name: "databaseHostAddress", label: "Database host address" },
    { name: "databasePort", label: "Database port" },
    { name: "databaseUsername", label: "Database username" },
    { name: "databasePassword", label: "Database password" },
    { name: "practiceTable", label: "Practice table name" },
    { name: "defaultPractices", label: "Default practices" },
    { name: "ahdCategories", label: "AHD categories file location" },
    { name: "directory", label: "Output directory" },
];

export const SSH_FIELDS = [
    { name: "sshHostAddress", label: "SSH host address" },
    { name: "sshUsername", label: "SSH username" },
    { name: "sshKey", label: "SSH key location" },
    { name: "sshKeyPassword", label: "SSH key password" },
    { name: "knownHosts", label: "Known hosts file location" },
];

export const DOCUMENTATION_CARDS = [
    {
        title: "Governance",
        content:
            "Before you get started have a quick look over what you can and cannot do with your data",
        to: "/help/governance",
    },
    {
        title: "My Databases",
        content: "A list of all the databases you have access to and some documentation on them",
        to: "/help/mydatabases",
    },
    {
        title: "Projects on Dexter",
        content:
            "Learn what projects are on Dexter, how you can use them to create your studies and to collaborate  ",
        to: "/help/projects",
    },
    {
        title: "Phenotype Library",
        content:
            "Get to know how to create, view and edit phenotypes for your Electronic Health Record (EHR) databases on Dexter.",
        to: "/help/phenotypelibrary",
    },
    {
        title: "Study Designs",
        content:
            "Refresh your memory on various study designs offered on Dexter and the general process of how they work",
        to: "/help/designs",
    },
    {
        title: "Extracting data",
        content:
            "Learn how to effectively use each component and understand various options they offer while extracting data.",
        to: "/help/designs/studyperiod",
    },
    {
        title: "Study protocols",
        content:
            "Study protocols ensures adherence to ethics and scientific standards. Learn how to manage them on Dexter.",
        to: "/help/studyprotocols",
    },
];

export const AUTHENTICATION_TOKEN_LABEL = "Multi-factor Authentication (MFA) token";

export const FULLDB = "fulldb";

export const PHENOTYPE_NAME_MAX_LENGTH = 35;

export const PHENOTYPE_STATE = {
    DRAFT: "DRAFT",
    UNDER_REVIEW: "REVIEW",
    APPROVED: "APPROVED",
    PUBLIC_RELEASE: "PUBLIC",
    REJECTED: "REJECTED",
};

function getIconAndColorForStatus(status) {
    switch (status) {
        case PHENOTYPE_STATE.DRAFT:
            return <NoteAltOutlined />;
        case PHENOTYPE_STATE.UNDER_REVIEW:
            return <PlagiarismOutlined color={SNACK_SEVERITY.WARNING} />;
        case PHENOTYPE_STATE.APPROVED:
            return <VerifiedOutlined color="primary" />;
        case PHENOTYPE_STATE.REJECTED:
            return <BlockOutlined color={SNACK_SEVERITY.ERROR} />;
        case PHENOTYPE_STATE.PUBLIC_RELEASE:
            return <VerifiedOutlined color={SNACK_SEVERITY.SUCCESS} />;
        default:
            return status;
    }
}

export const GetIconForThisCodeStatus = props => {
    const defaultCursor = { cursor: "default" };
    const { status } = props;
    const title = props.tooltip ? props.tooltip : status;

    return (
        <Tooltip title={title}>
            <IconButton style={defaultCursor} aria-label={title}>
                {getIconAndColorForStatus(status)}
            </IconButton>
        </Tooltip>
    );
};

export const DATE_TIME_FORMAT = "dd MMM yyyy HH:mm";

export const STUDY_PROTOCOL_TITLE_MAXLENGTH = 255;
export const STUDY_PROTOCOL_DESCRIPTION_MAXLENGTH = 1000;
export const CONTENT_TYPE_APPLICATION_PDF = "application/pdf";
export const CHECKBOX_CONFRIMATION_MSG =
    "I confirm, the document I am uploading has been approved by the Scientific/Ethics committee.";
export const ADD_NEW_STUDY_PROTOCOL_WARNING_HEADER_MSG =
    "Please only upload the official approved document. No work in progress or drafts.";
export const ADD_NEW_STUDY_PROTOCOL_WARNING_MSG =
    "Your protocol must have received approval from the relevant scientific and ethics committee before it can be submitted here. Drafts, working versions, or documents still under review will not be accepted. Uploading the wrong document may delay your study approval.";

//App Left-hand Drawer width
export const drawerWidth = 240;

export const ARCHIVED_PROJECT_MSG = "Archived project. Action not allowed.";

//#region-Codebuilder
export const MEDICAL_CODELIST_DOCUMENTATION_TEMPLATE =
    '<table style="width: 755px"><colgroup><col style="width: 284px"><col style="width: 471px"></colgroup><tbody><tr><th colspan="1" rowspan="1" colwidth="284"><p>Description of phenotype</p></th><td colspan="1" rowspan="1" colwidth="471"><p></p></td></tr></tbody></table><p></p><table style="width: 755px"><colgroup><col style="width: 284px"><col style="width: 276px"><col style="width: 195px"></colgroup><tbody><tr><th colspan="1" rowspan="1" colwidth="284"><p>Resources used to identify existing phenotypes</p></th><th colspan="1" rowspan="1" colwidth="276"><p>Link</p></th><th colspan="1" rowspan="1" colwidth="195"><p>Yes/No</p></th></tr><tr><td colspan="1" rowspan="1" colwidth="284"><p>OpenSAFELY</p></td><td colspan="1" rowspan="1" colwidth="276"><p>https://codelists.opensafely.org/</p></td><td colspan="1" rowspan="1" colwidth="195"><p></p></td></tr><tr><td colspan="1" rowspan="1" colwidth="284"><p>HDRUK Phenotype library</p></td><td colspan="1" rowspan="1" colwidth="276"><p>Phenotype Library | HDRUK (healthdatagateway.org)</p></td><td colspan="1" rowspan="1" colwidth="195"><p></p></td></tr><tr><td colspan="1" rowspan="1" colwidth="284"><p>QOF</p><p>(please check for the latest QOF)</p><p></p><p>NHS Digital Primary Care Domain</p><p>Reference sets</p></td><td colspan="1" rowspan="1" colwidth="276"><p>https://app.powerbi.com/view?r=eyJrIjoiNDRmYjEwMzQtZGE3MS00ZGE5LTgwMTUtNjQ2NGE1NTZiYmEzIiwidCI6IjM3YzM1NGIyLTg1YjAtNDdmNS1iMjIyLTA3YjQ4ZDc3NGVlMyJ9</p></td><td colspan="1" rowspan="1" colwidth="195"><p></p></td></tr><tr><td colspan="1" rowspan="1" colwidth="284"><p>AI MULTIPLY – long term conditions</p></td><td colspan="1" rowspan="1" colwidth="276"><p>https://github.com/Fabiola-Eto/MULTIPLY-Initiative/tree/main/MULTIPLY_ProdcodeID_CPRD_Aurum</p></td><td colspan="1" rowspan="1" colwidth="195"><p></p></td></tr><tr><td colspan="1" rowspan="1" colwidth="284"><p>NHS Digital Clusters (good for drugs</p><p>and AHD codes)</p></td><td colspan="1" rowspan="1" colwidth="276"><p>https://app.powerbi.com/view?r=eyJrIjoiZTEwOTA1MjUtNjVhMi00NGRhLWFhZGQtNmY2Mjc2MmU3OGIxIiwidCI6IjUwZjYwNzFmLWJiZmUtNDAxYS04ODAzLTY3Mzc0OGU2MjllMiIsImMiOjh9</p></td><td colspan="1" rowspan="1" colwidth="195"><p></p></td></tr><tr><td colspan="1" rowspan="1" colwidth="284"><p>NHS medication browser</p></td><td colspan="1" rowspan="1" colwidth="276"><p>https://applications.nhsbsa.nhs.uk/DMDBrowser/DMDBrowser.do#</p></td><td colspan="1" rowspan="1" colwidth="195"><p></p></td></tr></tbody></table><p></p><table style="width: 755px"><colgroup><col style="width: 755px"></colgroup><tbody><tr><th colspan="1" rowspan="1" colwidth="755"><p>Publications searched</p></th></tr><tr><td colspan="1" rowspan="1" colwidth="755"><p>1.</p></td></tr><tr><td colspan="1" rowspan="1" colwidth="755"><p>2.</p></td></tr></tbody></table><p></p><table style="width: 756px"><colgroup><col style="width: 530px"><col style="width: 226px"></colgroup><tbody><tr><th colspan="1" rowspan="1" colwidth="530"><p>Stem code checked</p></th><th colspan="1" rowspan="1" colwidth="226"><p>Yes/No</p></th></tr><tr><td colspan="1" rowspan="1" colwidth="530"><p>Read code</p></td><td colspan="1" rowspan="1" colwidth="226"><p></p></td></tr><tr><td colspan="1" rowspan="1" colwidth="530"><p>Aurum/SnoMED-CT NHSDigital SNOMED CT Browser (termbrowser.nhs.uk)</p></td><td colspan="1" rowspan="1" colwidth="226"><p></p></td></tr><tr><td colspan="1" rowspan="1" colwidth="530"><p>ICD-10 https://icd.who.int/browse10/2019/en#/</p></td><td colspan="1" rowspan="1" colwidth="226"><p></p></td></tr></tbody></table><p></p><table style="width: 758px"><colgroup><col style="width: 758px"></colgroup><tbody><tr><th colspan="1" rowspan="1" colwidth="758"><p><strong>List the search terms / stem codes included (add rows as needed)</strong></p><p>Unified Medical Language System Metathesaurus https://uts.nlm.nih.gov/uts/umls/home</p></th></tr><tr><td colspan="1" rowspan="1" colwidth="758"><p></p></td></tr><tr><td colspan="1" rowspan="1" colwidth="758"><p></p></td></tr><tr><td colspan="1" rowspan="1" colwidth="758"><p></p></td></tr></tbody></table><p></p><table style="width: 759px"><colgroup><col style="width: 759px"></colgroup><tbody><tr><th colspan="1" rowspan="1" colwidth="759"><p>List the search terms excluded or filtered out (add rows as needed)</p></th></tr><tr><td colspan="1" rowspan="1" colwidth="759"><p></p></td></tr><tr><td colspan="1" rowspan="1" colwidth="759"><p></p></td></tr><tr><td colspan="1" rowspan="1" colwidth="759"><p></p></td></tr></tbody></table>';
export const DRUG_CODELIST_DOCUMENTATION_TEMPLATE =
    '<table style="width: 727px"><colgroup><col style="width: 256px"><col style="width: 471px"></colgroup><tbody><tr><th colspan="1" rowspan="1" colwidth="256"><p>Description of codelist</p></th><td colspan="1" rowspan="1" colwidth="471"><p></p></td></tr></tbody></table><p></p><table style="width: 771px"><colgroup><col style="width: 299px"><col style="width: 472px"></colgroup><tbody><tr><th colspan="1" rowspan="1" colwidth="299"><p>Resources used to identify existing drug codelists</p></th><th colspan="1" rowspan="1" colwidth="472"><p>Link</p></th></tr><tr><td colspan="1" rowspan="1" colwidth="299"><p>NICE treatment summaries</p></td><td colspan="1" rowspan="1" colwidth="472"><p>https://bnf.nice.org.uk/treatment-summary/</p></td></tr><tr><td colspan="1" rowspan="1" colwidth="299"><p>Athena</p></td><td colspan="1" rowspan="1" colwidth="472"><p>https://athena.ohdsi.org/search-terms/start</p></td></tr><tr><td colspan="1" rowspan="1" colwidth="299"><p>NHS medication browser tool</p></td><td colspan="1" rowspan="1" colwidth="472"><p>https://applications.nhsbsa.nhs.uk/DMDBrowser/DMDBrowser.do#</p></td></tr><tr><td colspan="1" rowspan="1" colwidth="299"><p>OpenPrescribing BNF chapter</p></td><td colspan="1" rowspan="1" colwidth="472"><p>https://openprescribing.net/bnf/</p></td></tr><tr><td colspan="1" rowspan="1" colwidth="299"><p>drug CPRD GOLD Codelists</p></td><td colspan="1" rowspan="1" colwidth="472"><p>CPRD product code lists of the potentially prescribed ... https://bmjopen.bmj.com › inline-supplementary-material-1</p></td></tr><tr><td colspan="1" rowspan="1" colwidth="299"><p>Medscape</p></td><td colspan="1" rowspan="1" colwidth="472"><p>https://reference.medscape.com/drugs</p></td></tr><tr><td colspan="1" rowspan="1" colwidth="299"><p>Condition specific?</p></td><td colspan="1" rowspan="1" colwidth="472"><p>https://www.epilepsy.org.uk/info/treatment/uk-anti-epileptic-drugs-list https://www.diabetes.org.uk/guide-to-diabetes/managing-your-diabetes/treating-your-diabetes/tablets-and-medication</p></td></tr></tbody></table><p></p><table style="width: 730px"><colgroup><col style="width: 730px"></colgroup><tbody><tr><th colspan="1" rowspan="1" colwidth="730"><p>List the search terms included (add rows as needed)</p></th></tr><tr><td colspan="1" rowspan="1" colwidth="730"><p></p></td></tr><tr><td colspan="1" rowspan="1" colwidth="730"><p></p></td></tr><tr><td colspan="1" rowspan="1" colwidth="730"><p></p></td></tr></tbody></table><p></p><table style="width: 730px"><colgroup><col style="width: 730px"></colgroup><tbody><tr><th colspan="1" rowspan="1" colwidth="730"><p>List the search terms excluded or filtered out (add rows as needed)</p></th></tr><tr><td colspan="1" rowspan="1" colwidth="730"><p></p></td></tr><tr><td colspan="1" rowspan="1" colwidth="730"><p></p></td></tr><tr><td colspan="1" rowspan="1" colwidth="730"><p></p></td></tr></tbody></table>';
//#endregion

export const MAX_PWD_LENGTH = 72;
export const MIN_PWD_LENGTH = 12;

// Used to determine the type of operation being performed
export const OperationTypeEnum = {
    NONE: 0,
    ADD: 1,
    UPDATE: 2,
    DELETE: 3,
    DOWNLOAD: 4,
    SEARCH: 5,
};

// Additional character limit for max char length props to show Error message
export const BUFFER_CHAR_LIMIT_FOR_MAX_CHAR_LENGTH_PROPS = 1;

export const CLINICAL_CODELIST_THERAPY_LABEL = "clinicalCodeListTherapy";
export const CLINICAL_CODELIST_MEDICAL_LABEL = "clinicalCodeListMedical";
export const CLINICAL_CODELIST_GENERIC_LABEL = "clinicalCodeList";
export const AHD_BEAN_LIST_LABEL = "ahdBeanList";

export const NOTIFICATION_TYPE = {
    SUCCESS: "success",
    ERROR: "error",
    WARNING: "warning",
    INFO: "info",
    CONFIRM: "confirm",
};
