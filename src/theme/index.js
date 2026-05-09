import colors from "./colors";
import typography from "./typography";
import spacing from "./spacing";

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius: {
    small: 6,
    medium: 12,
    large: 20,
    pill: 30,
  },
  shadow: {
    small: {
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    medium: {
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 5,
    },
  },
};