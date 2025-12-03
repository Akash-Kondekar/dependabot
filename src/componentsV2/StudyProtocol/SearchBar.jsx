import React, { useState, useEffect } from "react";
import InputAdornment from "@mui/material/InputAdornment";
import { Input } from "./../Common/Input";
import { OperationTypeEnum } from "../../constants";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { Typography } from "@mui/material";
import { useTheme } from "@emotion/react";

const SearchBar = ({ handleUserClick, errorText, lastSearchedTerm }) => {
    const [inputValue, setInputValue] = useState("");
    const theme = useTheme();

    useEffect(() => {
        // only update when parent resets
        setInputValue(lastSearchedTerm || "");
    }, [lastSearchedTerm]);

    const emitSearch = () => {
        handleUserClick({
            operationType: OperationTypeEnum.SEARCH,
            obj: {
                searchTerm: inputValue.trim() || null,
            },
        });
    };

    const handleKeyUp = event => {
        if (event.key === "Enter") {
            emitSearch();
        }
    };

    const handleTextChange = e => {
        const userEnteredText = e.target.value;
        setInputValue(userEnteredText);
        if (userEnteredText.length === 0) {
            handleUserClick({
                operationType: OperationTypeEnum.SEARCH,
                obj: {
                    searchTerm: null,
                },
            });
        }
    };

    return (
        <Input
            variant="outlined"
            fullWidth
            required
            error={errorText}
            helperText={errorText ? errorText : ""}
            autoFocus={true}
            slotProps={{
                input: {
                    sx: { borderRadius: 4 },
                    startAdornment: <SearchOutlinedIcon sx={{ mr: 1 }} />,
                    endAdornment: (
                        <InputAdornment position="end">
                            <Typography
                                variant="body2"
                                color={
                                    errorText
                                        ? "error"
                                        : !inputValue
                                          ? theme.palette.grey.dark
                                          : "primary"
                                }
                                aria-label="search"
                                edge="end"
                                disabled={!inputValue}
                                sx={{
                                    cursor: !inputValue ? "default" : "pointer",
                                    pl: 1,
                                    borderLeft: "1px solid",
                                }}
                                onClick={e => {
                                    !inputValue ? null : emitSearch(e);
                                }}
                            >
                                SEARCH
                            </Typography>
                        </InputAdornment>
                    ),
                },
            }}
            id="txtSearch"
            name="txtSearch"
            type="search"
            placeholder="Search protocols by title"
            margin="normal"
            value={inputValue}
            onKeyUp={handleKeyUp}
            onChange={e => handleTextChange(e)}
        />
    );
};

export default SearchBar;
