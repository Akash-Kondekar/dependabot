import { Chip, createFilterOptions } from "@mui/material";
import { Input } from "../../Common";
import Autocomplete from "@mui/material/Autocomplete";
import React from "react";

const filter = createFilterOptions();
export const AutocompleteUserTags = ({
    selectedUserTags,
    handleCreateNewUserTag,
    handleUserTagChange,
    handleChange,
    userTagAutoCompleteOptions,
    readOnly = false,
}) => {
    return (
        <Autocomplete
            multiple
            readOnly={readOnly}
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            id="tags-filled"
            options={userTagAutoCompleteOptions?.map(option => option.tag)}
            filterOptions={(options, params) => {
                const filtered = filter(options, params);
                const { inputValue } = params;
                // Suggest the creation of a new value
                const isExisting = options.some(option => inputValue === option);
                if (inputValue !== "" && !isExisting) {
                    filtered.push(inputValue);
                }
                return filtered;
            }}
            renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                    <li key={key} {...optionProps}>
                        {option}
                    </li>
                );
            }}
            getOptionLabel={option => {
                // for example value selected with enter, right from the input
                if (typeof option === "string") {
                    return option;
                }
                return option;
            }}
            freeSolo={selectedUserTags?.length < 5}
            getOptionDisabled={() => selectedUserTags.length > 4}
            renderTags={(value, getTagProps) =>
                value?.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                        <Chip
                            variant="filled"
                            label={option?.title !== undefined ? option.inputValue : option}
                            key={key}
                            {...tagProps}
                        />
                    );
                })
            }
            value={selectedUserTags}
            onChange={(event, value, reason) => {
                const newValue = value
                    .filter(x => !userTagAutoCompleteOptions.map(value1 => value1.tag).includes(x))
                    .filter(x => !selectedUserTags.map(value1 => value1).includes(x));
                if (reason === "createOption" || newValue.length > 0) {
                    handleCreateNewUserTag(event, newValue, reason);
                } else {
                    handleUserTagChange(value);
                }
            }}
            renderInput={params => {
                return (
                    <Input
                        onChange={e => {
                            if (selectedUserTags.length < 5) {
                                handleChange(e);
                            }
                        }}
                        {...params}
                        variant="outlined"
                        label="Tags (upto 5 tags allowed)"
                        placeholder="tags"
                    />
                );
            }}
        />
    );
};
