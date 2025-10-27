import React from "react";
import { Tooltip, ConfigProvider } from "antd";

interface CustomTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  placement?:
    | "topRight"
    | "top"
    | "topLeft"
    | "bottomRight"
    | "bottom"
    | "bottomLeft"
    | "leftTop"
    | "left"
    | "leftBottom"
    | "rightTop"
    | "right"
    | "rightBottom";
}

const CustomTooltip = ({
  children,
  content,
  placement = "topRight",
}: CustomTooltipProps) => {
  if (!content || !children) return null;

  return (
    <ConfigProvider
      theme={{
        components: {
          Tooltip: {
            colorBgSpotlight: "#003E36",
            colorTextLightSolid: "#fff",
            paddingXS: 12,
          },
        },
      }}
    >
      <Tooltip title={content} placement={placement}>
        {children}
      </Tooltip>
    </ConfigProvider>
  );
};

export default CustomTooltip;
