import type { ReactElement } from "react";
import { useCallback, useEffect, useRef } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { ScrollView, Text, View } from "react-native";
import { colors, radii } from "../theme/tokens";
import { font } from "../theme/fonts";

const ROW_H = 40;

type MetricPickerProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
};

export function MetricPicker({ label, value, min, max, onChange }: MetricPickerProps): ReactElement {
  const list = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const scrollRef = useRef<ScrollView>(null);
  const initialValueRef = useRef(value);

  const snapToIndex = useCallback(
    (idx: number) => {
      const clamped = Math.min(Math.max(0, idx), list.length - 1);
      onChange(list[clamped]);
      scrollRef.current?.scrollTo({ y: clamped * ROW_H, animated: true });
    },
    [list, onChange],
  );

  useEffect(() => {
    const idx = Math.min(Math.max(0, initialValueRef.current - min), list.length - 1);
    const id = requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: idx * ROW_H, animated: false });
    });
    return () => cancelAnimationFrame(id);
  }, [list.length, min]);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.round(y / ROW_H);
    snapToIndex(idx);
  };

  return (
    <View
      style={{
        flex: 1,
        borderRadius: radii.card,
        borderWidth: 1,
        borderColor: colors.slate200,
        backgroundColor: colors.white,
        paddingVertical: 12,
        paddingHorizontal: 12,
        maxHeight: 220,
      }}
    >
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ROW_H}
        decelerationRate="fast"
        onMomentumScrollEnd={onScrollEnd}
        onScrollEndDrag={onScrollEnd}
        contentContainerStyle={{ paddingVertical: ROW_H * 2 }}
      >
        {list.map((n) => {
          const dist = Math.abs(n - value);
          let fontSize = 15;
          let color = colors.slate200;
          let weightKey: "reg" | "big" = "reg";
          if (dist === 0) {
            fontSize = 34;
            color = colors.slate900;
            weightKey = "big";
          } else if (dist === 1) {
            fontSize = 18;
            color = colors.slate400;
          } else if (dist === 2) {
            fontSize = 15;
            color = colors.slate400;
          }
          return (
            <View key={n} style={{ height: ROW_H, alignItems: "center", justifyContent: "center" }}>
              <Text
                style={{
                  fontFamily: weightKey === "big" ? font.extrabold : font.regular,
                  fontSize,
                  color,
                }}
              >
                {n}
              </Text>
            </View>
          );
        })}
      </ScrollView>
      <Text
        style={{
          textAlign: "center",
          fontFamily: font.semibold,
          fontSize: 12,
          color: colors.slate500,
          marginTop: 4,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
