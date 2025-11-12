import { ConfigProvider, Radio, Select } from "antd";
import { useCallback, useContext, useEffect, useState } from "react";
import "./style.css";
import { Context } from "@/lib/Store";
import AreaSearch from "@/app/[lang]/components/AreaSelect/AreaSearch";
import { SingleValue } from "react-select";
import { AREA_TYPES, PERMITTED_AREA_TYPES_KEYS } from "@/constants/map";
const { Option } = Select;

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

  const { selectedArea, selectedAreaType, areasData, areasDataIsLoading } =
    state;

  const setSelectedArea = useCallback(
    (selectedArea: SingleValue<AreaSelectOption> | undefined) => {
      dispatch({
        type: "SET_SELECTED_AREA_BY_ID",
        selectedAreaId: selectedArea?.value,
      });
    },
    [dispatch]
  );

  const setSelectedAreaType = useCallback(
    (selectedAreaTypeKey: PERMITTED_AREA_TYPES_KEYS) => {
      dispatch({
        type: "SET_SELECTED_AREA_TYPE_BY_KEY",
        selectedAreaTypeKey: selectedAreaTypeKey,
      });
    },
    [dispatch]
  );

  const handleAreaSelect = (value: SingleValue<AreaSelectOption>) => {
    setSelectedArea(value);
  };

  return (
    <div className="area-types-wrapper">
      <div className="area-types-container">
        <div className="area-types">
            <ConfigProvider
              theme={{
                components: {
                  Select: {
                    selectorBg: "rgb(11, 95, 58)",
                    optionSelectedColor: "rgba(242, 236, 236, 0.88)",
                    colorIconHover: "rgba(250, 246, 246, 0.88)",
                    colorBgContainer: "rgb(11, 95, 58)",
                    colorBgElevated: "rgb(11, 95, 58)",
                    colorPrimary: "rgb(242, 237, 237)",
                    colorIcon: "rgb(255,255,255)",
                    colorBorder: "rgb(6, 89, 36)",
                    optionSelectedBg: "rgb(76, 97, 77)",
                    colorText: "rgba(250, 249, 249, 0.88)",
                    colorFillTertiary: "rgba(242, 234, 234, 0.04)",
                    colorFillSecondary: "rgba(241, 228, 228, 0.06)",
                    colorTextQuaternary: "rgba(249, 249, 249, 0.99)",
                    colorTextTertiary: "rgba(244, 236, 236, 0.9)",
                    colorTextDescription: "rgba(255, 253, 253, 0.45)",
                    colorTextDisabled: "rgba(239, 233, 233, 0.25)",
                    colorTextPlaceholder: "rgba(255, 255, 255, 0.9)",
                  },
                },
              }}
            >
              <Select
                className="area-types-select-box"
                value={selectedAreaType?.key}
                onChange={(d) => setSelectedAreaType(d as PERMITTED_AREA_TYPES_KEYS)}
              >
                {AREA_TYPES.map((d) => (
                  <Option key={d.key} value={d.key}>
                    {dictionary?.map_ui?.[d.dictionaryKey]}
                  </Option>
                ))}
              </Select>
            </ConfigProvider>
        </div>
        <div className="area-select">
          {areasData && !areasDataIsLoading ? (
            <AreaSearch
              key={selectedAreaType?.key}
              handleAreaSelect={handleAreaSelect}
              selectedArea={selectedArea}
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
