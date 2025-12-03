import { DATE_FORMAT, DATE_TIME_FORMAT } from "../config";
import {
    AHD_BEAN_LIST_LABEL,
    ALL,
    ATC,
    BNF1,
    CLIENT_STATUS_DESC,
    DATA_ID,
    DESC,
    MEDICAL_CODE1,
    MEDICAL_CODE2,
    MEDICAL_FILE_TYPE,
    MIN_PWD_LENGTH,
    MR_RECORDS,
    MR_RECORDS_DEFAULT_ALL,
    nonFloatDataFiles,
} from "../constants";
import { format } from "date-fns";
import React from "react";
import _ from "lodash";
import { useLocation } from "react-router-dom";

export const addSlNo = inputArray => {
    let slCounter = 1;
    return inputArray.map(value => {
        return {
            slNo: slCounter++,
            ...value,
        };
    });
};

export const verticalAlign = value => {
    if (!value) return "";
    return Array.isArray(value) ? (value.length > 0 ? value.join("\n") : "") : value;
};

export const DExtERMinLogo = () => {
    return (
        <img style={{ height: 24 }} src={"/favicon.ico"} alt={"Dexter min logo"} loading="lazy" />
    );
};

export const DExtERFullLogo = ({ handleClick = () => null, style = {} }) => {
    return (
        <img
            style={{ width: 174, height: 64, ...style }}
            src={"/assets/img/Dexter-logo.png"}
            alt={"Dexter full logo"}
            loading="lazy"
            onClick={handleClick}
        />
    );
};

export const formatObjWithMultiDates = (rowData, dateFields) => {
    let formattedRowObj = { ...rowData };
    dateFields.map(dtField => {
        Object.keys(rowData).map(key => {
            if (dtField.trim() === key)
                formattedRowObj = {
                    ...formattedRowObj,
                    [key]: formatDate(rowData[key]),
                };
        });
    });

    return formattedRowObj;
};

export const formatObjWithMultiDateTimes = (rowData, dateFields) => {
    let formattedRowObj = { ...rowData };
    dateFields?.map(dtField => {
        Object.keys(rowData)?.map(key => {
            if (dtField?.trim() === key)
                formattedRowObj = {
                    ...formattedRowObj,
                    [key]: formatDateTime(rowData[key]),
                };
        });
    });

    return formattedRowObj;
};

export const formatDateFieldAndAddSlNo = (inputArray, dateField) => {
    let slCounter = 1;

    return inputArray.map(value => {
        const formattedRowValue = Array.isArray(dateField)
            ? formatObjWithMultiDates(value, dateField, format)
            : { ...value, [dateField]: formatDate(value[dateField]) };
        return {
            slNo: slCounter++,
            ...formattedRowValue,
        };
    });
};

export const formatDateTimeFieldAndAddSlNo = (inputArray, dateField) => {
    let slCounter = 1;

    return inputArray?.map(value => {
        const formattedRowValue = Array.isArray(dateField)
            ? formatObjWithMultiDateTimes(value, dateField, format)
            : { ...value, [dateField]: formatDateTime(value[dateField]) };
        return {
            slNo: slCounter++,
            ...formattedRowValue,
        };
    });
};

export const formatTextForResults = text => {
    text = text?.replaceAll(/\. */g, ".\n")?.replaceAll(/: */g, ":\n");
    return text;
};

export const formatHTMLTextForResults = text => {
    text = text
        ?.replaceAll(/\. */g, ".<br />&nbsp;&nbsp;&nbsp;&nbsp;")
        ?.replaceAll(/: */g, ":<br />&nbsp;&nbsp;&nbsp;&nbsp;");
    return text;
};

export const formatDateTime = (isoString, dtFormat = DATE_TIME_FORMAT) =>
    isoString ? format(new Date(isoString), dtFormat) : isoString;

export const formatDate = (date, dtFormat = DATE_FORMAT) =>
    date ? format(new Date(date), dtFormat) : date;

