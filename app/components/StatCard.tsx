interface StatCardProps {
  title: string;
  value: string;
  percentage: string;
  icon: React.ReactNode;
}

export default function StatCard({
  title,
  value,
  percentage,
  icon,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>

      <div className="stat-content">
        <span>{title}</span>

        <strong>{value}</strong>

        <small>
          <b>{percentage}</b> vs. mes anterior
        </small>
      </div>
    </div>
  );
}
