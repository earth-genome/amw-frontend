"use client";
import React, { useContext, useState } from "react";
import Link from "next/link";
import { ConfigProvider, Dropdown, message } from "antd";
import { ArrowDownOutlined, LoadingOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import style from "./style.module.css";
import { Context } from "@/lib/Store";
import {
  DownloadGateProvider,
  useDownloadGate,
} from "@/app/[lang]/components/DownloadGate";
import { ROUTES } from "@/constants/routes";
import { ENTIRE_AMAZON_AREA_ID } from "@/constants/map";
import { fetchAreaGeometry } from "@/utils/areaGeometry";
import { fetchAreaMines } from "@/utils/areaMines";
import {
  AreaDownloadData,
  buildAreaCSV,
  buildAreaGeoJSON,
  buildAreaMinesGeoJSON,
  downloadFile,
  getAreaDownloadFilename,
} from "@/utils/areaDownload";

interface DownloadDataProps {
  data: AreaDownloadData;
}

type DownloadFormat = "mines" | "area" | "csv";
// the GeoJSONs, built from the vector tiles
type GeoJSONFormat = Exclude<DownloadFormat, "csv">;

// dropdown to download the data of the selected area: GeoJSONs of its mines and of its
// boundary, and a CSV
const DownloadDataDropdown = ({ data }: DownloadDataProps) => {
  const { dictionary } = data;
  const [state] = useContext(Context)!;
  const { lang } = state;
  const [open, setOpen] = useState(false);
  // the downloads only run once the download form is submitted
  const requestAccess = useDownloadGate();
  // the GeoJSON being built, if any
  const [loadingFormat, setLoadingFormat] = useState<GeoJSONFormat>();
  const isLoading = !!loadingFormat;
  // the mines of the whole Amazon are too many to build in the browser, so its GeoJSON
  // links to the methods page, with the full dataset, instead
  // the methods page, with the full dataset
  const methodsUrl = `/${lang}/${ROUTES["data-code-and-methods"].url}`;
  const isEntireAmazon =
    data.areaType.key === "countries" &&
    data.areaData.id === ENTIRE_AMAZON_AREA_ID;

  // shows the spinner while a GeoJSON is built, and a message if it fails
  const withLoading = async (
    format: GeoJSONFormat,
    buildAndDownload: () => Promise<void>,
  ) => {
    setLoadingFormat(format);
    try {
      await buildAndDownload();
    } catch (err) {
      console.error(`Failed to download ${format} GeoJSON: `, err);
      message.error(dictionary?.map_ui?.download_error);
    } finally {
      setLoadingFormat(undefined);
    }
  };

  // the area geometry comes from the vector tiles
  const fetchGeometry = () => {
    const { areaType, areaData, dataSnapshot } = data;
    return fetchAreaGeometry(
      areaType,
      dataSnapshot,
      areaData.id,
      areaData.bbox,
    );
  };

  const downloadMinesGeoJSON = () =>
    withLoading("mines", async () => {
      const { areaData, dataSnapshot } = data;
      // the area and its mines come from the vector tiles. The area geometry is only
      // used to find the mines that intersect it
      const geometry = await fetchGeometry();
      const mines = await fetchAreaMines(geometry, areaData.bbox, dataSnapshot);
      downloadFile(
        JSON.stringify(buildAreaMinesGeoJSON(mines)),
        getAreaDownloadFilename(data, "geojson", "mines"),
        "application/geo+json",
      );
    });

  const downloadAreaGeoJSON = () =>
    withLoading("area", async () => {
      const geometry = await fetchGeometry();
      downloadFile(
        JSON.stringify(buildAreaGeoJSON(geometry, data)),
        getAreaDownloadFilename(data, "geojson", "area"),
        "application/geo+json",
      );
    });

  const downloadCSV = () => {
    downloadFile(
      buildAreaCSV(data),
      getAreaDownloadFilename(data, "csv"),
      "text/csv;charset=utf-8",
    );
  };

  const renderItem = (
    format: string,
    hint: string | undefined,
    description: string | undefined,
    // shows an arrow, when the item links to a page
    isLink = false,
  ) => (
    <div className={style.item}>
      <div className={style.itemTitle}>
        <span className={style.itemFormat}>{format}</span>
        {hint && <span className={style.itemHint}> - {hint}</span>}
      </div>
      {description && (
        <div className={style.itemDescription}>
          {description} {isLink && <span aria-hidden="true">→</span>}
        </div>
      )}
    </div>
  );

  const items: MenuProps["items"] = [
    isEntireAmazon
      ? {
          key: "mines",
          label: (
            <Link href={methodsUrl} className={style.itemLink}>
              {renderItem(
                dictionary?.map_ui?.download_mines_label,
                "GeoJSON",
                dictionary?.map_ui?.download_mines_external_description,
                true,
              )}
            </Link>
          ),
        }
      : {
          key: "mines",
          disabled: isLoading,
          label: renderItem(
            dictionary?.map_ui?.download_mines_label,
            "GeoJSON",
            dictionary?.map_ui?.download_mines_description,
          ),
        },
    { type: "divider" },
    {
      key: "area",
      disabled: isLoading,
      label: renderItem(
        dictionary?.map_ui?.download_area_label,
        "GeoJSON",
        dictionary?.map_ui?.download_area_description,
      ),
    },
    { type: "divider" },
    {
      key: "csv",
      label: renderItem(
        dictionary?.map_ui?.download_csv_label,
        "CSV",
        dictionary?.map_ui?.download_csv_description,
      ),
    },
    { type: "divider" },
    {
      // the methods page, with the full dataset
      key: "methods",
      className: style.methodsItem,
      label: (
        <Link href={methodsUrl} className={style.methodsLink}>
          <span>{dictionary?.map_ui?.download_full_dataset}</span>
          <span aria-hidden="true">→</span>
        </Link>
      ),
    },
  ];

  const downloads: Record<DownloadFormat, () => void> = {
    mines: downloadMinesGeoJSON,
    area: downloadAreaGeoJSON,
    csv: downloadCSV,
  };

  const handleClick: MenuProps["onClick"] = ({ key }) => {
    setOpen(false);
    // the link of the entire Amazon opens by itself, and the methods page has its own gate
    if (key === "mines" && isEntireAmazon) return;
    const download = downloads[key as DownloadFormat];
    if (!download) return;
    // shows the download form first, unless it was already submitted
    requestAccess({
      resource: "data",
      onAccess: () => {
        download();
      },
    });
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Dropdown: {
            paddingBlock: 8,
          },
        },
        token: {
          borderRadiusLG: 12,
          fontFamily: "inherit",
        },
      }}
    >
      <Dropdown
        menu={{ items, onClick: handleClick }}
        trigger={["click"]}
        placement="bottomRight"
        open={open}
        onOpenChange={setOpen}
        overlayClassName={style.menu}
      >
        <button
          type="button"
          className={style.button}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={dictionary?.map_ui?.download_data}
          aria-busy={isLoading}
          title={dictionary?.map_ui?.download_data}
          disabled={isLoading}
        >
          {/* a spinner while the geometry tiles are being fetched */}
          {isLoading ? <LoadingOutlined /> : <ArrowDownOutlined />}
          {dictionary?.map_ui?.download_data_short}
        </button>
      </Dropdown>
    </ConfigProvider>
  );
};

// the download form, shown before the first download
const DownloadData = ({ data }: DownloadDataProps) => {
  const [state] = useContext(Context)!;
  const { lang } = state;

  return (
    <DownloadGateProvider
      dictionary={data.dictionary?.methodology_form}
      lang={lang}
    >
      <DownloadDataDropdown data={data} />
    </DownloadGateProvider>
  );
};

export default DownloadData;