export const getUserFriendlyTime = timestamp => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
        return `${years} year${years > 1 ? "s" : ""} ago`;
    }
    if (months > 0) {
        return `${months} month${months > 1 ? "s" : ""} ago`;
    }
    if (weeks > 0) {
        return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    }
    if (days > 0) {
        return `${days} day${days > 1 ? "s" : ""} ago`;
    }
    if (hours > 0) {
        return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }
    if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    }
    if (seconds > 0) {
        return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
    }

    return "Just now";
};

/**
 * Creates a dynamic object with keys 'data1', 'data2', ..., 'dataN'
 * and values 'vdata1', 'vdata2', ..., 'vdataN'.
 * @param {number} length - The number of key-value pairs to generate. Default is 6 in Dexter.
 * @returns {object} The dynamically created object.
 */
export const createCodeObject = (length = 6) => {
    const need = {};
    for (let i = 1; i <= length; i++) {
        const key = `data${i}`;
        need[key] = `vdata${i}`;
    }
    return need;
};

export const prepareAHDCodes = data => {
    const need = createCodeObject();

    const havingTrue = Object.keys(need).filter(key => data[key] === true);
    //cover "ADDITIONAL" & "MEASUREMENT" datafile categories
    /*const float = havingTrue.map(
    (e) => e + "::float=" + data[need[e]] + "::float"
  );*/

    const float = (() => {
        return havingTrue.map(e => e + "::float=" + data[need[e]] + "::float");
    })();

    const nonFloat = (() => {
        let nonFloatValues = [];
        if (nonFloatDataFiles.includes(data?.datafile?.toUpperCase())) {
            nonFloatValues = havingTrue.map(e => e + "=" + data[need[e]]);
        }
        return nonFloatValues;
    })();

    if (data?.datafile?.toUpperCase() === "MEASUREMENT") {
        let arr = float;
        arr.forEach(function (part, index) {
            if (this[index].includes("data1::float")) {
                this[index] = this[index].replace("data1::float", "value");
            }
            if (this[index].includes("data2::float")) {
                this[index] = this[index].replace("data2::float", "units");
            }
            if (this[index].includes("data3::float")) {
                this[index] = this[index].replace("data3::float", "lowrange");
            }
            if (this[index].includes("data4::float")) {
                this[index] = this[index].replace("data4::float", "highrange");
            }
            if (this[index].includes("data5::float")) {
                this[index] = this[index].replace("data5::float", "data1::float");
                this[index + 2] = this[index].replaceAll("::float", "");
            }
            if (this[index].includes("data6::float")) {
                this[index] = this[index].replace("data6::float", "data2::float");
                this[index + 2] = this[index].replaceAll("::float", "");
            }
        }, arr);
    }
    return [...nonFloat, ...float];
};

export const stringToBoolean = string => {
    switch (string.toLowerCase().trim()) {
        case "true":
            return true;
        case "false":
            return false;
        default:
            return false;
    }
};

export const getDescriptionFromADHCode = code => {
    const output = [];
    code.split(",").forEach(item => {
        const details = item.split("=")[1];
        const name = item.split("=")[0];
        if (details !== "") output.push({ name, label: details });
    });
    return output;
};

export const convertUserRoleToID = status => {
    switch (status) {
        case "Moderator":
            return "2";
        case "User":
            return "1";
        case "Admin":
            return "3";
        case "Inactive":
            return "0";
        default:
            return "0";
    }
};

export const prepareData = (dropdownData, fields = {}) => {
    if (Object.keys(fields).length !== 0) {
        const { value, label } = fields;
        return dropdownData.map(item => {
            return {
                value: item[value],
                label: item[label],
            };
        });
    }
};

export const isDeepEqual = (object1, object2) => {
    return _.isEqual(object1, object2);
};

export const isValidDateRange = (from = new Date(), to = new Date(), allowEqualDates = false) => {
    const formattedFromDate = formatDate(from, "yyyy-MM-dd");
    const formattedToDate = formatDate(to, "yyyy-MM-dd");

    if (allowEqualDates && formattedFromDate === formattedToDate) {
        return true;
    }

    if (formattedFromDate >= formattedToDate) {
        return false;
    }

    return formattedToDate >= formattedFromDate;
};

