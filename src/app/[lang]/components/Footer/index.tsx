"use client";
import { useContext } from "react";
import "./style.css";
import { Context } from "@/lib/Store";

export type PERMITTED_AREA_UNITS = "hectares" | "squareKm" | "imperial";

export const AREA_UNITS_OPTIONS = [
  { value: "hectares", name: "Hectares", unitAbbrev: "hectares" },
  { value: "squareKm", name: "Square km", unitAbbrev: "km²" },
  { value: "imperial", name: "Imperial", unitAbbrev: "acres" },
];

export const getAreaUnitByKey = (key: PERMITTED_AREA_UNITS) =>
  AREA_UNITS_OPTIONS.find((d) => d.value === key);

const Footer = () => {
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
        Units{" "}
        <select 
          className="footer-units-select" 
          value={state.areaUnits}
          onChange={handleUnitsChange}
        >
          <option value="hectares">Hectares</option>
          <option value="squareKm">Square km</option>
          <option value="imperial">Imperial</option>
        </select>
      </div>
      <div>© Mapbox © OpenStreetMap</div>
    </div>
  );
};

export default Footer;