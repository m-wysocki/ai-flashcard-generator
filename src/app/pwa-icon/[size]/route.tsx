import { ImageResponse } from "next/og";

const ALLOWED_SIZES = new Set(["192", "512"]);

function BrainIcon({ size }: { size: number }) {
  const scale = (size * 0.5) / 24;
  const offset = (size - 24 * scale) / 2;
  return (
    <g
      transform={`translate(${offset}, ${offset}) scale(${scale})`}
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
  );
}

export function generateStaticParams() {
  return [{ size: "192" }, { size: "512" }];
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ size: string }> },
) {
  const { size } = await params;
  if (!ALLOWED_SIZES.has(size)) {
    return new Response("Not found", { status: 404 });
  }
  const dimension = Number(size);
  return new ImageResponse(
    (
      <div
        style={{
          width: dimension,
          height: dimension,
          display: "flex",
          backgroundColor: "#F3EFE0",
        }}
      >
        <svg
          width={dimension}
          height={dimension}
          viewBox={`0 0 ${dimension} ${dimension}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <BrainIcon size={dimension} />
        </svg>
      </div>
    ),
    { width: dimension, height: dimension },
  );
}

export const dynamic = "force-static";
