import Select, { SingleValue, components, OptionProps } from "react-select";
import { AreaSelectOption } from "@/app/[lang]/components/AreaSelect";
import { useContext, useMemo } from "react";
import { Context } from "@/lib/Store";

interface AreaSearchProps {
  handleAreaSelect: (value: SingleValue<AreaSelectOption>) => void;
  selectedArea?: SingleValue<AreaSelectOption>;
  dictionary: { [key: string]: any };
}

const CustomOption = (props: OptionProps<AreaSelectOption>) => {
  const { data, isSelected, isFocused } = props;

  return (
    <components.Option {...props}>
      <div>
        <div
          style={{
            fontWeight: 700,
            fontSize: "16px",
            marginBottom: "2px",
          }}
        >
          {data.title}
        </div>
        <div
          style={{
            marginBottom: "2px",
          }}
        >
          {data.status}
        </div>
        {data.showCountry && <div>{data.country}</div>}
      </div>
    </components.Option>
  );
};

const AreaSearch = ({
  handleAreaSelect,
  selectedArea,
  dictionary,
}: AreaSearchProps) => {
  const [state] = useContext(Context)!;
  const { areasOptions } = state;

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
      padding: "8px 12px",
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
      className="area-search-select-box"
    >
      <Select
        options={areasOptions}
        styles={customStyles}
        components={{
          Option: CustomOption,
        }}
        isSearchable={true}
        placeholder={dictionary?.map_ui?.select_area_placeholder}
        onChange={(newValue) =>
          handleAreaSelect(newValue as SingleValue<AreaSelectOption>)
        }
        getOptionLabel={(option) => option.label}
        value={selectedArea}
        menuShouldScrollIntoView={true}
      />
    </div>
  );
};

export default AreaSearch;
