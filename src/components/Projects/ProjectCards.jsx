import React from "react";
import CardActionArea from "@mui/material/CardActionArea";
import Card from "@mui/material/Card";
import { Box, CardHeader, Chip, Divider, Tooltip, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import CardContent from "@mui/material/CardContent";
import { formatDate } from "../../utils";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import session from "../../state/store/session";
import projectDetailsStore from "../../state/store/projects/details";
import { DisplayAvatar } from "../Common";
import { AccessTime, Domain } from "@mui/icons-material";
import { useTheme } from "@emotion/react";
import { DATE_FORMAT } from "../../config";

const theme = createTheme({
    palette: {
        custom: {
            light: "#ffc167",
            main: "#ffa726",
            dark: "#e68a00",
            contrastText: "rgba(255,167,38, 0.8)",
        },
    },
    components: {
        MuiCardHeader: {
            styleOverrides: {
                content: {
                    overflow: "hidden",
                    width: "150px",
                },
                title: {
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                },
            },
        },
    },
});

const useLocalStyles = makeStyles(theme => ({
    root: {
        borderRadius: 7,
        textAlign: "center",
        boxShadow:
            "0px -2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 1px rgba(0,0,0,0.14), 0px -1px 3px 0px rgba(0,0,0,0.12)",
    },
    disabledRoot: {
        borderRadius: 7,
        textAlign: "center",
        backgroundColor: theme.palette.action.disabled,
    },
    header: {
        textAlign: "left",
        spacing: 10,
        width: "100%",
    },
    list: {
        paddingTop: "10px",
    },
    button: {
        margin: theme.spacing(1),
    },
    action: {
        display: "flex",
        justifyContent: "space-around",
    },
    purpleSmall: {
        color: "darkolivegreen",
        backgroundColor: "aliceblue",
    },
    CardContentBox: {
        display: "inline-flex",
        margin: "5px",
    },
    CardFooterBox: {
        alignContent: "center",
        textOverflow: "ellipsis",
        overflow: "hidden",
        whiteSpace: "nowrap",
        margin: "5px",
    },
}));

export const ProjectCards = ({ projectName, project, searchTerm }) => {
    const localClasses = useLocalStyles();
    const projectDeleted = project.projectStatus < 0;
    const headerRef = React.useRef();
    const currentTheme = useTheme();

    const ProjectDetailTooltip = () => {
        return (
            <>
                Name: {projectName} <br /> Owner: {project.projectOwnerFullName} <br /> Created on:{" "}
                {formatDate(project.createdOn, DATE_FORMAT)} <br />{" "}
                {session.isAdmin && (
                    <>
                        {`Client: ${project.clientName}`} <br />{" "}
                    </>
                )}
                {project?.studyNames?.length > 0 && (
                    <>
                        <span>Studies:</span>
                        {project.studyNames.map((study, index) => (
                            <React.Fragment key={index}>
                                <br />
                                {study}
                            </React.Fragment>
                        ))}
                    </>
                )}
            </>
        );
    };

    const escapeRegex = string => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };

    const highlightText = (text, searchTerm) => {
        if (!searchTerm) return text;

        const escapedSearchTerm = escapeRegex(searchTerm.trim());
        const regex = new RegExp(`(${escapedSearchTerm})`, "gi");
        const parts = text?.split(regex);

        return parts?.map((part, index) => {
            const matchRegex = new RegExp(`^${escapedSearchTerm}$`, "i");
            return matchRegex.test(part) ? (
                <span
                    key={index}
                    style={{
                        backgroundColor:
                            currentTheme.palette.mode === "dark"
                                ? currentTheme.palette.primary.dark
                                : currentTheme.palette.primary.light,
                    }}
                >
                    {part}
                </span>
            ) : (
                part
            );
        });
    };

    const projectName2 = highlightText(projectName, searchTerm);

    return (
        <Card className={localClasses.root}>
            <Tooltip title={<ProjectDetailTooltip />}>
                <CardActionArea
                    onClick={() => {
                        //This information is required when we click Back to Projects from Analytics portal
                        //so that the user can be sent to project from where they clicked on Analytics Icon.
                        projectDetailsStore.setProject(project);
                    }}
                >
                    <CardHeader
                        title={projectName2}
                        className={localClasses.header}
                        ref={headerRef}
                        sx={{
                            "& .MuiCardHeader-content": {
                                overflow: "hidden",
                                display: "block",
                            },
                            "& .MuiTypography-root": {
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            },
                        }}
                    />
                    <Divider variant="middle" />
                    <CardContent
                        sx={{ paddingBottom: projectDeleted ? "5px" : "16px", minHeight: 110 }}
                    >
                        <div>
                            {project?.studyNames?.length > 0 ? (
                                <>
                                    <Typography
                                        align="left"
                                        sx={{
                                            fontSize: "0.75rem",
                                            textOverflow: "ellipsis",
                                            overflow: "hidden",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        Studies found:
                                    </Typography>
                                    {Object.keys(project?.studyNames).map((item, index) => {
                                        const jobNames = project?.studyNames[item];
                                        return (
                                            <Typography
                                                key={index}
                                                align="left"
                                                sx={{
                                                    fontSize: "0.85rem",
                                                    fontWeight: 300,
                                                    textOverflow: "ellipsis",
                                                    overflow: "hidden",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {highlightText(jobNames, searchTerm)}
                                            </Typography>
                                        );
                                    })}
                                </>
                            ) : (
                                <>
                                    <Typography
                                        align="left"
                                        component={"span"}
                                        sx={{
                                            textOverflow: "ellipsis",
                                            overflow: "hidden",
                                            whiteSpace: "nowrap",
                                            display: "flex",
                                            alignContent: "center",
                                        }}
                                    >
                                        <Box className={localClasses.CardContentBox}>
                                            <DisplayAvatar
                                                value={project.projectOwnerFullName}
                                                size="small"
                                                randomColor={true}
                                                fontSize="0.75rem"
                                            />
                                        </Box>
                                        <Box className={localClasses.CardContentBox}>
                                            {project.projectOwnerFullName}
                                        </Box>
                                    </Typography>
                                    <Typography
                                        align="left"
                                        component={"span"}
                                        sx={{
                                            textOverflow: "ellipsis",
                                            overflow: "hidden",
                                            whiteSpace: "nowrap",
                                            display: "flex",
                                            alignContent: "center",
                                        }}
                                    >
                                        <Box className={localClasses.CardContentBox}>
                                            <AccessTime />
                                        </Box>
                                        <Box className={localClasses.CardContentBox}>
                                            {formatDate(project.createdOn, DATE_FORMAT)}
                                        </Box>
                                    </Typography>
                                </>
                            )}
                        </div>
                        {projectDeleted && (
                            <ThemeProvider theme={theme}>
                                <Chip
                                    label="Archived"
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    sx={{ float: "right", m: 0.5 }}
                                />
                            </ThemeProvider>
                        )}
                    </CardContent>
                    <Divider variant="middle" />

                    {session.isAdmin ? (
                        <Typography
                            align="left"
                            component="span"
                            sx={{
                                fontSize: "0.9rem",
                                display: "flex",
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                            }}
                        >
                            <Box className={localClasses.CardContentBox}>
                                <Domain />
                            </Box>
                            <Box className={localClasses.CardFooterBox}>{project.clientName}</Box>
                        </Typography>
                    ) : (
                        <div style={{ padding: "10px" }} />
                    )}
                </CardActionArea>
            </Tooltip>
        </Card>
    );
};
