import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const CANVAS = 180;
// Card scaled to 75% of canvas, centered — leaves background visible on all sides
const CARD_SIZE = Math.round(CANVAS * 0.75); // 135
const OFFSET = (CANVAS - CARD_SIZE) / 2; // 22.5
const SCALE = CARD_SIZE / 32; // original viewBox is 32×32

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: CANVAS,
        height: CANVAS,
        display: "flex",
        backgroundColor: "#F3EFE0",
      }}
    >
      <svg
        width={CANVAS}
        height={CANVAS}
        viewBox={`0 0 ${CANVAS} ${CANVAS}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform={`translate(${OFFSET}, ${OFFSET}) scale(${SCALE})`}>
          {/* Drop shadow */}
          {/*<rect x="3" y="3" width="28" height="28" rx="6" fill="#1A1A1A" />*/}
          {/* Main card */}
          {/*<rect*/}
          {/*  x="1"*/}
          {/*  y="1"*/}
          {/*  width="28"*/}
          {/*  height="28"*/}
          {/*  rx="6"*/}
          {/*  fill="#F3EFE0"*/}
          {/*  stroke="#1A1A1A"*/}
          {/*  strokeWidth="2"*/}
          {/*/>*/}
          {/* Brain icon — lucide Brain, 18×18, centered in 30×30 */}
          <g
            transform="translate(5 4) scale(1)"
            stroke="#1A1A1A"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 18V5" />
            <path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4" />
            <path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5" />
            <path d="M17.997 5.125a4 4 0 0 1 2.526 5.77" />
            <path d="M18 18a4 4 0 0 0 2-7.464" />
            <path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517" />
            <path d="M6 18a4 4 0 0 1-2-7.464" />
            <path d="M6.003 5.125a4 4 0 0 0-2.526 5.77" />
          </g>
        </g>
      </svg>
    </div>,
    { width: CANVAS, height: CANVAS },
  );
}
