"use client";
import { useContext } from "react";
import "./style.css";
import { Context } from "@/lib/Store";

interface FooterProps {
  dictionary: { [key: string]: any };
}

export type PERMITTED_AREA_UNITS = "hectares" | "squareKm" | "imperial";

export const AREA_UNITS_OPTIONS = [
  { value: "hectares" },
  { value: "squareKm" },
  { value: "imperial" },
];

const Footer = ({ dictionary }: FooterProps) => {
  const [state, dispatch] = useContext(Context)!;

  const handleUnitsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    dispatch({
      type: "SET_AREA_UNITS",
      areaUnits: value as PERMITTED_AREA_UNITS,
    });
  };

  return (
    <div className="footer">
      <div>
        {dictionary?.map_ui?.units}{" "}
        <select
          className="footer-units-select"
          value={state.areaUnits}
          onChange={handleUnitsChange}
        >
          <option value="hectares">{dictionary?.map_ui?.hectares}</option>
          <option value="squareKm">{dictionary?.map_ui?.squareKm}</option>
          <option value="imperial">{dictionary?.map_ui?.imperial}</option>
        </select>
      </div>
      <div>© Mapbox © OpenStreetMap</div>
    </div>
  );
};

export default Footer;
