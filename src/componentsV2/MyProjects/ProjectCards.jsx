import React from "react";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import { formatDate } from "../../utils";
import session from "../../state/store/session";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import DomainIcon from "@mui/icons-material/Domain";
import { useTheme } from "@mui/material/styles";
import { DATE_FORMAT } from "../../config";
import { DisplayAvatar } from "../Common/Avatar.jsx";
import CardActionArea from "@mui/material/CardActionArea";
import { useNavigate } from "react-router-dom";
import projectDetailsStore from "../../state/store/projects/details.js";

export const ProjectCards = ({ projectName, project, searchTerm }) => {
    const projectDeleted = project.projectStatus < 0;
    const headerRef = React.useRef();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";

    const navigate = useNavigate();

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
                        color: isDarkMode ? "black" : "white", //to improve accessibility (contrast color)
                        backgroundColor: isDarkMode
                            ? theme.palette.primary.dark
                            : theme.palette.primary.main,
                    }}
                >
                    {part}
                </span>
            ) : (
                part
            );
        });
    };

    const projectCardDetails = {
        textOverflow: "ellipsis",
        overflow: "hidden",
        whiteSpace: "nowrap",
        display: "flex",
        alignContent: "center",
    };

    const foundStudiesStyle = {
        fontSize: "0.85rem",
        fontWeight: 300,
        textOverflow: "ellipsis",
        overflow: "hidden",
        whiteSpace: "nowrap",
    };

    const projectName2 = highlightText(projectName, searchTerm);

    return (
        <Tooltip title={<ProjectDetailTooltip />}>
            <Card
                variant="outlined"
                sx={{
                    height: "220px",
                    borderRadius: 8,
                    backgroundColor: isDarkMode ? "grey.main" : "grey.light",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: isDarkMode ? "grey.light" : "grey.main",
                }}
            >
                <CardActionArea
                    sx={{ height: "100%" }}
                    onClick={() => {
                        projectDetailsStore.setProject(project);
                        navigate("/projects/details/new");
                    }}
                >
                    <CardHeader
                        title={<b>{projectName2}</b>}
                        action={
                            projectDeleted && (
                                <Chip
                                    label="Archived"
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                />
                            )
                        }
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
                    <CardContent sx={{ minHeight: 110 }}>
                        {project?.studyNames?.length > 0 ? (
                            <Stack spacing={1}>
                                <Typography align="left" sx={foundStudiesStyle}>
                                    Studies found:
                                </Typography>
                                <Stack direction="column" sx={{ p: 0.5 }}>
                                    {Object.keys(project?.studyNames).map((item, index) => {
                                        const jobNames = project?.studyNames[item];
                                        return (
                                            <Typography
                                                key={index}
                                                align="left"
                                                sx={foundStudiesStyle}
                                            >
                                                {highlightText(jobNames, searchTerm)}
                                            </Typography>
                                        );
                                    })}
                                </Stack>
                            </Stack>
                        ) : (
                            <Stack spacing={1}>
                                <Stack direction="row" spacing={2} sx={{ p: 0.5 }}>
                                    <DisplayAvatar
                                        value={project.projectOwnerFullName}
                                        size="small"
                                        randomColor={true}
                                        fontSize="0.75rem"
                                    />
                                    <Typography
                                        align="left"
                                        component="span"
                                        sx={projectCardDetails}
                                    >
                                        {project.projectOwnerFullName}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" spacing={2} sx={{ p: 0.5 }}>
                                    <CalendarTodayOutlinedIcon />
                                    <Typography
                                        align="left"
                                        component="span"
                                        sx={projectCardDetails}
                                    >
                                        {formatDate(project.createdOn, DATE_FORMAT)}
                                    </Typography>
                                </Stack>
                                {session.isAdmin && (
                                    <Stack direction="row" spacing={2} sx={{ p: 0.5 }}>
                                        <DomainIcon />
                                        <Typography
                                            align="left"
                                            component="span"
                                            sx={projectCardDetails}
                                        >
                                            {project.clientName}
                                        </Typography>
                                    </Stack>
                                )}
                            </Stack>
                        )}
                    </CardContent>
                </CardActionArea>
            </Card>
        </Tooltip>
    );
};
