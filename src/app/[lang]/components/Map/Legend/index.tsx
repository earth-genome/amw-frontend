import { Radio } from "antd";
import { useRef, useEffect, useState, useCallback } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import "./style.css";
import ColorScale from "@/app/[lang]/components/Map/Legend/ColorScale";
import { formatLayerYear } from "@/utils/content";

export interface LegendProps {
  years: number[];
  activeYear: string;
  setActiveYear: (value: string) => void;
  dictionary: { [key: string]: any };
}

const SCROLL_DISTANCE = 250;

const Legend = ({
  years,
  activeYear,
  setActiveYear,
  dictionary,
}: LegendProps) => {
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
    if (scrollContainerRef.current && activeYear) {
      const activeButton = scrollContainerRef.current.querySelector(
        `[data-year="${activeYear}"]`
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
  }, [activeYear]);

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
  }, [activeYear, scrollToActiveButton]);

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
      <ColorScale dictionary={dictionary} />

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
                label: formatLayerYear(d),
              }))}
              value={activeYear}
              onChange={({ target: { value } }) => {
                setActiveYear(value);
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
