import style from "./style.module.css";
import { useState } from "react";
import { Button, ConfigProvider, message, Popover } from "antd";
import { CopyOutlined, ShareAltOutlined } from "@ant-design/icons";

interface MapShareButtonProps {
  latitude: undefined | number;
  longitude: undefined | number;
  dictionary: { [key: string]: any };
}

const copyToClipboard = async (
  text: string,
  errorText: string,
): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    message.error(errorText);
    console.error("Failed to copy: ", err);
  }
};

const MapShareButton = ({
  latitude,
  longitude,
  dictionary,
}: MapShareButtonProps) => {
  const [open, setOpen] = useState(false);

  const handleToggleMenu = () => {
    setOpen(!open);
  };

  const handleCopyUrl = async () => {
    const url = window.location.href;
    copyToClipboard(url, dictionary?.map_ui?.copy_error).then(() => {
      message.success(dictionary?.map_ui?.copy_success);
    });
  };

  const popoverContent = (
    <div>
      <div className={style.latLngTable}>
        <div className={style.title}>{dictionary?.map_ui?.map_center}</div>
        <div className={style.latLngRow}>
          <div className={style.label}>Lat:</div>
          <div className={style.number}>{latitude?.toFixed(4)}</div>
        </div>
        <div className={style.latLngRow}>
          <div className={style.label}>Lon:</div>
          <div className={style.number}>{longitude?.toFixed(4)}</div>
        </div>
      </div>
      <Button onClick={handleCopyUrl}>
        <CopyOutlined style={{ fontSize: 16 }} />{" "}
        {dictionary?.map_ui?.copy_link}
      </Button>
    </div>
  );

  return (
    <ConfigProvider
      theme={{
        components: {
          Popover: {
            colorBgElevated: "#22B573",
            colorText: "#fff",
            padding: 12,
          },
        },
      }}
    >
      <Popover
        content={popoverContent}
        trigger="click"
        open={open}
        onOpenChange={setOpen}
        placement="left"
      >
        <button className={style.mapShareButton} onClick={handleToggleMenu}>
          <ShareAltOutlined style={{ fontSize: 18 }} />
        </button>
      </Popover>
    </ConfigProvider>
  );
};

export default MapShareButton;
