import React from 'react';
import { sanitizeHtml } from '../security/sanitizationUtils';

interface Workflow {
  id: number;
  name: string;
  description: string;
  status: string;
  createdAt: string;
}

interface TimelineComponentProps {
  workflows: Workflow[];
}

/**
 * Timeline component for visualizing workflow progression
 * @param workflows - Array of workflows to display
 */
const TimelineComponent: React.FC<TimelineComponentProps> = ({ workflows }) => {
  return (
    <div className="timeline">
      <h2>Workflow Timeline</h2>
      <div className="timeline-items">
        {workflows.map((wf, index) => (
          <div key={wf.id} className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h3 dangerouslySetInnerHTML={{ __html: sanitizeHtml(wf.name) }} />
              <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(wf.description) }} />
              <small>{new Date(wf.createdAt).toLocaleDateString()}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineComponent;