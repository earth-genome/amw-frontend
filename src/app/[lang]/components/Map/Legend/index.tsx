import { Radio } from "antd";
import { useRef, useEffect, useState, useCallback } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import "./style.css";

export interface LegendProps {
  years: number[];
  activeLayer: string;
  setActiveLayer: (value: string) => void;
}

const SCROLL_DISTANCE = 250;

const Legend = ({ years, activeLayer, setActiveLayer }: LegendProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const sortedYears = years.sort((a, b) => a - b);

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const scrollToActiveButton = useCallback(() => {
    if (scrollContainerRef.current && activeLayer) {
      const activeButton = scrollContainerRef.current.querySelector(
        `[data-year="${activeLayer}"]`
      ) as HTMLElement;

      if (activeButton) {
        const containerRect =
          scrollContainerRef.current.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();

        const isVisible =
          buttonRect.left >= containerRect.left &&
          buttonRect.right <= containerRect.right;

        if (!isVisible) {
          const scrollLeft =
            activeButton.offsetLeft -
            scrollContainerRef.current.clientWidth / 2 +
            activeButton.offsetWidth / 2;

          scrollContainerRef.current.scrollTo({
            left: scrollLeft,
            behavior: "smooth",
          });
        }
      }
    }
  }, [activeLayer]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -SCROLL_DISTANCE,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: SCROLL_DISTANCE,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    updateScrollButtons();
    scrollToActiveButton();
  }, [activeLayer, scrollToActiveButton]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", updateScrollButtons);
      return () => container.removeEventListener("scroll", updateScrollButtons);
    }
  }, []);

  // initial scroll to the right
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      setTimeout(() => {
        container.scrollLeft = container.scrollWidth - container.clientWidth;
        updateScrollButtons();
      }, 100);
    }
  }, [years]);

  return (
    <div className="map-legend">
      <div className="legend-carousel">
        <button
          className="scroll-button scroll-left"
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
        >
          <LeftOutlined />
        </button>

        <div className="year-pills-container" ref={scrollContainerRef}>
          <div className="year-pills">
            <Radio.Group
              options={sortedYears.map((d) => ({
                value: String(d),
                label: String(d),
              }))}
              value={activeLayer}
              onChange={({ target: { value } }) => {
                setActiveLayer(value);
              }}
              optionType="button"
              buttonStyle="solid"
            />
          </div>
        </div>

        <button
          className="scroll-button scroll-right"
          onClick={scrollRight}
          disabled={!canScrollRight}
          aria-label="Scroll right"
        >
          <RightOutlined />
        </button>
      </div>
    </div>
  );
};

export default Legend;
