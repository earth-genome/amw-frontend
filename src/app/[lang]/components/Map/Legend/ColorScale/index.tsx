import { MAP_COLOR_SCALE } from "@/constants/map";

interface ColorScaleProps {
  dictionary: { [key: string]: any };
}

const ColorScale = ({ dictionary }: ColorScaleProps) => {
  if (!MAP_COLOR_SCALE?.length) return null;

  return (
    <div
      style={{
        margin: "8px 8px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          justifyItems: "center",
          marginBottom: 6,
          fontSize: 14,
          color: "var(--green-dark)",
        }}
      >
        <div>{dictionary?.map_legend?.old_mining_activity}</div>
        <div>{dictionary?.map_legend?.recent_mining_activity}</div>
      </div>
      <div
        style={{
          display: "flex",
          gap: 4,
          justifyItems: "center",
        }}
      >
        {MAP_COLOR_SCALE.map((color) => (
          <div
            key={color}
            style={{
              backgroundColor: color,
              height: 4,
              width: "100%",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorScale;