export const isValidDateTimeRange = expiry => {
    const formattedExpiryDate = formatDateTime(expiry);
    const formattedCurrentDate = formatDateTime(new Date());
    return formattedExpiryDate >= formattedCurrentDate;
};

export function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
}

export const filterEmptyValues = data => {
    return data?.filter(item => item) ?? [];
};

export function addPercentIfRequired(input) {
    if (!input) {
        return;
    }

    return input.startsWith("*") || input.endsWith("*")
        ? encodeURIComponent(input)
        : encodeURIComponent("*" + input + "*");
}

export function clientStatus(client) {
    if (client.deleted) {
        return CLIENT_STATUS_DESC.DELETED;
    }

    const dateNow = formatDate(new Date(), "yyyy-MM-dd");

    if (client.endDate >= dateNow && client.deleted === false && client.startDate <= dateNow) {
        return CLIENT_STATUS_DESC.ACTIVE;
    }

    if (client.endDate < dateNow) {
        return CLIENT_STATUS_DESC.EXPIRED;
    }

    if (client.startDate > dateNow && client.endDate > dateNow) {
        return CLIENT_STATUS_DESC.FUTURE;
    }
}

export const CODE_BUILDER_SIMPLE_SEARCH_OPTIONS_FOR_MEDICAL = [
    { value: DESC, label: "Description" },
    { value: DATA_ID, label: "Medical Id" },
    { value: MEDICAL_CODE1, label: "Medical Code" },
    { value: MEDICAL_CODE2, label: "SnomedCT" },
    { value: ALL, label: ALL },
];

export const CODE_BUILDER_SIMPLE_SEARCH_OPTIONS_FOR_DRUG = [
    { value: DESC, label: "Description" },
    { value: DATA_ID, label: "Drug Id" },
    { value: BNF1, label: "BNF Code" },
    { value: ATC, label: "ATC Code" },
    { value: ALL, label: ALL },
];

export const getCodeBuilderLibrarySearchQuery = (keyword, codeName, userId, loggedInUser) => {
    const params = [];
    const SPLITTER = loggedInUser && loggedInUser.length > 0 ? "___AND___" : "___OR___";
    const NAME = "name:";
    const TAGS = "tags!";
    const OWNER = "owner:";
    const OWNER_FULLNAME = "ownerFullname:";
    const FAVONLY = "favoritesOnly=true";

    if (codeName && codeName.length > 0) {
        params.push(NAME + addPercentIfRequired(codeName.toLowerCase()));
    }

    if (keyword && keyword.length > 0) {
        params.push(TAGS + addPercentIfRequired(keyword.toLowerCase()));
    }

    if (userId && userId.length > 0) {
        params.push(
            "(___" +
                OWNER +
                addPercentIfRequired(userId.toLowerCase()) +
                "___OR___" +
                OWNER_FULLNAME +
                addPercentIfRequired(userId.toLowerCase()) +
                "___)"
        );
    }

    let query = params.length > 0 ? "?search=" + params.join(SPLITTER) : "";
    if (loggedInUser && loggedInUser.length > 0) {
        query = query + (query.length > 0 ? "&" : "?") + FAVONLY;
    }

    return query;
};

export const getDefaultMRvalue = () =>
    MR_RECORDS.filter(record => record.value === MR_RECORDS_DEFAULT_ALL);

export const allActiveClients = listOfClients => {
    const dateNow = formatDate(new Date(), "yyyy-MM-dd");

    return listOfClients?.filter(
        client =>
            client.endDate >= dateNow && client.deleted === false && client.startDate <= dateNow
    );
};

export const pluralize = (count, singular, plural) =>
    count === 1 ? `${count} ${singular}` : `${count} ${plural}`;

