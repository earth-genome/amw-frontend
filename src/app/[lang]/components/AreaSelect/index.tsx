import { ConfigProvider, Radio } from "antd";
import { useCallback, useContext, useEffect, useState } from "react";
import "./style.css";
import useSWR from "swr";
import { Context } from "@/lib/Store";
import { AreasData } from "@/types/types";
import AreaSearch from "@/app/[lang]/components/AreaSelect/AreaSearch";
import { SingleValue } from "react-select";
import { AREA_TYPES, AreaType } from "@/constants/map";
import { getAreaType } from "@/lib/Reducer";

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

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());

const AreaSelect = ({ dictionary }: AreaSelectProps) => {
  const [state, dispatch] = useContext(Context)!;

  const { selectedArea, selectedAreaType } = state;
  const setSelectedArea = useCallback(
    (selectedArea: SingleValue<AreaSelectOption> | undefined) => {
      dispatch({ type: "SET_SELECTED_AREA", selectedArea: selectedArea });
    },
    [dispatch]
  );
  const setSelectedAreaType = useCallback(
    (selectedAreaType: AreaType) => {
      dispatch({
        type: "SET_SELECTED_AREA_TYPE",
        selectedAreaType: selectedAreaType,
      });
    },
    [dispatch]
  );

  const areasDataUrl = selectedAreaType ? selectedAreaType.url : "";

  const {
    data: areasData,
    error: areasDataError,
    isLoading: areasDataIsLoading,
  } = useSWR<AreasData>(areasDataUrl, fetcher);

  useEffect(() => {
    if (areasDataIsLoading || areasDataError) {
      dispatch({ type: "SET_AREAS_DATA", areasData: undefined });
      return;
    }
    dispatch({ type: "SET_AREAS_DATA", areasData: areasData });
  }, [areasData, areasDataError, areasDataIsLoading, dispatch]);

  const handleAreaSelect = (value: SingleValue<AreaSelectOption>) => {
    setSelectedArea(value);
  };

  return (
    <div className="area-types-wrapper">
      <div className="area-types-container">
        <div className="area-types">
          <Radio.Group
            options={AREA_TYPES.map((d) => ({
              value: d.key,
              label: dictionary?.map_ui?.[d.dictionaryKey],
            }))}
            value={selectedAreaType?.key}
            onChange={({ target: { value } }) => {
              const areaType = getAreaType(value);
              if (!areaType) return;
              setSelectedAreaType(areaType);
            }}
            optionType="button"
            buttonStyle="solid"
          />
        </div>
        <div className="area-select">
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
                  colorTextQuaternary: "rgba(249, 249, 249, 0.25)",
                  colorTextTertiary: "rgba(244, 236, 236, 0.9)",
                  colorTextDescription: "rgba(255, 253, 253, 0.45)",
                  colorTextDisabled: "rgba(239, 233, 233, 0.25)",
                  colorTextPlaceholder: "rgba(255, 255, 255, 0.9)",
                },
              },
            }}
          >
            {areasData && !areasDataIsLoading ? (
              <AreaSearch
                key={selectedAreaType?.key}
                areasData={areasData}
                handleAreaSelect={handleAreaSelect}
                selectedArea={selectedArea}
                selectedAreaType={selectedAreaType}
                dictionary={dictionary}
              />
            ) : (
              <div className="area-loading">Loading...</div>
            )}
          </ConfigProvider>
        </div>
      </div>
    </div>
  );
};

export default AreaSelect;
