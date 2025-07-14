import React from 'react';
import Card from '../ui/Card';
import ChartCard from '../dashboard/ChartCard';

const UsageAnalytics = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Usage Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Inventory Usage Over Time">
          <div className="h-64 flex items-center justify-center text-gray-400">[Line Chart Coming Soon]</div>
        </ChartCard>
        <ChartCard title="Top Used Categories">
          <div className="h-64 flex items-center justify-center text-gray-400">[Bar Chart Coming Soon]</div>
        </ChartCard>
      </div>
      <Card className="mt-6">
        <div className="p-6 text-center text-gray-500">Advanced usage analytics and filters coming soon.</div>
      </Card>
    </div>
  );
};

export default UsageAnalytics; 