import React from 'react';
import DOMPurify from 'dompurify';

interface TimelineItem {
  date: string;
  title: string;
  description: string;
}

interface TimelineComponentProps {
  items: TimelineItem[];
}

/**
 * Timeline component to visualize project milestones or development history
 *
 * @param items - Array of timeline items, each with date, title, and description
 * @returns A vertical timeline component
 *
 * @security All text content is sanitized using DOMPurify to prevent XSS
 */
export const TimelineComponent: React.FC<TimelineComponentProps> = ({ items }) => {
  return (
    <div className="timeline-container" style={{ padding: '20px' }}>
      <h3>Project Timeline</h3>
      <div className="timeline" style={{ position: 'relative', paddingLeft: '30px' }}>
        {items.map((item, index) => (
          <div key={index} className="timeline-item" style={{ marginBottom: '20px' }}>
            <div
              className="timeline-marker"
              style={{
                position: 'absolute',
                left: '-10px',
                width: '20px',
                height: '20px',
                backgroundColor: '#007bff',
                borderRadius: '50%',
                border: '2px solid #fff',
              }}
            ></div>
            <div className="timeline-content" style={{ marginLeft: '20px' }}>
              <h4>{DOMPurify.sanitize(item.title)}</h4>
              <p style={{ color: '#666' }}>{DOMPurify.sanitize(item.date)}</p>
              <p>{DOMPurify.sanitize(item.description)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
