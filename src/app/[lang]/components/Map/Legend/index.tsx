import { Select, ConfigProvider } from "antd";
import "./style.css";
import ColorScale from "@/app/[lang]/components/Map/Legend/ColorScale";
import { formatLayerYear } from "@/utils/content";
import { SELECT_ANTD_THEME } from "@/utils/themes";
import CustomTooltip from "../../CustomTooltip";
import QuestionMark from "../../Icons/QuestionMark";

export interface LegendProps {
  years: number[];
  activeYearStart: string;
  activeYearEnd: string;
  setActiveYearStart: (_value: string) => void;
  setActiveYearEnd: (_value: string) => void;
  dictionary: { [key: string]: any };
}

const Legend = ({
  years,
  activeYearStart,
  activeYearEnd,
  setActiveYearStart,
  setActiveYearEnd,
  dictionary,
}: LegendProps) => {
  const sortedYears = [...years].sort((a, b) => a - b);

  const allOptions = sortedYears.map((d) => ({
    value: String(d),
    label: formatLayerYear(d),
  }));

  // Filter start options: only years <= end
  const startOptions = allOptions.filter(
    (opt) => Number(opt.value) <= Number(activeYearEnd),
  );

  // Filter end options: only years >= start
  const endOptions = allOptions.filter(
    (opt) => Number(opt.value) >= Number(activeYearStart),
  );

  return (
    <div className="map-legend">
      <ColorScale dictionary={dictionary} />

      <ConfigProvider theme={SELECT_ANTD_THEME}>
        <div className="period-range-selectors">
          <div className="period-select-group">
            <label className="period-label">
              {dictionary?.map_ui?.period_start}
            </label>
            <Select
              value={activeYearStart}
              options={startOptions}
              onChange={(value) => setActiveYearStart(value)}
              className="period-select"
              popupMatchSelectWidth={false}
            />
          </div>
          <div className="period-select-group">
            <label className="period-label">
              {dictionary?.map_ui?.period_end}
              <CustomTooltip
                content={dictionary?.map_ui?.period_end_tooltip}
                placement="top"
              >
                <button className={""}>
                  <QuestionMark size={12} />
                </button>
              </CustomTooltip>
            </label>
            <Select
              value={activeYearEnd}
              options={endOptions}
              onChange={(value) => setActiveYearEnd(value)}
              className="period-select"
              popupMatchSelectWidth={false}
            />
          </div>
        </div>
      </ConfigProvider>
    </div>
  );
};

export default Legend;
