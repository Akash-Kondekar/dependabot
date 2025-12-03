import React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Container from "@mui/material/Container";
import { BasicLink } from "./BasicLink";

export const BasicStepper = ({
    activeStep,
    steps,
    handleBack,
    handleNext,
    disableBack = false,
    disableNext = false,
    hideBackButton = false,
    ...props
}) => {
    return (
        <Box width="100%">
            <Stepper activeStep={activeStep} alternativeLabel {...props}>
                {steps.map(label => {
                    const stepProps = {};
                    const labelProps = {};
                    return (
                        <Step key={label} {...stepProps}>
                            <StepLabel {...labelProps}>{label}</StepLabel>
                        </Step>
                    );
                })}
            </Stepper>
            <Container maxWidth="xl">
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        pt: 2,
                        justifyContent: "space-between",
                    }}
                >
                    {activeStep > 0 && !hideBackButton ? (
                        <BasicLink
                            buttonText="Back"
                            disabled={disableBack}
                            handleClick={handleBack}
                            displayArrow={true}
                        />
                    ) : (
                        <div />
                    )}
                    {activeStep < steps?.length - 1 && (
                        <BasicLink
                            buttonText="Next"
                            disabled={disableNext}
                            handleClick={handleNext}
                            displayArrowFwd={true}
                        />
                    )}
                </Box>
            </Container>
        </Box>
    );
};
