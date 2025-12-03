import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Typography from "@mui/material/Typography";
import ClientInformation from "./ManageClient";
import { observer } from "mobx-react";
import clientListStore from "../../../state/store/admin/clients/list";
import clientStore, { INITIAL_STATE } from "../../../state/store/admin/clients/details";
import { useLocation, useNavigate } from "react-router-dom";
import { filterEmptyValues, formatDate, isDeepEqual } from "../../../utils";
import { Resources } from "./ManageResource";
import { Users } from "./ManageUser";
import { AccessDenied, BasicButton } from "../../Common";
import session from "../../../state/store/session";
import { Grid2 as Grid } from "@mui/material";
import events from "../../../lib/events";
import { ShowSuccess, ShowWarning } from "../../../componentsV2/Common/Toast";
import { Confirm } from "../../../componentsV2/Common/Confirm";

const steps = ["Client Information", "Resources", "Users"];

export const NavigationButtons = observer(props => {
    const { activeStep, handleBack, handleNext } = props;
    const disable = !clientStore.client?.name || clientStore.client?.name === "";

    return (
        <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <BasicButton
                color="inherit"
                variant="text"
                disabled={activeStep === 0}
                handleClick={handleBack}
                sx={{ mr: 1 }}
                buttonText="Back"
            />
            <Box sx={{ flex: "1 1 auto" }} />
            <BasicButton
                color="primary"
                variant="text"
                handleClick={handleNext}
                disabled={disable}
                buttonText={activeStep === steps.length - 1 ? "Finish" : "Next"}
            />
        </Box>
    );
});

