import { ConfigProvider, Select } from "antd";
import { useCallback, useContext } from "react";
import "./style.css";
import { Context } from "@/lib/Store";
import AreaSearch from "@/app/[lang]/components/AreaSelect/AreaSearch";
import { AREA_TYPES, PERMITTED_AREA_TYPES_KEYS } from "@/constants/map";
import { SELECT_ANTD_THEME } from "@/utils/themes";

interface AreaSelectProps {
  dictionary: { [key: string]: any };
}

export interface AreaSelectOption {
  value: string;
  label: string;
  title: string;
  status?: string;
  country?: string;
  showCountry?: boolean;
}

const AreaSelect = ({ dictionary }: AreaSelectProps) => {
  const [state, dispatch] = useContext(Context)!;

  const {
    selectedArea,
    selectedAreaType,
    areasData,
    areasDataIsLoading,
    areasDataError,
    isEmbed,
  } = state;

  const setSelectedArea = useCallback(
    (selectedArea: AreaSelectOption | undefined) => {
      dispatch({
        type: "SET_SELECTED_AREA_BY_ID",
        selectedAreaId: selectedArea?.value,
      });
    },
    [dispatch],
  );

  const setSelectedAreaType = useCallback(
    (selectedAreaTypeKey: PERMITTED_AREA_TYPES_KEYS) => {
      dispatch({
        type: "SET_SELECTED_AREA_TYPE_BY_KEY",
        selectedAreaTypeKey: selectedAreaTypeKey,
      });
    },
    [dispatch],
  );

  const handleAreaSelect = (value: AreaSelectOption | undefined) => {
    setSelectedArea(value);
  };

  return (
    <div
      className="area-types-wrapper"
      style={{ top: isEmbed ? 20 : "calc(var(--top-navbar-height) + 10px)" }}
    >
      <div className="area-types-container">
        <div className="area-types">
          <ConfigProvider theme={SELECT_ANTD_THEME}>
            <Select
              className="area-types-select-box"
              value={selectedAreaType?.key}
              onChange={(d) =>
                setSelectedAreaType(d as PERMITTED_AREA_TYPES_KEYS)
              }
              options={AREA_TYPES.filter((d) =>
                // if we're in embed mode, only show certain areas for selection
                isEmbed
                  ? d.allowInEmbed
                  : true &&
                    // and we don't allow selecting certain area types (hotspots)
                    d.allowSelect,
              ).map((d) => ({
                value: d.key,
                label: dictionary?.map_ui?.[d.dictionaryKey],
                description:
                  d.dictionaryKeyDescription &&
                  dictionary?.map_ui?.[d.dictionaryKeyDescription],
              }))}
              optionRender={({ data: { label, description } }) => (
                <div>
                  <div>{label}</div>
                  {description && (
                    <div className="area-option-description">{description}</div>
                  )}
                </div>
              )}
            />
          </ConfigProvider>
        </div>
        <div className="area-select">
          {areasDataError ? (
            <div className="area-loading">{dictionary?.map_ui?.error}</div>
          ) : areasData && !areasDataIsLoading ? (
            <AreaSearch
              key={selectedAreaType?.key}
              handleAreaSelect={handleAreaSelect}
              selectedArea={selectedArea ?? undefined}
              dictionary={dictionary}
            />
          ) : (
            <div className="area-loading">{dictionary?.map_ui?.loading}...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AreaSelect;
