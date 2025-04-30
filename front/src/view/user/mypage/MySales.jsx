import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

function MySales() {
  const serverIP = useSelector((state) => state.serverIP);
  const user = useSelector((state) => state.auth.user);

  const [salesSummary, setSalesSummary] = useState({
    totalSalesAmount: 0,
    totalQuantity: 0,
    refundOrCancelCount: 0,
  });
  const [dailyStats, setDailyStats] = useState([]);

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  useEffect(() => {
    if (!user) return;

    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end = new Date(year, month, 0).toISOString().slice(0, 10);

    axios.get(`${serverIP.ip}/mystats/sell/${user.user.id}`, {
      headers: { Authorization: `Bearer ${user.token}` },
      params: { start, end }
    })
    .then(res => setSalesSummary(res.data))
    .catch(err => setSalesSummary({ totalSalesAmount: 0, totalQuantity: 0, refundOrCancelCount: 0 }));

    axios.get(`${serverIP.ip}/mystats/daily/${user.user.id}`, {
      headers: { Authorization: `Bearer ${user.token}` },
      params: { start, end }
    })
    .then(res => setDailyStats(res.data))
    .catch(err => setDailyStats([]));

  }, [user, year, month]);

  const yearOptions = Array.from({ length: 5 }, (_, i) => today.getFullYear() - i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  const chartData = {
    labels: dailyStats.map(d => d.date),
    datasets: [
      {
        label: '일별 판매 매출',
        data: dailyStats.map(d => d.totalAmount),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.3,
      }
    ],
  };

  return (
    <div className="my-order-container">
      <div className="filter-selects">
        <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {yearOptions.map(y => <option key={y} value={y}>{y}년</option>)}
        </select>
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          <option value="">전체</option>
          {monthOptions.map(m => <option key={m} value={m}>{m}월</option>)}
        </select>
      </div>

      <div className="activity-stats">
        <div className="activity-row">
          <div className="activity-stat-box">
            <h4>총 판매 매출</h4>
            <p>{(salesSummary.totalSalesAmount || 0).toLocaleString()}원</p>
          </div>
          <div className="activity-stat-box">
            <h4>총 판매 수량</h4>
            <p>{salesSummary.totalQuantity || 0}개</p>
          </div>
          <div className="activity-stat-box">
            <h4>취소/환불 건수</h4>
            <p>{salesSummary.refundOrCancelCount}건</p>
          </div>
        </div>
      </div>

      <div className="chart-section" style={{ marginTop: '30px' }}>
        <h3>📈 일별 판매 매출</h3>
        <Line data={chartData} />
      </div>
    </div>
  );
}

export default MySales;