export const findCommonCodePairs = (CodeListArray1, CodeListArray2) => {
    // Array to store pairs with common codes
    const commonPairs = [];

    // Helper function to check if two code objects have common codes
    const findCommonCodes = (codes1, codes2) => {
        const codes1Keys = Object.keys(codes1);
        const codes2Keys = Object.keys(codes2);

        const commonCodes = {};
        codes1Keys.forEach(code => {
            if (codes2Keys.includes(code)) {
                commonCodes[code] = codes1[code];
            }
        });

        return commonCodes;
    };

    // Compare each exposure with each outcome
    CodeListArray1.forEach(exposure => {
        CodeListArray2.forEach(outcome => {
            const commonCodes = findCommonCodes(exposure.codes, outcome.codes);

            if (Object.keys(commonCodes).length > 0) {
                commonPairs.push({
                    exposure: exposure.filename,
                    outcome: outcome.filename,
                    commonCodes: commonCodes,
                });
            }
        });
    });

    return commonPairs;
};

export const findCommonCodePairsAHD = (exposureArray, outcomeArray) => {
    // Array to store pairs with common codes
    const commonPairs = [];

    // Compare each exposure with each outcome
    exposureArray.forEach(exposure => {
        outcomeArray.forEach(outcome => {
            if (outcome.ahdCode === exposure.ahdCode) {
                const commonCodes = {
                    code: exposure.ahdCode,
                };
                commonPairs.push({
                    exposure: exposure.label,
                    outcome: outcome.label,
                    commonCodes: commonCodes,
                });
            }
        });
    });

    return commonPairs;
};

export const formatFileSize = bytes => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const getFileSizeInHumanReadableFormat = (
    bytes,
    returnUnitInLowercase = false,
    needInBetweenSpace = true
) => {
    let strToShow = formatFileSize(bytes);
    if (returnUnitInLowercase) {
        strToShow = strToShow.replace(/Bytes|KB|MB/g, match => match.toLowerCase());
    }
    if (!needInBetweenSpace) {
        strToShow = strToShow.replace(/ /g, "");
    }
    return strToShow;
};

// Function to calculate "safe" character count for PostgreSQL varchar limits
export const getPostgresqlSafeLength = text => {
    if (!text) return 0;

    // Count how many newlines are in the string
    const newlineCount = (text.match(/\n/g) || []).length;

    // Add extra character for each newline to account for potential \r\n conversion
    return text.length + newlineCount;
};

export function useQuery() {
    const { search } = useLocation();

    return React.useMemo(() => new URLSearchParams(search), [search]);
}

export function isValidEmail(email) {
    if (email === "") {
        return false;
    }
    return /\S+@\S+\.\S+/.test(email) && email.toLowerCase() === email;
}

/**
 * Out-of-Sync Feature Utilities
 * These functions help detect and handle when medical/drug codes have been modified
 * in the code library after being added to a study.
 */

/**
 * Builds a fast lookup index for code items by id and by owner+name
 * @param {Object} codes - The codes store containing read and drug arrays
 * @param {int} fileType - The file type constant (e.g., BASELINE_MEDS, BASELINE_DRUGS)
 * @returns {Map} - A Map with composite keys for quick lookups
 */
export const buildCodeIndex = (codes, fileType) => {
    if (!codes || !codes.data) return new Map();

    // Determine which list to use based on fileType
    // Medical codes: use codes.data.read
    // Drug codes: use codes.data.drug
    const list = MEDICAL_FILE_TYPE.includes(fileType)
        ? codes.data.read || []
        : codes.data.drug || [];

    const map = new Map();
    for (const c of list) {
        const ownerEmail = (c?.owner ?? c?.modifiedBy ?? "").trim().toLowerCase();
        const codeName = (c?.name ?? "").trim().toLowerCase();
        if (ownerEmail && codeName) {
            map.set(`owner:${ownerEmail}|name:${codeName}`, c);
        }
        if (c?.id !== undefined) map.set(`id:${c.id}`, c);
    }
    return map;
};

/**
 * Gets a code item from the index by matching owner+name or id
 * @param {Object} row - The row data containing code information
 * @param {Map} codeIndex - The code index map
 * @returns {Object|null} - The matching code item or null
 */
export const getCodeItem = (row, codeIndex) => {
    if (!codeIndex || !row) return null;

    const ownerCandidate = (row?.owner ?? row?.lastModifiedBy ?? "").trim().toLowerCase();
    const filename = (row?.filename ?? "").trim().toLowerCase();
    const compositeKey =
        ownerCandidate && filename ? `owner:${ownerCandidate}|name:${filename}` : null;
    const byIdKey = row?.id !== undefined ? `id:${row.id}` : null;

    return (
        (compositeKey && codeIndex.get(compositeKey)) || (byIdKey && codeIndex.get(byIdKey)) || null
    );
};

