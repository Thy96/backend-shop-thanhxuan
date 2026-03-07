'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

import {
  getDashboard,
  getRevenueByMonth,
  getVisitsByMonth,
} from '@/lib/api/apiDashboard';
import { formatChartData, formatRevenue } from '@/utils/format';

import LoadingClient from '@/components/Loading/LoadingClient';
import StatCard from '@/components/Dashboard/StatCard';
import { formatMillions } from '../../utils/format';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [revenueData, setRevenueData] = useState<any>([]);
  const [visitData, setVisitData] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoadingPage(true);
        const data = await getDashboard();
        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingPage(false);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const data = await getRevenueByMonth();
        setRevenueData(formatRevenue(data));
      } catch (error) {
        console.error(error);
      }
    };

    fetchRevenue();
  }, []);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const data = await getVisitsByMonth();
        setVisitData(formatChartData(data));
      } catch (error) {
        console.error(error);
      }
    };

    fetchVisits();
  }, []);

  if (loadingPage) return <LoadingClient />;

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Bài viết" value={stats.totalPosts} />
        <StatCard title="Sản phẩm" value={stats.totalProducts} />
        <StatCard title="Đơn hàng" value={stats.totalOrders} />
        <StatCard
          title="Doanh thu"
          value={stats.revenue.toLocaleString('vi-VN') + 'đ'}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Doanh thu theo tháng</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={revenueData}
              margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval={0} tickMargin={10} />
              <YAxis
                tickFormatter={formatMillions}
                interval={0}
                angle={-30}
                textAnchor={'end'}
              />
              <Tooltip formatter={(value: any) => formatMillions(value)} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2563eb"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Lượt truy cập</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={visitData}
              margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#22c55e" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
