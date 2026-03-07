type Props = {
  title: string;
  value: string | number;
};

export default function StatCard({ title, value }: Props) {
  return (
    <div className="bg-white rounded-xl p-5 shadow hover:shadow-lg transition">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-2xl font-bold mt-2">{value}</h2>
    </div>
  );
}
