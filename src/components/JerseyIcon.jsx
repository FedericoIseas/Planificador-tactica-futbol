/**
 * JerseyIcon — renders an SVG football jersey with an optional number.
 * Used both in the sidebar player tokens and on the pitch.
 */
export default function JerseyIcon({ number = '', size = 28, color = '#000', textColor = '#fff' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
      aria-hidden="true"
    >
      {/* Jersey body path */}
      <path
        d="M 10 8 L 2 14 L 7 18 L 7 36 L 33 36 L 33 18 L 38 14 L 30 8
           C 30 8 27 12 20 12 C 13 12 10 8 10 8 Z"
        fill={color}
        stroke={color === '#000' ? 'none' : '#000'}
        strokeWidth="0.5"
      />
      {/* Collar */}
      <path
        d="M 16 8 C 16 11 24 11 24 8"
        fill="none"
        stroke={textColor}
        strokeWidth="1.2"
      />
      {/* Number */}
      {number && (
        <text
          x="20"
          y="28"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={number.toString().length > 1 ? '11' : '13'}
          fontWeight="700"
          fontFamily="Inter, sans-serif"
          fill={textColor}
        >
          {number}
        </text>
      )}
    </svg>
  );
}
