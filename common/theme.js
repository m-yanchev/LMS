import {createMuiTheme} from "@material-ui/core/styles";

function getTheme() {

    const theme = createMuiTheme()

    theme.breakpoints.values = {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1170,
        xl: 1920
    }

    theme.palette.background = {
        paper: "#ffffff",
        default: "#ffffff"
    }

    theme.palette.primary = {
        light: "#dfefff",
        main: "#4f74e3",
        dark: "#002060",
        contrastText: "#fff"
    }

    theme.palette.secondary = {
        light: "#ffdfef",
        main: "#d44f68",
        dark: "#600020",
        contrastText: "#fff"
    }

    theme.typography.barFont = {
        fontFamily: ["Roboto", "Helvetica", "Arial", "sans-serif"].join(","),
        fontWeight: 100,
        fontSize: "13pt"
    }

    return theme
}

export default getTheme