/**
 * Gets the modified timestamp from a code item
 * @param {Object} row - The row data
 * @param {Map} codeIndex - The code index map
 * @returns {Object} - Object containing modifiedOn timestamp and id
 */
export const getCodeModifiedOn = (row, codeIndex) => {
    const item = getCodeItem(row, codeIndex);
    return {
        modifiedOn: item?.modifiedOn ?? item?.lastModifiedOn ?? item?.createdon ?? null,
        id: item?.id ?? null,
    };
};

/**
 * Gets the last modified timestamp from a row
 * @param {Object} row - The row data
 * @returns {string|null} - The timestamp or null
 */
export const getRowLastModifiedOn = row => {
    return row?.lastModifiedOn ?? row?.modifiedOn ?? null;
};

/**
 * Normalizes a timestamp to a comparable number
 * @param {*} v - The timestamp value
 * @returns {number|null} - Normalized timestamp or null
 */
export const normalizeTime = v => {
    if (!v) return null;
    const t = new Date(v);
    const n = t.getTime();
    return isNaN(n) ? null : n;
};

/**
 * Checks if a row's code is out of sync with the code library
 * @param {Object} row - The row data
 * @param {Map} codeIndex - The code index map
 * @param {string} type - The type of code list (e.g., "ahdBeanList", "clinicalCodeList")
 * @returns {number|boolean} - Returns the code id if out of sync, false otherwise
 */
export const isCodeOutOfSync = (row, codeIndex, type) => {
    if (type === AHD_BEAN_LIST_LABEL) return false; // AHD codes don't need sync checking

    const codeTimeRaw = getCodeModifiedOn(row, codeIndex);
    const rowTimeRaw = getRowLastModifiedOn(row);

    if (!codeTimeRaw || !rowTimeRaw) return false;

    const codeTime = normalizeTime(codeTimeRaw.modifiedOn);
    const rowTime = normalizeTime(rowTimeRaw);

    if (codeTime !== null && rowTime !== null) {
        return codeTime === rowTime ? false : codeTimeRaw.id;
    }

    return String(codeTimeRaw.modifiedOn) === String(rowTimeRaw.modifiedOn)
        ? false
        : codeTimeRaw.id;
};

/**
 * Formats a date for display in tooltips
 * @param {*} date - The date value
 * @returns {string} - Formatted date string
 */
export const formatDateForTooltip = date => {
    if (date === null) return "";
    const d = new Date(date);
    return isNaN(d.getTime()) ? String(date) : d.toLocaleString();
};
export function validatePasswordRules(value) {
    return {
        minLength: value.match(
            new RegExp("(?=.{<min-length>,})".replace("<min-length>", MIN_PWD_LENGTH))
        ),
        upper: value.match(/(?=.*[A-Z])/),
        lower: value.match(/(?=.*[a-z])/),
        number: value.match(/(?=.*[0-9])/),
        splChar: value.match(/[^a-z0-9]+/gi),
    };
}

export function encodeHTML(str) {
    str = String(str ?? "");
    const textarea = document.createElement("textarea");
    textarea.textContent = str;
    return textarea.innerHTML;
}

export function decodeHTML(str) {
    str = String(str ?? "");
    const textarea = document.createElement("textarea");
    textarea.innerHTML = str;
    return textarea.textContent;
}

// Replace certain characters with HTML encoded(escaped) values and calculate the length of the string.
export function getHTMLEncodedLength(str) {
    str = String(str ?? "");
    return str.replace(/[&<>"']/g, char => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        };
        return entities[char];
    }).length;
}

export function getHTMLEncodedLengthDiff(str) {
    str = String(str ?? "");
    return getHTMLEncodedLength(str) - str.length;
}

export function validateNumberInput(value) {
    const matchDigitRegex = /^$|^\d+$/;
    return matchDigitRegex.test(value);
}
