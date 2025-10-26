// components/vendorDashboard/VendorTable.tsx

interface VendorTableProps {
    columns: string[];
    data: (string | number)[][];
  }
  
  export default function VendorTable({ columns, data }: VendorTableProps) {
    return (
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="text-left px-4 py-2 border-b border-gray-200 font-medium"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-gray-50">
                  {row.map((cell, cellIdx) => (
                    <td
                      key={cellIdx}
                      className="px-4 py-2 border-b border-gray-200"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-4 text-gray-500"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }