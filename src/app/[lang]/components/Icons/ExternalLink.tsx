interface Props {
  width?: number;
  height?: number;
  fill?: string;
}

const ExternalLink = ({
  width = 14,
  height = 14,
  fill = "var(--green-dark)",
}: Props) => (
  <svg
    width={width}
    height={height}
    viewBox="2 2 20 20"
    xmlns="http://www.w3.org/2000/svg"
    fill={fill}
    aria-hidden="true"
    focusable="false"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5 18c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-5c0-.55.45-1 1-1s1 .45 1 1v6c0 1.1-.9 2-2 2H5
         c-1.1 0-2-.9-2-2V5c0-1.1.89-2 2-2h6c.55 0 1 .45 1 1s-.45 1-1 1H6c-.55 0-1 .45-1 1v12Zm10-13c-.55 0-1-.45-1-1s.45-1 1-1h5
         c.55 0 1 .45 1 1v5c0 .55-.45 1-1 1s-1-.45-1-1V6.41L9.87 15.54a.996.996 0 0 1-1.41 0c-.39-.39-.39-1.02 0-1.41L17.59 5H15Z"
    />
  </svg>
);

export default ExternalLink;
