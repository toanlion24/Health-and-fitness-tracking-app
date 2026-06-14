import "@testing-library/jest-native/extend-expect";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

jest.mock("react-native-reanimated", () => ({
  default: {
    call: () => {},
    event: () => {},
    Value: jest.fn(),
    Node: jest.fn(),
    add: () => {},
    eq: () => {},
    set: () => {},
    cond: () => {},
    interpolate: () => {},
    View: jest.fn(),
    Text: jest.fn(),
    Image: jest.fn(),
    ScrollView: jest.fn(),
    FlatList: jest.fn(),
    SectionList: jest.fn(),
    TouchableOpacity: jest.fn(),
    createAnimatedComponent: (component) => component,
  },
  useSharedValue: jest.fn(() => ({ value: 0 })),
  useAnimatedStyle: jest.fn(() => ({})),
  withTiming: jest.fn((value) => value),
  withSpring: jest.fn((value) => value),
  withSequence: jest.fn(),
  withRepeat: jest.fn(),
  runOnJS: jest.fn((fn) => fn),
  runOnUI: jest.fn((fn) => fn()),
  interpolate: jest.fn(),
  Extrapolate: { CLAMP: "clamp" },
}));

jest.mock("react-native-gesture-handler", () => {
  const View = require("react-native/Libraries/Components/View/View");
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    longPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn((component) => component),
    Directions: {},
  };
});

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: { latitude: 10.7629, longitude: 106.6602 },
    })
  ),
}));

jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
  addNotificationReceivedListener: jest.fn(() => jest.fn()),
  addNotificationResponseReceivedListener: jest.fn(() => jest.fn()),
}));

jest.mock("i18next", () => ({
  t: (key) => key,
  use: () => ({
    init: jest.fn(),
  }),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
) as jest.Mock;
