// components/MarkdownRenderer.tsx
import React from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkReact from 'remark-react';
import { Slideshow } from '../Slideshow';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkReact, {
      createElement: React.createElement,
      Fragment: React.Fragment,
      remarkReactComponents: { slideshow: Slideshow },
    });

  const result = processor.processSync(content).result;

  console.log(result)

  return <>{result}</>;
};

export default MarkdownRenderer;