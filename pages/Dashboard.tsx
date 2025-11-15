import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { MOCK_CATEGORY_SPENDING, MOCK_EMOTIONAL_SPENDING, MOCK_EXPENSES } from '../services/mockData';
import { CategorySpending, Expense } from '../types';
import { useAuth } from '../hooks/useAuth';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f'];

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-bold">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#fff">{`Rs. ${value}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};


const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [activeIndex, setActiveIndex] = React.useState(0);

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const totalSpending = MOCK_EXPENSES.reduce((sum, exp) => sum + exp.amount, 0);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Welcome back, {user?.displayName?.split(' ')[0]}!</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Spending (Month)" value={`Rs. ${totalSpending.toFixed(2)}`} change="+5.2%" />
                <StatCard title="Top Category" value="Food & Drink" />
                <StatCard title="Top Emotion" value="Stressed" change="-2.1%" />
                <StatCard title="Active Challenges" value="3" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Emotional Spending</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={MOCK_EMOTIONAL_SPENDING}>
                            <XAxis dataKey="emotion" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: '#374151', border: 'none' }} cursor={{fill: 'rgba(136, 132, 216, 0.1)'}}/>
                            <Legend />
                            <Bar dataKey="amount" fill="#8884d8" name="Amount Spent (Rs.)"/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Category Breakdown</h2>
                    <ResponsiveContainer width="100%" height={300}>
                         <PieChart>
                            <Pie
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                data={MOCK_CATEGORY_SPENDING}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                onMouseEnter={onPieEnter}
                            >
                                {MOCK_CATEGORY_SPENDING.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

             <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="p-3">Description</th>
                                <th className="p-3">Vendor</th>
                                <th className="p-3">Category</th>
                                <th className="p-3">Date</th>
                                <th className="p-3 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_EXPENSES.slice(0, 5).map((expense) => (
                                <tr key={expense.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="p-3">{expense.description}</td>
                                    <td className="p-3 text-gray-400">{expense.vendor}</td>
                                    <td className="p-3">
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300">{expense.category}</span>
                                    </td>
                                    <td className="p-3 text-gray-400">{expense.date}</td>
                                    <td className="p-3 text-right font-medium">Rs. {expense.amount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: string;
    change?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {change && (
             <p className={`text-sm mt-1 ${change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {change} vs last month
             </p>
        )}
    </div>
);


export default Dashboard;
