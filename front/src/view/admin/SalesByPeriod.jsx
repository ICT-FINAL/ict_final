import React, { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import '../../css/view/salesbyperiod.css';
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useSelector } from "react-redux";
import axios from "axios";

ChartJS.register(LineElement, BarElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

function SalesByPeriod() {
  const today = new Date();

  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filtered, setFiltered] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const serverIP = useSelector((state) => state.serverIP);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (user)
      axios.get(`${serverIP.ip}/stats/sales`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
        .then(res => {
          setData(res.data);
          setSelected(res.data[res.data.length - 1]);
        })
        .catch(err => {
          console.log(err);
        });
  }, []);

  useEffect(() => {
    if (!selectedYear || !selectedMonth) return;

    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const baseData = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return {
        date: dateStr,
        orders: 0,
        totalSales: 0, // 매출총액은 이미 백엔드에서 제공된 값이므로 사용하지 않음
        shippingCost: 0,
        couponDiscount: 0,
        cancelAmount: 0,
      };
    });

    const matched = baseData.map((base) => {
      const existing = data.find((item) => item.date === base.date);
      return existing ? existing : base;
    });

    setFiltered(matched);
  }, [selectedMonth, selectedYear, data]);

  const summary = filtered.reduce(
    (acc, curr) => {
      const coupon = curr.couponDiscount || 0;
      const cancel = curr.cancelAmount || 0;
      const adjustedTotalSales = curr.totalSales - cancel; // 매출총액은 그대로 백엔드에서 제공된 값 사용
      const netSales = adjustedTotalSales - curr.shippingCost;
      const profit = ((adjustedTotalSales - curr.shippingCost + coupon) * 0.2) - coupon;

      acc.orders += curr.orders;
      acc.totalSales += curr.totalSales; // 매출총액 누적 (변경하지 않음)
      acc.shippingCost += curr.shippingCost;
      acc.couponDiscount += coupon;
      acc.cancelAmount += cancel;
      acc.profit += profit;
      acc.netSales += netSales;

      return acc;
    },
    { orders: 0, totalSales: 0, shippingCost: 0, couponDiscount: 0, cancelAmount: 0, profit: 0, netSales: 0 }
  );

  const chartData = {
    labels: filtered.map((item) => item.date),
    datasets: [
      {
        label: "일자별 매출총액",
        data: filtered.map((item) => item.totalSales - (item.cancelAmount || 0)),
        borderColor: "#8CC7A5",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        fill: true,
      },
    ],
  };

  const monthlySales = Array.from({ length: 12 }, (_, i) => {
    const monthData = data.filter((item) => {
      const date = new Date(item.date);
      const month = date.getMonth(); // 0 ~ 11
      const year = date.getFullYear();
      return month === i && year === selectedYear;
    });

    return monthData.reduce((sum, item) => sum + item.totalSales, 0);
  });

  const monthlyChartData = {
    labels: Array.from({ length: 12 }, (_, i) => `${i + 1}월`),
    datasets: [
      {
        label: "월별 총 매출총액",
        data: monthlySales,
        backgroundColor: "#F6B26B",
        borderColor: "#DE8C4F",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="sales-container">
      <div className="top-controls">
        <div className="year-controls">
          <button onClick={() => setSelectedYear(selectedYear - 1)}>&lt;</button>
          <span>{selectedYear}년</span>
          <button onClick={() => setSelectedYear(selectedYear + 1)}>&gt;</button>
        </div>
        <div className="month-buttons">
          {[...Array(12).keys()].map(m => (
            <button
              key={m + 1}
              onClick={() => setSelectedMonth(m + 1)}
              className={selectedMonth === m + 1 ? 'selected' : ''}
            >
              {m + 1}월
            </button>
          ))}
        </div>
      </div>

      <div className="chart-and-table">
        <div className="left-panel">
          <div className="chartSection">
            <h3>일별 매출 차트</h3>
            {selected ? <Line data={chartData} /> : <p>차트를 불러오는 중...</p>}
          </div>
          <div className="chartSection">
            <h3>월별 매출 차트</h3>
            <Bar data={monthlyChartData} />
          </div>
        </div>

        <div className="right-panel">
          <div className="table-wrapper" style={{ overflowY: 'auto', maxHeight: '600px' }}>
            <table className="sales-table">
              <thead>
                <tr>
                  <th>일자</th>
                  <th>주문수</th>
                  <th>매출총액</th>
                  <th>배송총액</th>
                  <th>쿠폰총액</th>
                  <th>환불금액</th>
                  <th>순매출</th>
                  <th>순이익</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const coupon = item.couponDiscount || 0;
                  const cancel = item.cancelAmount || 0;
                  const adjustedTotalSales = item.totalSales;
                  const netSales = adjustedTotalSales - item.shippingCost;
                  const profit = ((adjustedTotalSales - item.shippingCost + coupon) * 0.2) - coupon;

                  return (
                    <tr key={item.date} onClick={() => setSelected(item)}>
                      <td>{item.date}</td>
                      <td>{item.orders}</td>
                      <td>{item.totalSales.toLocaleString()}원</td>
                      <td>{item.shippingCost.toLocaleString()}원</td>
                      <td>{coupon.toLocaleString()}원</td>
                      <td>{cancel.toLocaleString()}원</td>
                      <td>{netSales.toLocaleString()}원</td>
                      <td>{Math.round(profit).toLocaleString()}원</td>
                    </tr>
                  );
                })}
                {filtered.length > 0 && (
                  <tr className="summary-row">
                    <td><strong>합계</strong></td>
                    <td><strong>{summary.orders}</strong></td>
                    <td><strong>{summary.totalSales.toLocaleString()}원</strong></td>
                    <td><strong>{summary.shippingCost.toLocaleString()}원</strong></td>
                    <td><strong>{summary.couponDiscount.toLocaleString()}원</strong></td>
                    <td><strong>{summary.cancelAmount.toLocaleString()}원</strong></td>
                    <td><strong>{summary.netSales.toLocaleString()}원</strong></td>
                    <td><strong>{Math.round(summary.profit).toLocaleString()}원</strong></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesByPeriod;
