'use client';

import Image from 'next/image';
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
  getTopProducts,
  getTopUsers,
} from '@/lib/api/apiDashboard';
import {
  formatChartData,
  formatRevenue,
  formatMillions,
  formatNumber,
} from '@/utils/format/format';

import LoadingClient from '@/components/ui/Loading/LoadingClient';
import StatCard from '@/components/Dashboard/StatCard';

interface DashboardStats {
  totalPosts: number;
  totalProducts: number;
  totalOrders: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
}

interface TopProduct {
  _id: string;
  name: string;
  image: string;
  totalSold: number;
  totalRevenue: number;
}

interface TopUser {
  _id: string;
  fullName: string;
  email: string;
  points: number;
}

type ChartDataPoint = { name: string; value: number };

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingPage, setLoadingPage] = useState(false);
  const [revenueData, setRevenueData] = useState<ChartDataPoint[]>([]);
  const [visitData, setVisitData] = useState<ChartDataPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);

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

  useEffect(() => {
    getTopProducts(10).then(setTopProducts).catch(console.error);
    getTopUsers(10).then(setTopUsers).catch(console.error);
  }, []);

  if (loadingPage) return <LoadingClient />;
  if (!stats) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Bài viết" value={stats.totalPosts} />
        <StatCard title="Sản phẩm" value={stats.totalProducts} />
        <StatCard title="Đơn hàng" value={stats.totalOrders} />
        <StatCard
          title="Doanh thu tháng này"
          value={stats.monthlyRevenue.toLocaleString('vi-VN') + 'đ'}
        />
      </div>

      {/* Yearly revenue banner */}
      <div className="bg-blue-600 text-white rounded-xl px-6 py-4 flex items-center justify-between shadow">
        <span className="text-sm font-medium opacity-90">
          Doanh thu năm {new Date().getFullYear()}
        </span>
        <span className="text-2xl font-bold">
          {stats.yearlyRevenue.toLocaleString('vi-VN')}đ
        </span>
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
              <Tooltip formatter={(value) => formatMillions(value as number)} />
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

      {/* Top products & Top users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top selling products */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h3 className="font-semibold">Sản phẩm bán chạy</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">STT</th>
                  <th className="px-4 py-3 text-left">Sản phẩm</th>
                  <th className="px-4 py-3 text-right">Đã bán</th>
                  <th className="px-4 py-3 text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-gray-400"
                    >
                      Chưa có dữ liệu
                    </td>
                  </tr>
                ) : (
                  topProducts.map((p, i) => (
                    <tr
                      key={p._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.image ? (
                            <Image
                              src={p.image}
                              alt={p.name}
                              width={36}
                              height={36}
                              className="w-9 h-9 rounded object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded bg-gray-200 flex-shrink-0" />
                          )}
                          <span className="font-medium line-clamp-1">
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-600">
                        {p.totalSold.toLocaleString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {p.totalRevenue.toLocaleString('vi-VN')}đ
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top users by points */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h3 className="font-semibold">User tích điểm nhiều nhất</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Hạng</th>
                  <th className="px-4 py-3 text-left">Người dùng</th>
                  <th className="px-4 py-3 text-right">Điểm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-gray-400"
                    >
                      Chưa có dữ liệu
                    </td>
                  </tr>
                ) : (
                  topUsers.map((u, i) => (
                    <tr
                      key={u._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        {i === 0 ? (
                          <span className="text-yellow-500 font-bold text-base">
                            🥇
                          </span>
                        ) : i === 1 ? (
                          <span className="text-gray-400 font-bold text-base">
                            🥈
                          </span>
                        ) : i === 2 ? (
                          <span className="text-amber-600 font-bold text-base">
                            🥉
                          </span>
                        ) : (
                          <span className="text-gray-500">{i + 1}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">
                          {u.fullName || '(Không tên)'}
                        </p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-block bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full text-xs">
                          {formatNumber(u.points)} điểm
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
