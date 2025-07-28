import { ConfigProvider, Radio, Select } from "antd";
import { useState } from "react";
import "./style.css";
import useSWR from "swr";
const { Option } = Select;

interface AreaSelectProps {
  dictionary: { [key: string]: any };
}

interface AreaProperties {
  id: string;
  country: string;
  name_field: string;
  [key: string]: any;
}

interface GeoJSONFeature {
  properties: AreaProperties;
  [key: string]: any;
}

interface AreasData {
  features: GeoJSONFeature[];
  [key: string]: any;
}

const AREA_TYPES = [
  {
    data_type: "indigenous-territory",
    dictionary_key: "indigenous_territories",
    file: "indigenous_territories.geojson",
  },
  {
    data_type: "protected-area",
    dictionary_key: "protected_areas",
    file: "protected_areas.geojson",
  },
] as const;

const BASE_URL =
  "https://raw.githubusercontent.com/earthrise-media/mining-detector/standardize-it-and-pa-areas/data/boundaries/protected_areas_and_indigenous_territories/out";

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());

const AreaSelect = ({ dictionary }: AreaSelectProps) => {
  const [activeAreaType, setActiveAreaType] = useState(
    AREA_TYPES[0]?.data_type
  );
  const [activeArea, setActiveArea] = useState<string | null>(null);

  const activeAreaTypeData = AREA_TYPES.find(
    (d) => d.data_type === activeAreaType
  );
  const areasDataUrl = activeAreaTypeData
    ? `${BASE_URL}/${activeAreaTypeData.file}`
    : "";

  const {
    data: areasData,
    error: areasDataError,
    isLoading: areasDataIsLoading,
  } = useSWR<AreasData>(areasDataUrl, fetcher);

  const areaOptions = areasData?.features?.map(
    (d: GeoJSONFeature) => d.properties
  );

  return (
    <div className="area-types-wrapper">
      <div className="area-types-container">
        <div className="area-types">
          <Radio.Group
            options={AREA_TYPES.map((d) => ({
              value: d.data_type,
              label: dictionary?.map_ui?.[d.dictionary_key],
            }))}
            value={activeAreaType}
            onChange={({ target: { value } }) => {
              setActiveAreaType(value);
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
            <Select
              style={{ width: "200px" }}
              value={activeArea}
              onChange={(value: string) => {
                setActiveArea(value);
              }}
            >
              {areaOptions?.map((d) => (
                <Option key={d.id} value={d.id}>
                  {d.country}: {d.name_field}
                </Option>
              ))}
            </Select>
          </ConfigProvider>
        </div>
      </div>
    </div>
  );
};

export default AreaSelect;
