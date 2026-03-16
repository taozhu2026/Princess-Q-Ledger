import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #355f45 0%, #648a5f 46%, #f4eee3 100%)",
          color: "white",
          fontSize: 180,
          fontWeight: 700,
        }}
      >
        Q
      </div>
    ),
    size,
  );
}
