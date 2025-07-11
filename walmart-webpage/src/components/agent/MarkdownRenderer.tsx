'use client';
import ReactMarkdown from 'react-markdown';

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        components={{
          // Customize how certain elements are rendered
          strong: ({ node, ...props }) => (
            <strong className="font-bold" {...props} />
          ),
          p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}