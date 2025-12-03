import React from "react";
import { observer } from "mobx-react";
import { BasicButton, BuildQuery, CardHeader, Radiogroup } from "../Common";
import { radioOptionsStrictLoose } from "../../constants";
import extractJsonObject from "./Parser";
import { stringToBoolean } from "../../utils";
import { formatQuery } from "react-querybuilder";
import { Grid2 as Grid, Paper, Typography } from "@mui/material";
import { EditOutlined } from "@mui/icons-material";
import { useStyles } from "../useStyles";
import { useTheme } from "@mui/material/styles";

const Combination = observer(props => {
    const { code, mode, showOperators = true, identifier, tab } = props;
    const data = tab === "Population" ? code.data.population : code.data;
    const classes = useStyles();

    const parseStrictValue = data[identifier];

    const [queryValue, setQueryValue] = React.useState({
        jsonQuery: extractJsonObject(
            identifier.indexOf("case") !== -1 ? data["inclusion"] : data["exclusion"],
            "combi"
        ),
    });

    const [open, setOpen] = React.useState(false);
    const [obj, setObj] = React.useState([]);

    const handleQueryChange = query => {
        const { sqlQuery } = query;
        const parsedQuery = extractJsonObject(sqlQuery, "combi");
        const formattedQuery = formatQuery(parsedQuery, {
            format: "sql",
            valueProcessor: () => "",
        }).replace(/ =/g, "");

        const field = identifier.indexOf("case") !== -1 ? "inclusion" : "exclusion";
        code.set(field, formattedQuery);

        handleClose();
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleBuildQueryModal = () => {
        const codeNames = code.getIncludedCodeNames();
        setObj(codeNames);
        setOpen(true);
    };

    const queryBuilderProps = {
        open,
        handleClose,
        queryValue,
        setQueryValue,
        jsonQuery: queryValue.jsonQuery,
        description: obj,
        callback: handleQueryChange,
        showOperators,
    };
    const readOnly = mode === "modify" ? true : !code.hasIncludedCodes;
    const showCombination = code.hasIncludedCodes && code.getIncludedCodeNames()?.length > 1;

    const currentTheme = useTheme();
    const primaryColor = currentTheme.palette.primary.main;

    return (
        <>
            {showCombination && (
                <Paper
                    className={classes.paper}
                    style={{
                        border: readOnly ? "" : `1px solid ${primaryColor}`,
                        boxShadow: readOnly ? "" : `0 8px 8px -4px ${primaryColor}`,
                    }}
                >
                    <Grid spacing={1} container justifyContent={"space-between"}>
                        <Grid size={8}>
                            <CardHeader title="How do you want to combine the variables?" />
                        </Grid>
                        <Grid size={2}>
                            <BasicButton
                                size={"small"}
                                variant="outlined"
                                startIcon={<EditOutlined />}
                                handleClick={() => handleBuildQueryModal()}
                                buttonText="Combine"
                                disabled={readOnly}
                            />
                        </Grid>
                        <Grid style={{ alignSelf: "center" }} size={8}>
                            Should the selected variables occur in chronological order?
                        </Grid>
                        <Grid size={2}>
                            <Radiogroup
                                value={parseStrictValue === undefined ? false : parseStrictValue}
                                handleChange={e => {
                                    code.set(identifier, stringToBoolean(e.target.value));
                                }}
                                radioOptions={radioOptionsStrictLoose}
                                disabled={readOnly}
                            />
                        </Grid>

                        <Grid size={12}>
                            {identifier.indexOf("case") !== -1 ? (
                                data.inclusion === "(1 1)" ? (
                                    ""
                                ) : (
                                    <Typography variant={"body1"} color="info">
                                        {data.inclusion}
                                    </Typography>
                                )
                            ) : (
                                ""
                            )}
                            {identifier.indexOf("control") !== -1 ? (
                                data.exclusion === "(1 1)" ? (
                                    ""
                                ) : (
                                    <Typography variant={"body1"} color="info">
                                        {data.exclusion}
                                    </Typography>
                                )
                            ) : (
                                ""
                            )}
                        </Grid>
                    </Grid>
                </Paper>
            )}
            <BuildQuery {...queryBuilderProps} />
        </>
    );
});

export default Combination;
