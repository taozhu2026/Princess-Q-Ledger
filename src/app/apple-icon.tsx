import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4eee3",
          color: "#355f45",
          borderRadius: 96,
          fontSize: 160,
          fontWeight: 700,
          border: "28px solid #355f45",
        }}
      >
        Q
      </div>
    ),
    size,
  );
}
