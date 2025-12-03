import React from "react";
import { observer } from "mobx-react";
import { formatQuery, QueryBuilder } from "react-querybuilder";
import session from "../../../state/store/session";
import codeBuilderCommonStore from "../../../state/store/codebuilder/common";
import "react-querybuilder/dist/query-builder.css";
import { ShowError } from "../../Common";

import {
    CODE_BUILDER_TYPE,
    databaseOperatorForAdvancedSearch,
    numericalOperatorForAdvancedSearch,
    textOperatorForAdvancedSearch,
} from "../../../constants";
import { QueryBuilderMaterial } from "@react-querybuilder/material";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";

const initialQuery = {
    rules: [],
};

const valueProcessor = (_, operator, value) => {
    value = value.toLowerCase();
    if (operator === "contains" || operator === "doesNotContain") {
        value = `*${value}*`;
    }
    if (operator === "beginsWith" || operator === "doesNotBeginWith") {
        value = `${value}*`;
    }
    if (operator === "endsWith" || operator === "doesNotEndWith") {
        value = `*${value}`;
    } else {
        value = `${value}`;
    }
    return encodeURIComponent(value).replaceAll("(", "%28").replaceAll(")", "%29");
};

const AdvancedSearch = observer(({ queryValue, setQueryValue, drugOrMedical, setToDisplay }) => {
    const user = session.loggedInUser;

    const isDrug = drugOrMedical === CODE_BUILDER_TYPE.DRUG;

    React.useEffect(() => {
        (async () => {
            codeBuilderCommonStore.userDatabasesFetched === false &&
                (await codeBuilderCommonStore.getDatabasesFor(user));
        })();
    }, []);

    if (codeBuilderCommonStore.loading) {
        return "loading..";
    }

    const databases = codeBuilderCommonStore.getUserDatabasesPlain();

    const fieldsForAdvMedicalSearch = [
        {
            name: "description",
            label: "Description",
            operators: textOperatorForAdvancedSearch,
        },
        {
            name: "dataid",
            label: "Medical Id",
            operators: textOperatorForAdvancedSearch,
        },
        {
            name: "clinicalcode1",
            label: "Medical Code",
            operators: textOperatorForAdvancedSearch,
        },
        {
            name: "clinicalcode2",
            label: "SnomedCT Code",
            operators: textOperatorForAdvancedSearch,
        },
        {
            name: "frequency",
            label: "Frequency",
            operators: numericalOperatorForAdvancedSearch,
        },
        {
            name: "dbname",
            label: "Database",
            valueEditorType: "select",
            values: databases,
            operators: databaseOperatorForAdvancedSearch,
        },
    ];

    const fieldsForAdvDrugSearch = [
        {
            name: "description",
            label: "Description",
            operators: textOperatorForAdvancedSearch,
        },
        {
            name: "dataid",
            label: "Drug Id",
            operators: textOperatorForAdvancedSearch,
        },
        {
            name: "bnf1",
            label: "BNF1 Chapter",
            operators: textOperatorForAdvancedSearch,
        },
        {
            name: "bnf2",
            label: "BNF2 Chapter",
            operators: textOperatorForAdvancedSearch,
        },
        {
            name: "bnf3",
            label: "BNF3 Chapter",
            operators: textOperatorForAdvancedSearch,
        },
        {
            name: "atc",
            label: "ATC Code",
            operators: textOperatorForAdvancedSearch,
        },
        {
            name: "frequency",
            label: "Frequency",
            operators: numericalOperatorForAdvancedSearch,
        },
        {
            name: "dbname",
            value: "dbname",
            label: "Database",
            valueEditorType: "select",
            values: databases,
            operators: databaseOperatorForAdvancedSearch,
        },
    ];

    const fields = isDrug ? fieldsForAdvDrugSearch : fieldsForAdvMedicalSearch;

    function logQuery(query) {
        // Always ensure query is an object
        if (typeof query === "string") {
            try {
                query = JSON.parse(query);
            } catch {
                ShowError("Error parsing query string");
                query = initialQuery;
            }
        }

        let sql = formatQuery(query, {
            format: "sql",
            valueProcessor,
        });
        setToDisplay(sql);

        let replaceSQL = sql
            .replaceAll(" not like ", "@")
            .replaceAll(" like ", ":")
            .replaceAll(" = ", "~")
            .replaceAll(" != ", "^")
            .replaceAll(" > ", ">")
            .replaceAll(" < ", "<");
        replaceSQL = replaceSQL
            .replaceAll("(", "(___")
            .replaceAll(")", "___)")
            .replaceAll(" and ", "___and___")
            .replaceAll(" or ", "___OR___");

        const obj = {
            jsonQuery: query,
            apiSQL: replaceSQL,
        };

        setQueryValue(obj);
    }

    const theme = useTheme();
    const customTheme = createTheme({
        ...theme,
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        backgroundColor: theme.palette.primary.main,
                    },
                },
            },
        },
    });

    return (
        <div style={{ width: "100%" }}>
            <ThemeProvider theme={customTheme}>
                <QueryBuilderMaterial>
                    <QueryBuilder
                        query={queryValue?.jsonQuery || initialQuery}
                        fields={fields}
                        onQueryChange={logQuery}
                    />
                </QueryBuilderMaterial>
            </ThemeProvider>
        </div>
    );
});

export default AdvancedSearch;
