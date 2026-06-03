import type { ReactElement } from "react";
import { useRef, useState } from "react";
import { PanResponder, Text, View } from "react-native";
import { colors } from "../theme/tokens";
import { font } from "../theme/fonts";

const MIN_AGE = 12;
const MAX_AGE = 90;
const THUMB = 28;

type AgeSliderProps = {
  value: number;
  onChange: (n: number) => void;
};

export function AgeSlider({ value, onChange }: AgeSliderProps): ReactElement {
  const trackWidth = useRef(1);
  const dragStartValue = useRef(value);

  const clampAge = (v: number) => Math.min(MAX_AGE, Math.max(MIN_AGE, Math.round(v)));

  const valueToRatio = (v: number) => (v - MIN_AGE) / (MAX_AGE - MIN_AGE);

  const ratioToValue = (r: number) => clampAge(MIN_AGE + r * (MAX_AGE - MIN_AGE));

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const x = e.nativeEvent.locationX;
        const r = Math.min(1, Math.max(0, x / trackWidth.current));
        const v = ratioToValue(r);
        onChange(v);
        dragStartValue.current = v;
      },
      onPanResponderMove: (_e, g) => {
        const deltaYears = (g.dx / trackWidth.current) * (MAX_AGE - MIN_AGE);
        onChange(clampAge(dragStartValue.current + deltaYears));
      },
    }),
  ).current;

  const ratio = valueToRatio(value);
  const [trackPx, setTrackPx] = useState(0);

  return (
    <View style={{ width: "100%", gap: 12, paddingTop: 8 }}>
      <View style={{ height: 40, justifyContent: "center" }}>
        <View
          style={{ height: 8, borderRadius: 4, backgroundColor: colors.slate200, overflow: "hidden" }}
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width;
            setTrackPx(w);
            trackWidth.current = Math.max(1, w);
          }}
          {...pan.panHandlers}
        >
          <View
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${ratio * 100}%`,
              backgroundColor: "#10B981",
            }}
          />
        </View>
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: Math.max(0, Math.min(trackPx > 0 ? trackPx - THUMB : 0, ratio * trackPx - THUMB / 2)),
            top: 6,
            width: THUMB,
            height: THUMB,
            borderRadius: THUMB / 2,
            backgroundColor: colors.white,
            borderWidth: 3,
            borderColor: "#10B981",
            shadowColor: "#0F172A",
            shadowOpacity: 0.12,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          }}
        />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
        <Text style={{ fontFamily: font.regular, fontSize: 12, color: colors.slate400 }}>{MIN_AGE}</Text>
        <Text style={{ fontFamily: font.regular, fontSize: 12, color: colors.slate400 }}>{MAX_AGE}</Text>
      </View>
    </View>
  );
}
