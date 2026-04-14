import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type Props = {
  message?: string;
};

export function LoadingState({ message = "Loading..." }: Props) {
  return (
    <View style={styles.container} accessibilityRole="progressbar">
      <ActivityIndicator />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
  },
});
