// components/vendorDashboard/VendorStatsCard.tsx

interface VendorStatsCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
  }
  
  export default function VendorStatsCard({ title, value, icon }: VendorStatsCardProps) {
    return (
      <div className="bg-white shadow p-4 rounded-lg flex items-center justify-between">
        <div>
          <p className="text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
        {icon && <div className="text-green-600 text-3xl">{icon}</div>}
      </div>
    );
  }