import { Platform } from "react-native";

export default {
  fontFamily: Platform.select({
    ios: "System",
    android: "Roboto",
  }),
  sizes: {
    h1: 28,
    h2: 24,
    h3: 20,
    body: 16,
    small: 12,
  },
  weights: {
    bold: "700",
    medium: "500",
    regular: "400",
  },
};