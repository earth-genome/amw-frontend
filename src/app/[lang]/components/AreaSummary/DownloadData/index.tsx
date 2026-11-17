"use client";
import React, { useContext, useState } from "react";
import Link from "next/link";
import { ConfigProvider, Dropdown, message } from "antd";
import { ArrowDownOutlined, LoadingOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import style from "./style.module.css";
import { Context } from "@/lib/Store";
import { ROUTES } from "@/constants/routes";
import { ENTIRE_AMAZON_AREA_ID } from "@/constants/map";
import { fetchAreaGeometry } from "@/utils/areaGeometry";
import { fetchAreaMines } from "@/utils/areaMines";
import {
  AreaDownloadData,
  buildAreaCSV,
  buildAreaMinesGeoJSON,
  downloadFile,
  getAreaDownloadFilename,
} from "@/utils/areaDownload";

interface DownloadDataProps {
  data: AreaDownloadData;
}

type DownloadFormat = "geojson" | "csv";

// dropdown to download the data of the selected area as GeoJSON or CSV
const DownloadData = ({ data }: DownloadDataProps) => {
  const { dictionary } = data;
  const [state] = useContext(Context)!;
  const { lang } = state;
  const [open, setOpen] = useState(false);
  const [isLoadingGeoJSON, setIsLoadingGeoJSON] = useState(false);
  // the mines of the whole Amazon  links to the methods page, with the full dataset
  const methodsUrl = `/${lang}/${ROUTES["data-code-and-methods"].url}`;
  const isEntireAmazon =
    data.areaType.key === "countries" &&
    data.areaData.id === ENTIRE_AMAZON_AREA_ID;

  const downloadGeoJSON = async () => {
    const { areaType, areaData, dataSnapshot } = data;
    setIsLoadingGeoJSON(true);
    try {
      // the area and its mines come from the vector tiles. The area geometry is only
      // used to find the mines that intersect it
      const geometry = await fetchAreaGeometry(
        areaType,
        dataSnapshot,
        areaData.id,
        areaData.bbox,
      );
      const mines = await fetchAreaMines(geometry, areaData.bbox, dataSnapshot);
      downloadFile(
        JSON.stringify(buildAreaMinesGeoJSON(mines)),
        getAreaDownloadFilename(data, "geojson", "mines"),
        "application/geo+json",
      );
    } catch (err) {
      console.error("Failed to download GeoJSON: ", err);
      message.error(dictionary?.map_ui?.download_error);
    } finally {
      setIsLoadingGeoJSON(false);
    }
  };

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
          key: "geojson",
          label: (
            <Link href={methodsUrl} className={style.itemLink}>
              {renderItem(
                "GeoJSON",
                dictionary?.map_ui?.download_geojson_hint,
                dictionary?.map_ui?.download_geojson_external_description,
                true,
              )}
            </Link>
          ),
        }
      : {
          key: "geojson",
          disabled: isLoadingGeoJSON,
          label: renderItem(
            "GeoJSON",
            dictionary?.map_ui?.download_geojson_hint,
            dictionary?.map_ui?.download_geojson_description,
          ),
        },
    { type: "divider" },
    {
      key: "csv",
      label: renderItem(
        "CSV",
        dictionary?.map_ui?.download_csv_hint,
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

  const handleClick: MenuProps["onClick"] = ({ key }) => {
    setOpen(false);
    // the link of the entire Amazon opens by itself
    if ((key as DownloadFormat) === "geojson" && !isEntireAmazon)
      downloadGeoJSON();
    else if ((key as DownloadFormat) === "csv") downloadCSV();
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
          aria-busy={isLoadingGeoJSON}
          title={dictionary?.map_ui?.download_data}
          disabled={isLoadingGeoJSON}
        >
          {/* a spinner while the geometry tiles are being fetched */}
          {isLoadingGeoJSON ? <LoadingOutlined /> : <ArrowDownOutlined />}
          {dictionary?.map_ui?.download_data_short}
        </button>
      </Dropdown>
    </ConfigProvider>
  );
};

export default DownloadData;
