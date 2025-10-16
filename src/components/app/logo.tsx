export default function Logo() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <path
        d="M16 2L2 9.5V22.5L16 30L30 22.5V9.5L16 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M23 7.5L9 14.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
       <path
        d="M16 30V16"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <text
        x="16"
        y="19"
        fontFamily="Inter, sans-serif"
        fontSize="5"
        fill="currentColor"
        textAnchor="middle"
        fontWeight="bold"
      >
        ISCAAL
      </text>
    </svg>
  );
}
