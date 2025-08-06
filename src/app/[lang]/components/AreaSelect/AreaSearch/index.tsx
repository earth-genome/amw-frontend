import Select, { SingleValue } from "react-select";
import { AreasData, GeoJSONFeature } from "@/types/types";
import { AreaSelectOption } from "@/app/[lang]/components/AreaSelect";

interface AreaSearchProps {
  areasData: AreasData;
  handleAreaSelect: (value: SingleValue<AreaSelectOption>) => void;
  selectedArea?: SingleValue<AreaSelectOption>;
}

const AreaSearch = ({
  areasData,
  handleAreaSelect,
  selectedArea,
}: AreaSearchProps) => {
  const areaOptions = areasData?.features
    ?.filter(
      (d: GeoJSONFeature) => d.properties?.id && d.properties?.name_field
    )
    ?.map((d: GeoJSONFeature) => d.properties)
    ?.map((d) => ({
      value: `${d.id}`,
      label: `${d.country}: ${d.name_field}${
        d?.status_field ? ` - ${d.status_field}` : ""
      }`,
      country: d.country,
      name: d.name_field,
    }))
    ?.sort((a, b) => a.label.localeCompare(b.label));

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: "white",
      borderColor: state.isFocused ? "#22B573" : "transparent",
      borderWidth: "1px",
      boxShadow: state.isFocused ? "0 0 0 1px #22B573" : "none",
      "&:hover": {
        borderColor: "#22B573",
      },
      borderRadius: "5px",
      fontSize: "16px",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      textAlign: "left",
      fontSize: "14px",
      backgroundColor: state.isSelected
        ? "#003E36"
        : state.isFocused
        ? "#22B573"
        : "white",
      color: state.isSelected || state.isFocused ? "white" : "#003E36",
      "&:hover": {
        backgroundColor: "#22B573",
        color: "white",
      },
      borderRadius: "5px",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      fontSize: "14px",
      color: "#003E36",
      textAlign: "left",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      fontSize: "14px",
      color: "#006837",
      textAlign: "left",
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: "white",
      border: "none",
      borderRadius: "5px",
    }),
    menuList: (provided: any) => ({
      ...provided,
      padding: 0,
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      color: "#006837",
      "&:hover": {
        color: "#22B573",
      },
    }),
    indicatorSeparator: (provided: any) => ({
      ...provided,
      backgroundColor: "transparent",
    }),
  };

  return (
    <div
      style={{
        width: "250px",
      }}
    >
      <Select
        options={areaOptions}
        styles={customStyles}
        isSearchable={true}
        placeholder="Select an area..."
        onChange={handleAreaSelect}
        value={selectedArea}
      />
    </div>
  );
};

export default AreaSearch;
