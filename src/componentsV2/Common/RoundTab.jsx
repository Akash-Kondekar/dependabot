import React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

// Helper function to generate proper ARIA props
function a11yProps(index) {
    return {
        id: `round-tab-${index}`,
        "aria-controls": `round-tabpanel-${index}`,
    };
}

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`round-tabpanel-${index}`}
            aria-labelledby={`round-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    <Typography component="span">{children}</Typography>
                </Box>
            )}
        </div>
    );
}

const RoundTab = props => {
    const {
        ACTIVE_TAB,
        TAB,
        TAB_PANEL,
        borderRadius = "30px",
        indicatorColor = "primary",
        textColor = "primary",
        tabMinWidth = "250px",
        tabBorderRadius = "30px",
        tabBackgroundColor = "primary.main",
        tabColor = "primary.contrastText",
    } = props;
    const [value, setValue] = React.useState(ACTIVE_TAB);

    const ariaLabel = props["aria-label"] ? props["aria-label"] : "round tabs";

    const theme = useTheme();

    const handleChange = (_, newValue) => {
        setValue(newValue);
    };

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor={indicatorColor}
                    textColor={textColor}
                    aria-label={ariaLabel}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{
                        border: `1px solid ${theme.palette.grey.dark}`,
                        borderRadius: borderRadius,
                        width: "max-content",
                        "& .MuiTabs-indicator": {
                            backgroundColor: "transparent",
                        },
                    }}
                >
                    {TAB?.map((tab, index) => (
                        <Tab
                            label={tab.label}
                            {...a11yProps(index)}
                            sx={{
                                minWidth: tabMinWidth,
                                "&.Mui-selected": {
                                    backgroundColor: tabBackgroundColor,
                                    borderRadius: tabBorderRadius,
                                    color: tabColor,
                                },
                            }}
                            key={`${tab.label}_${index}`}
                        />
                    ))}
                </Tabs>
            </Box>

            {TAB_PANEL?.map((tab, index) => (
                <TabPanel value={value} index={index} key={tab.key}>
                    {tab.content}
                </TabPanel>
            ))}
        </>
    );
};

export default RoundTab;
