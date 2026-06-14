import { render, screen, fireEvent } from "@testing-library/react-native";
import { Text, View, TouchableOpacity } from "react-native";
import { describe, expect, it, beforeEach } from "vitest";

jest.mock("@/core/store/auth-store", () => ({
  useAuthStore: jest.fn(() => ({
    user: null,
    isAuthenticated: false,
    login: jest.fn(),
    logout: jest.fn(),
  })),
}));

function TestComponent({ onPress }: { onPress?: () => void }) {
  return (
    <View>
      <Text testID="title">Test Component</Text>
      <TouchableOpacity testID="button" onPress={onPress}>
        <Text>Click me</Text>
      </TouchableOpacity>
    </View>
  );
}

describe("TestComponent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render correctly", () => {
    render(<TestComponent />);
    expect(screen.getByText("Test Component")).toBeTruthy();
    expect(screen.getByText("Click me")).toBeTruthy();
  });

  it("should call onPress when button is pressed", () => {
    const mockOnPress = jest.fn();
    render(<TestComponent onPress={mockOnPress} />);

    fireEvent.press(screen.getByTestId("button"));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
