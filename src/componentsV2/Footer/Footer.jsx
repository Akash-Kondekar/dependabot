import React from "react";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ContactUs from "../ContactUs/ContactUs.jsx";
import { POLICY } from "../../constants/index.jsx";
import "../Styles/styles.css";
import { BasicLink } from "../Common/BasicLink.jsx";
import { useNavigate } from "react-router-dom";

const currentYear = new Date().getFullYear();

export const Footer = () => {
    const navigate = useNavigate();
    return (
        <>
            <Box
                className="footer"
                sx={{
                    bgcolor: "grey.main",
                    padding: "0px 20px",
                }}
            >
                <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
                    <Grid size={10}>
                        <div className="footerItems">
                            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                                <BasicLink
                                    buttonText="Privacy Policy"
                                    underline="hover"
                                    variant="subtitle1"
                                    fontWeight="inherit"
                                    handleClick={() =>
                                        navigate(`/policies/new?res=${POLICY.PRIVACY}`)
                                    }
                                />

                                <BasicLink
                                    buttonText="Cookie Policy"
                                    underline="hover"
                                    variant="subtitle1"
                                    fontWeight="inherit"
                                    handleClick={() =>
                                        navigate(`/policies/new?res=${POLICY.COOKIE}`)
                                    }
                                />

                                <ContactUs />
                            </Box>
                        </div>
                    </Grid>
                    <Grid size={2} sx={{ textAlign: "right" }}>
                        <Typography variant="subtitle1">© Dexter {currentYear}</Typography>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
};
