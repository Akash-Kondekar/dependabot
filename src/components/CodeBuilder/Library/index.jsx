import React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import BiotechIcon from "@mui/icons-material/Biotech";
import { TabPanel } from "../../Common/TabPanel";

import MedicalLibrary from "./Medical";
import DrugLibrary from "./Drug";
import AHDCodesLibrary from "./AHD";
import { useLocation } from "react-router-dom";
import { CODE_BUILDER_TYPE } from "../../../constants";
import { Box, Grid2 as Grid, Typography } from "@mui/material";

function useQuery() {
    const { search } = useLocation();

    return React.useMemo(() => new URLSearchParams(search), [search]);
}

function a11yProps(index) {
    return {
        id: `scrollable-force-tab-${index}`,
        "aria-controls": `scrollable-force-tabpanel-${index}`,
    };
}

const Library = () => {
    const query = useQuery();
    const ACTIVE_TAB = query.get("tab") === CODE_BUILDER_TYPE.DRUG ? 1 : 0;
    const [value, setValue] = React.useState(ACTIVE_TAB);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Grid justifyContent={"center"}>
            <Grid
                size={{
                    xs: 12,
                    md: 11,
                    lg: 11,
                    xl: 10,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column",
                    }}
                >
                    <Typography variant="h5" gutterBottom align="center" padding="10px">
                        Phenotype Library
                    </Typography>
                </Box>

                <Tabs
                    value={value}
                    centered
                    onChange={handleChange}
                    scrollButtons
                    indicatorColor="primary"
                    textColor="primary"
                    aria-label="scrollable force tabs example"
                    allowScrollButtonsMobile
                >
                    <Tab label="Medical Codes" icon={<NoteAddIcon />} {...a11yProps(0)} />
                    <Tab label="Drug Codes" icon={<VaccinesIcon />} {...a11yProps(0)} />
                    <Tab label="AHD Codes" icon={<BiotechIcon />} {...a11yProps(1)} />
                </Tabs>
                <TabPanel value={value} index={0}>
                    <MedicalLibrary />
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <DrugLibrary />
                </TabPanel>
                <TabPanel value={value} index={2}>
                    <AHDCodesLibrary />
                </TabPanel>
            </Grid>
        </Grid>
    );
};

export default Library;
