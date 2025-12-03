import React, { useState } from "react";
import { Box, Container } from "@mui/material/";
import { formatQuery, QueryBuilder } from "react-querybuilder";
import { BasicButton } from "./BasicButton";
import CssBaseline from "@mui/material/CssBaseline";
import "react-querybuilder/dist/query-builder.css";
import { Grid2 as Grid } from "@mui/material";
import { QueryBuilderMaterial } from "@react-querybuilder/material";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import { ShowWarning } from "../../componentsV2/Common/Toast";

const operators = [
    { name: "=", value: "=", label: "=" },
    { name: "!=", value: "!=", label: "!=" },
    { name: "<", value: "<", label: "<" },
    { name: ">", value: ">", label: ">" },
    { name: "<=", value: "<=", label: "<=" },
    { name: ">=", value: ">=", label: ">=" },
];

const combinators = [
    { name: "AND", value: "and", label: "AND" },
    { name: "OR", value: "or", label: "OR" },
];

const initialQuery = {
    rules: [],
};

const style = {
    border: "1px solid",
    boxShadow: 24,
    p: 6,
};

export const BuildQuery = ({
    queryValue,
    setQueryValue,
    open,
    handleClose,
    jsonQuery,
    callback,
    description,
    showOperators = true,
    maxHeight = "30vw",
}) => {
    // Ensure jsonQuery is an object, not a string
    const safeJsonQuery = (() => {
        // If jsonQuery is undefined or null, return initialQuery
        if (!jsonQuery) return initialQuery;

        // If jsonQuery is a string, try to parse it
        if (typeof jsonQuery === "string") {
            try {
                return JSON.parse(jsonQuery);
            } catch {
                ShowWarning("Error parsing query string");
                return initialQuery;
            }
        }

        // Ensure the object has required properties
        if (!jsonQuery.id) {
            return {
                ...jsonQuery,
                id: crypto.randomUUID(),
            };
        }

        return jsonQuery;
    })();

    // Initialize with the safe query object
    const [query, setQuery] = useState(safeJsonQuery);

    function updateQuery(query) {
        // Always ensure query is an object
        if (typeof query === "string") {
            try {
                query = JSON.parse(query);
            } catch {
                ShowWarning("Error parsing query string");
                query = initialQuery;
            }
        }

        setQuery(query);

        const sqlQuery = showOperators
            ? formatQuery(query, "sql")
            : formatQuery(query, {
                  format: "sql",
                  valueProcessor: () => "",
              }).replace(/ =/g, "");

        const jsonQueryString = formatQuery(query, "json");

        const obj = {
            jsonQuery: jsonQueryString,
            sqlQuery,
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
        <Dialog
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={open}
            onClose={(event, reason) => {
                if (reason !== "backdropClick") {
                    handleClose(event, reason);
                }
            }}
            closeAfterTransition
            maxWidth="md"
            fullWidth
        >
            <Box sx={style}>
                <div>
                    <Container
                        component="main"
                        fixed
                        maxWidth={false}
                        sx={{ maxHeight: maxHeight, overflowY: "auto" }}
                    >
                        <CssBaseline />
                        <ThemeProvider theme={customTheme}>
                            <QueryBuilderMaterial>
                                {showOperators ? (
                                    <QueryBuilder
                                        combinators={combinators}
                                        query={query} // Ensure query is always an object
                                        showCombinatorsBetweenRules={true}
                                        fields={description}
                                        operators={operators}
                                        onQueryChange={updateQuery}
                                    />
                                ) : (
                                    <QueryBuilder
                                        combinators={[
                                            { name: "&", value: "&", label: "AND" },
                                            { name: "|", value: "|", label: "OR" },
                                        ]}
                                        showCombinatorsBetweenRules={true}
                                        fields={description}
                                        controlElements={{
                                            operatorSelector: () => null, // Hides operators
                                            valueEditor: () => null, // Hides value input
                                        }}
                                        query={query} // Ensure query is always an object
                                        onQueryChange={updateQuery}
                                    />
                                )}
                            </QueryBuilderMaterial>
                        </ThemeProvider>
                        {!showOperators && <div className="App">{queryValue.sqlQuery}</div>}
                        <br />
                        <Grid container justifyContent={"flex-end"} spacing={1}>
                            <Grid>
                                <BasicButton
                                    variant="outlined"
                                    handleClick={() => handleClose()}
                                    buttonText="Cancel"
                                />
                            </Grid>
                            <Grid>
                                <BasicButton
                                    handleClick={() => callback(queryValue)}
                                    buttonText="Save"
                                />
                            </Grid>
                        </Grid>
                    </Container>
                </div>
            </Box>
        </Dialog>
    );
};
