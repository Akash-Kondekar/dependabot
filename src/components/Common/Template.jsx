import React from "react";
import {
    Button,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Stack,
} from "@mui/material";
import { DisplayPagination } from "./DisplayPagination";
import { makeStyles } from "@mui/styles";
import { Search } from "@mui/icons-material";
import { observer } from "mobx-react";

const useLocalStyles = makeStyles(() => ({
    root: {
        borderRadius: 7,
        minWidth: 256,
        textAlign: "center",
    },
}));

const Template = observer(props => {
    const {
        showSearchBox,
        showButton,
        showPagination,
        buttonText,
        handleBtnClick,
        ContentWidget,
        store,
        total,
    } = props;

    const classes = useLocalStyles();

    const setTerm = e => {
        store?.setTerm(e.target.value);
    };

    const onKeyUp = e => {
        if (e.charCode === 13) {
            store?.load();
        }
    };

    const search = async () => {
        store?.setPage("pageNo", 1);
        await store?.load();
    };

    const handleChange = async (data, page) => {
        store?.setPage("pageNo", page);
        store?.invokeClientsListAPI && store["invokeClientsListAPI"](true);
        await store?.load();
    };

    return (
        <div>
            <div>
                <Stack
                    direction="row"
                    spacing={2}
                    className={classes.root}
                    sx={{
                        margin: "16px 16px 0px 16px",
                        justifyContent: "flex-end",
                    }}
                >
                    <div style={{ width: "max-content" }}>
                        {showPagination && (
                            <DisplayPagination
                                page={store?.page?.pageNo}
                                pageCount={store?.page?.pageSize}
                                setCurrentPage={handleChange}
                                total={total}
                            />
                        )}
                    </div>

                    <div style={{ width: showSearchBox && "20%" }}>
                        {showSearchBox && (
                            <FormControl fullWidth variant="outlined" component="fieldset">
                                <InputLabel htmlFor="outlined-search-field">Search</InputLabel>

                                <OutlinedInput
                                    id="outlined-search-field"
                                    name="Search"
                                    label="Search Client"
                                    value={store["term"]}
                                    variant="filled"
                                    onChange={setTerm}
                                    onKeyUp={onKeyUp}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton onClick={search} edge="end">
                                                <Search />
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                />
                            </FormControl>
                        )}
                    </div>
                    <div style={{ width: showButton && "10%" }}>
                        {showButton && (
                            <Button variant="contained" onClick={() => handleBtnClick()}>
                                {buttonText}
                            </Button>
                        )}
                    </div>
                </Stack>
            </div>
            <ContentWidget />
        </div>
    );
});
export default Template;
