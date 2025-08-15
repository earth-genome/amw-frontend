import Select, { SingleValue, components, OptionProps } from "react-select";
import { AreasData, GeoJSONFeature } from "@/types/types";
import { AreaSelectOption } from "@/app/[lang]/components/AreaSelect";
import { AreaType } from "@/constants/map";
import { useMemo } from "react";

interface AreaSearchProps {
  areasData: AreasData;
  handleAreaSelect: (value: SingleValue<AreaSelectOption>) => void;
  selectedArea?: SingleValue<AreaSelectOption>;
  selectedAreaType: AreaType | undefined;
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
  areasData,
  handleAreaSelect,
  selectedArea,
  selectedAreaType,
  dictionary,
}: AreaSearchProps) => {
  const areaOptions = useMemo(
    () =>
      areasData?.features
        ?.filter((d: GeoJSONFeature) => d.properties?.id)
        ?.map((d: GeoJSONFeature) => d.properties)
        ?.map((d) => ({
          value: `${d.id}`,
          // label is used for searching
          label: selectedAreaType?.renderLabel
            ? selectedAreaType.renderLabel(d)
            : d.id,
          title: selectedAreaType?.renderTitle
            ? selectedAreaType.renderTitle(d) || dictionary?.map_ui?.unknown
            : d.id,
          status: selectedAreaType?.renderStatus
            ? selectedAreaType.renderStatus(d)
            : undefined,
          country: d.country,
          showCountry: selectedAreaType?.showCountry,
        }))
        ?.sort(
          (a, b) =>
            a?.country?.localeCompare(b?.country) ||
            a?.title?.localeCompare(b?.title)
        ),
    [areasData?.features, dictionary?.map_ui?.unknown, selectedAreaType]
  );

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
      style={{
        width: "250px",
      }}
    >
      <Select
        options={areaOptions}
        styles={customStyles}
        components={{
          Option: CustomOption,
        }}
        isSearchable={true}
        placeholder="Select an area..."
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
