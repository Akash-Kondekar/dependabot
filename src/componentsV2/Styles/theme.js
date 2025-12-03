import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import { blue } from "@mui/material/colors";

// Common component styles that are identical across themes
const commonComponents = {
    MUIDataTableToolbar: {
        styleOverrides: {
            root: { paddingLeft: "16px" },
        },
    },
    MuiPaginationItem: {
        styleOverrides: {
            root: props => ({
                backgroundColor: "transparent",
                color: props.theme.palette.primary.main,
                border: `1px solid ${props.theme.palette.pagination.border}`,
                borderRadius: 8,
                minWidth: "40px",
                height: "40px",
                margin: "0 2px",
                "&:hover": {
                    backgroundColor: props.theme.palette.pagination.backgroundHover,
                    border: `1px solid ${props.theme.palette.pagination.borderHover}`,
                },
                "&.Mui-selected": {
                    backgroundColor: props.theme.palette.primary.main,
                    color: "white",
                    "&:hover": {
                        backgroundColor: props.theme.palette.primary.dark,
                    },
                },
            }),
        },
    },
};

// Theme-specific configurations
const darkPalette = {
    mode: "dark",
    primary: {
        light: "#90caf9",
        main: "#90caf9",
        dark: "#42a5f5",
        darker: "#0b7dda",
        link: "#4CA6FF",
        image: "#fff", //to address default link color having accessibility issue
    },
    grey: {
        light: "#383838",
        main: "#1E1E1E",
        dark: "#808080",
        darker: "#000000",
        blackMetal: "#808080",
        background: "#1E1E1E",
    },
    imageColor: {
        main: "#FFFFFF",
    },
    pagination: {
        background: "rgba(255, 255, 255, 0.1)",
        backgroundHover: "rgba(255, 255, 255, 0.15)",
        border: "rgba(255, 255, 255, 0.2)",
        borderHover: "rgba(255, 255, 255, 0.3)",
    },
    button: {
        main: "#4CA6FF",
    },
    low: {
        color: "#afcce9",
        bgColor: "#214d78",
    },
    medium: {
        color: "#ffaf4d",
        bgColor: "#FFC0521A",
    },
    high: {
        color: "#f67a6f",
        bgColor: "#300703",
    },
    customWarning: {
        main: "#ad68001f",
    },
};

const lightPalette = {
    mode: "light",
    primary: {
        light: blue[50],
        main: "#1C75BC",
        dark: blue[800],
        darker: blue[900],
        link: "#1C75BC",
    },
    grey: {
        light: "#F6F8FA",
        main: "#E0E0E0",
        dark: "#BDBDBD",
        darker: "#9E9E9E",
        contrastText: "#000000",
        blackMetal: "#06060680",
        background: "#F6F8FA",
    },
    imageColor: {
        main: "#1C75BC",
    },
    pagination: {
        background: "transparent",
        backgroundHover: "rgba(0, 0, 0, 0.04)",
        border: "rgba(0, 0, 0, 0.12)",
        borderHover: "rgba(0, 0, 0, 0.2)",
    },
    button: {
        main: "#1C75BC",
    },
    low: {
        color: "#17609b",
        bgColor: "#e9f1f9",
    },
    medium: {
        color: "#b15102",
        bgColor: "#fff7ed",
    },
    high: {
        color: "#bd2828",
        bgColor: "#feecea",
    },
    customWarning: {
        main: "#FFF4E5",
    },
};

// Factory function to create themes
const createCustomTheme = palette => {
    let theme = createTheme({
        palette,
        components: commonComponents,
    });

    return responsiveFontSizes(theme);
};

// Create both themes (using the factory approach)
const darkTheme = createCustomTheme(darkPalette);
const lightTheme = createCustomTheme(lightPalette);

export { lightTheme, darkTheme };
