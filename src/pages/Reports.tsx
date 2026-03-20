import { BarChart3 } from 'lucide-react';

const Reports = () => {
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-medium text-[36px] tracking-tight text-foreground">
            Reports
          </h1>
          <p className="text-[13px] text-muted mt-1">
            Time tracking insights and analytics
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-12 text-center shadow-card">
        <div className="h-16 w-16 rounded-full bg-tf-surface flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="h-8 w-8 text-tf-muted" />
        </div>
        <h3 className="font-semibold text-[18px] text-foreground mb-2">
          Reports coming soon
        </h3>
        <p className="text-[13px] text-tf-muted max-w-md mx-auto">
          Advanced analytics, project breakdowns, team utilization charts, and exportable reports will be available here.
        </p>
      </div>
    </div>
  );
};

export default Reports;
