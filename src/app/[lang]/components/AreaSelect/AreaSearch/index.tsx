import { Select, ConfigProvider } from "antd";
import { AreaSelectOption } from "@/app/[lang]/components/AreaSelect";
import { useContext, useMemo, useCallback } from "react";
import { Context } from "@/lib/Store";

interface AreaSearchProps {
  handleAreaSelect: (_value: AreaSelectOption | undefined) => void;
  selectedArea?: AreaSelectOption;
  dictionary: { [key: string]: any };
}

const removeAccents = (str: string) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const AreaSearch = ({
  handleAreaSelect,
  selectedArea,
  dictionary,
}: AreaSearchProps) => {
  const [state] = useContext(Context)!;
  const { areasOptions } = state;

  const antdOptions = useMemo(
    () =>
      areasOptions?.map((opt: AreaSelectOption) => ({
        value: opt.value,
        label: (
          <div style={{ padding: "4px 0", color: "inherit" }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: "15px",
                lineHeight: "1.3",
                marginBottom: "2px",
                color: "inherit",
              }}
            >
              {opt.title}
            </div>
            {opt.status && (
              <div
                style={{
                  fontSize: "13px",
                  lineHeight: "1.3",
                  marginBottom: "1px",
                  color: "inherit",
                }}
              >
                {opt.status}
              </div>
            )}
            {opt.showCountry && (
              <div
                style={{
                  fontSize: "13px",
                  lineHeight: "1.3",
                  color: "inherit",
                }}
              >
                {opt.country}
              </div>
            )}
          </div>
        ),
        displayLabel: opt.label,
        searchText: removeAccents(
          `${opt.title} ${opt.status ?? ""} ${opt.country ?? ""}`,
        ).toLowerCase(),
        original: opt,
      })),
    [areasOptions],
  );

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (!value) {
        handleAreaSelect(undefined);
        return;
      }
      const found = areasOptions?.find(
        (opt: AreaSelectOption) => opt.value === value,
      );
      handleAreaSelect(found);
    },
    [areasOptions, handleAreaSelect],
  );

  const filterOption = useCallback(
    (input: string, option?: { searchText?: string }) =>
      (option?.searchText ?? "").includes(removeAccents(input).toLowerCase()),
    [],
  );

  const themeTokens = useMemo(
    () => ({
      token: {
        colorPrimary: "#22B573",
        colorBgContainer: "white",
        colorText: "#003E36",
        colorTextPlaceholder: "#006837",
        borderRadius: 6,
        fontSize: 14,
        controlHeight: 38,
        colorBorder: "transparent",
        colorIcon: "#006837",
        colorIconHover: "#22B573",
        colorTextQuaternary: "#003E36",
        colorTextTertiary: "#22B573",
      },
      components: {
        Select: {
          optionActiveBg: "#22B573",
          optionActiveColor: "#fff",
          optionSelectedBg: "#22B573",
          optionSelectedColor: "#fff",
          optionFontSize: 14,
          optionPadding: "4px 12px" as unknown as number,
          selectorBg: "white",
          activeBorderColor: "#22B573",
          hoverBorderColor: "#22B573",
          activeOutlineColor: "transparent",
          borderRadius: 6,
          controlHeight: 38,
          showArrowPaddingInlineEnd: 16,
          clearBg: "white",
          multipleItemBorderColor: "transparent",
          colorText: "#003E36",
        },
      },
    }),
    [],
  );

  return (
    <ConfigProvider theme={themeTokens}>
      <div style={{ width: "100%" }}>
        <Select
          showSearch
          virtual
          placeholder={dictionary?.map_ui?.select_area_placeholder}
          options={antdOptions}
          value={selectedArea?.value ?? undefined}
          onChange={handleChange}
          filterOption={filterOption}
          optionLabelProp="displayLabel"
          allowClear
          style={{ width: "100%" }}
          listHeight={300}
          popupMatchSelectWidth={true}
          notFoundContent={
            <div
              style={{
                padding: "8px 12px",
                color: "#003E36",
                textAlign: "center",
              }}
            >
              No options found
            </div>
          }
        />
      </div>
    </ConfigProvider>
  );
};

export default AreaSearch;
