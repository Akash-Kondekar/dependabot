import React from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export const InputPassword = ({ MAX_PWD_LENGTH = -1, ...props }) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const handleMouseDownPassword = event => {
        event.preventDefault();
        setShowPassword(true);
    };

    const handleMouseUpPassword = event => {
        event.preventDefault();
        setShowPassword(false);
    };

    return (
        <>
            <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth={true}
                id={props?.id}
                label={props?.label}
                autoFocus={props?.autoFocus}
                autoComplete="off"
                type={showPassword ? "text" : "password"}
                slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label={
                                        showPassword ? "hide the password" : "display the password"
                                    }
                                    onMouseDown={handleMouseDownPassword}
                                    onMouseUp={handleMouseUpPassword}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                        inputProps: {
                            maxLength: MAX_PWD_LENGTH,
                        },
                    },
                }}
                {...props}
            />
            {MAX_PWD_LENGTH > -1 && props?.value?.length > MAX_PWD_LENGTH - 10 && (
                <div
                    style={{
                        fontSize: "smaller",
                        textAlign: "right",
                        width: "100%",
                    }}
                >
                    {props?.value?.length}/{MAX_PWD_LENGTH}
                </div>
            )}
        </>
    );
};