const ClientWizard = observer(() => {
    const [activeStep, setActiveStep] = React.useState(0);
    const [action, setAction] = React.useState("");
    const currClient = clientStore?.currentClient ?? {};

    const CLIENT_ACTIONS = { ADD: "Add", EDIT: "Edit" };
    const CLIENT_ACTION_STEPS = {
        CLIENT: 0,
        RESOURCES: 1,
        USERS: 2,
    };

    const navigate = useNavigate();
    const location = useLocation();
    const path = location.pathname.substring(location.pathname.lastIndexOf("/") + 1);

    React.useEffect(() => {
        setAction(path);

        if (path === CLIENT_ACTIONS.EDIT && clientStore.client?.id === undefined) {
            routeToListPage();
        }

        (async () => {
            clientStore?.clientId !== undefined &&
                (await clientStore.loadClient(clientStore?.clientId));
        })();
    }, []);

    const isClientUpdated = () => {
        // Assigning the client from store to a new variable
        // Mobx warns when spread is used directly on store value
        // Also ignore databases field (if any) as its not needed while updating client information

        /* eslint no-unused-vars: "off" */
        const { databases, ...requiredClientDetails } = clientStore.client;

        const updatedClient = requiredClientDetails;

        return !isDeepEqual(
            {
                ...updatedClient,
                subdomains: filterEmptyValues(clientStore?.client?.subdomains),
            },
            currClient
        );
    };

    const validateDomain = (data, type) => {
        const allowedPattern =
            /\b((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\b/gm;
        if (allowedPattern.test(data)) {
            return true;
        } else {
            ShowWarning(
                `Only lowercase alphaNumeric, Dot and Hyphen allowed in ${type}: ${data}. Also must have a dot in between.`
            );
            return false;
        }
    };

    const handleClient = async () => {
        const filteredSubdomains = filterEmptyValues(clientStore?.client?.subdomains);
        const formattedStartDate = formatDate(clientStore.client?.startDate, "yyyy-MM-dd");
        const formattedEndDate = formatDate(clientStore.client?.endDate, "yyyy-MM-dd");

        if (formattedStartDate === formattedEndDate) {
            return ShowWarning("Start and End date cannot be same");
        }

        if (clientStore.client?.domain === "") {
            return ShowWarning("Domain cannot be empty. Please enter a valid domain");
        }

        const duplicateSubdomains = filteredSubdomains.filter(
            (item, index) => filteredSubdomains.indexOf(item) !== index
        );

        if (duplicateSubdomains?.length > 0) {
            return ShowWarning(
                `Sub domains contains duplicate entries ${duplicateSubdomains.toString()}. Please update and try again`
            );
        }

        let isSubdomainValid = true;
        const isDomainValid = validateDomain(clientStore.client?.domain, "Domain");

        for (let index = 0; index < filteredSubdomains.length; index++) {
            const element = filteredSubdomains[index];
            isSubdomainValid = validateDomain(element, "Subdomain");
            if (!isSubdomainValid) {
                return;
            }
        }

        const isValid = isDomainValid && isSubdomainValid;

        if (filteredSubdomains.indexOf(clientStore.client?.domain) > -1) {
            return ShowWarning("Domain and Subdomain cannot be same");
        }

        const payload = {
            ...clientStore.client,
            startdt: formattedStartDate,
            enddt: formattedEndDate,
            subdomains: filteredSubdomains,
        };
        delete payload.id;
        delete payload.endDate;
        delete payload.startDate;

        let message = "Client added successfully";
        let success = false;

        if (isValid) {
            if (action === CLIENT_ACTIONS.ADD) {
                success = await clientStore.add(payload);
            }

            if (action === CLIENT_ACTIONS.EDIT) {
                success = isClientUpdated() && (await clientStore.update(payload));
                message = "Client updated successfully";
            }
            if (success) {
                ShowSuccess(message);
                events.emit("client.changed");
                return true;
            }
            if (action === CLIENT_ACTIONS.EDIT && !isClientUpdated()) {
                return true;
            }
        } else {
            return false;
        }
    };

    const handleNext = async () => {
        if (activeStep === CLIENT_ACTION_STEPS.CLIENT) {
            const stepCompleted = await handleClient();
            stepCompleted && setActiveStep(prevActiveStep => prevActiveStep + 1);
            return;
        }

        if (activeStep === CLIENT_ACTION_STEPS.RESOURCES) {
            if (getChangesUnsavedStatus(activeStep)) {
                const { isConfirmed } = await Confirm(
                    "Changes made will be lost",
                    "Are you sure you want to leave this page?"
                );
                if (isConfirmed) {
                    setActiveStep(prevActiveStep => prevActiveStep + 1);
                    return;
                } else return;
            }
        }

        setActiveStep(prevActiveStep => prevActiveStep + 1);

        if (activeStep === steps.length - 1) {
            showListView();
        }
    };

    const handleBack = async () => {
        if (activeStep - 1 === CLIENT_ACTION_STEPS.CLIENT && action === CLIENT_ACTIONS.ADD) {
            setAction(CLIENT_ACTIONS.EDIT);
        }

        if (getChangesUnsavedStatus(activeStep)) {
            const { isConfirmed } = await Confirm(
                "Changes made will be lost",
                "Are you sure you want to go back?"
            );
            if (isConfirmed) {
                setActiveStep(prevActiveStep => prevActiveStep - 1);
            }
        } else {
            setActiveStep(prevActiveStep => prevActiveStep - 1);
        }
    };

    function getChangesUnsavedStatus(step) {
        switch (step) {
            case 0: {
                if (action === CLIENT_ACTIONS.ADD) {
                    return !isDeepEqual(clientStore.client, INITIAL_STATE);
                } else {
                    return currClient && isClientUpdated();
                }
            }
            default:
                return false;
        }
    }

    const routeToListPage = () => {
        clientListStore.invokeClientsListAPI(clientListStore.list?.length === 0);
        navigate("/admin/client");
    };

    const showListView = async () => {
        if (getChangesUnsavedStatus(activeStep)) {
            const { isConfirmed } = await Confirm(
                "Changes made will be lost",
                "Are you sure you want to leave this page?"
            );
            if (isConfirmed) {
                routeToListPage();
            }
        } else {
            routeToListPage();
        }
    };

    function clientComponent() {
        return <ClientInformation />;
    }

    function resourceComponent() {
        return <Resources />;
    }

    function userComponent() {
        return <Users />;
    }

    function getStepContent(step) {
        switch (step) {
            case 0:
                return clientComponent();
            case 1:
                return resourceComponent();
            case 2:
                return userComponent();
            default:
                return "Unknown step";
        }
    }
    const props = {
        handleNext,
        activeStep,
        handleBack,
        steps,
    };

    if (!session.isAdmin) {
        return <AccessDenied />;
    }

    //This check is needed so as to not render blank page when admin refreshes the page while editing a client
    if (path === CLIENT_ACTIONS.EDIT && clientStore.client?.id === undefined) {
        return;
    }

    return (
        <Grid container justifyContent={"center"}>
            <Grid
                size={{
                    xs: 12,
                    md: 11,
                    lg: 11,
                    xl: 10,
                }}
            >
                <Box sx={{ m: 2 }}>
                    <div style={{ textAlign: "left" }}>
                        <BasicButton
                            variant="outlined"
                            sx={{ m: 2 }}
                            handleClick={() => showListView()}
                            buttonText="Back to Clients"
                        />
                    </div>
                    {activeStep === steps.length ? (
                        <div style={{ marginTop: "45px", marginBottom: "16px" }}></div>
                    ) : (
                        <div>
                            <NavigationButtons {...props} />
                            <div style={{ marginBottom: "2rem" }}></div>
                        </div>
                    )}
                    <Stepper activeStep={activeStep}>
                        {steps.map((label, index) => {
                            const stepProps = {};
                            const labelProps = {};
                            return (
                                <Step key={label} {...stepProps}>
                                    <StepLabel {...labelProps}>{label}</StepLabel>
                                </Step>
                            );
                        })}
                    </Stepper>

                    {activeStep === steps.length ? null : (
                        <div>
                            <Typography sx={{ mt: 2, mb: 1, py: 1 }} component="div">
                                {getStepContent(activeStep)}
                            </Typography>
                            {/* TODO: To be enabled when required */}
                            {/* <NavigationButtons
                                    activeStep={activeStep}
                                    handleBack={handleBack}
                                    handleNext={handleNext}/> 
                              */}
                        </div>
                    )}
                </Box>
            </Grid>
        </Grid>
    );
});
export default ClientWizard;
