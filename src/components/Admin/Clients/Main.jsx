import React from "react";
import ClientList from "./List";
import { observer } from "mobx-react";
import clientListStore from "../../../state/store/admin/clients/list";
import clientStore from "../../../state/store/admin/clients/details";
import resourceStore from "../../../state/store/admin/clients/resources";
import usersStore from "../../../state/store/admin/clients/users";
import { useNavigate } from "react-router-dom";
import Content from "../../Common/Template";
import session from "../../../state/store/session";
import { AccessDenied } from "../../Common";
import { Grid2 as Grid } from "@mui/material";

const Main = observer(() => {
    const navigate = useNavigate();

    const addClient = () => {
        navigate("/admin/client/Add");
        clientStore.reset();
        resourceStore.reset();
        usersStore.reset();
    };

    if (!session.isAdmin) {
        return <AccessDenied />;
    }
    return (
        <div style={{ height: "max-content", width: "100%" }}>
            <Grid container justifyContent={"center"}>
                <Grid
                    size={{
                        xs: 12,
                        md: 11,
                        lg: 11,
                        xl: 10,
                    }}
                >
                    <Content
                        showSearchBox={false}
                        showButton={true}
                        showPagination={true}
                        buttonText="Add Client"
                        handleBtnClick={addClient}
                        ContentWidget={ClientList}
                        store={clientListStore}
                        total={clientListStore?.page?.totalElements}
                    />
                </Grid>
            </Grid>
        </div>
    );
});
export default Main;
