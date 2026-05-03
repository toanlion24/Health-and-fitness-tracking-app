import type { StackScreenProps } from "@react-navigation/stack";

export type ProgressStackParamList = {
  MetricsDashboard: undefined;
  /** BMI / BMR / TDEE — previous Progress home content. */
  HealthMetricsDetail: undefined;
  WeightDetail: undefined;
  AddWeight: undefined;
  CaloriesDetail: undefined;
  ActivityDetail: undefined;
  AppFlowMap: undefined;
};

export type ProgressStackScreenProps<T extends keyof ProgressStackParamList> = StackScreenProps<
  ProgressStackParamList,
  T
>;
