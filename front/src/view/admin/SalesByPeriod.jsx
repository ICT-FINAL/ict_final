import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import '../../css/view/salesbyperiod.css';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const dummyData = [
  {
    date: "2025-04-01",
    orders: 10,
    totalSales: 100000,
    shippingCost: 10000,
  },
  {
    date: "2025-04-02",
    orders: 41,
    totalSales: 500000,
    shippingCost: 50000,
  },
];

function SalesByPeriod() {
    const [data, setData] = useState([]);
    const [selected, setSelected] = useState(null);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const res = await fetch("/api/sales/statistics?startDate=2025-04-01&endDate=2025-04-30");
          if (!res.ok) throw new Error("API 실패");
          const result = await res.json();
          if (!Array.isArray(result) || result.length === 0) throw new Error("데이터 없음");
          setData(result);
          setSelected(result[0]);
        } catch (error) {
          console.warn("API 실패, 더미 데이터 사용:", error.message);
          setData(dummyData);
          setSelected(dummyData[0]);
        }
      };
  
      fetchData();
    }, []);
  
    const chartData = {
        labels: data.map((item) => item.date),
        datasets: [
          {
            label: "일자별 매출총액",
            data: data.map((item) => item.totalSales),
            borderColor: "#36A2EB",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            fill: true,
          },
        ],
      };
  
    return (
      <div className="sales-container">
        <div className="chartSection">
          {selected ? <Line data={chartData} /> : <p>차트를 불러오는 중...</p>}
        </div>
        <div className="tableSection">
          <table className="sales-table">
            <thead>
              <tr>
                <th>일자</th>
                <th>주문수</th>
                <th>매출총액</th>
                <th>배송비총액</th>
                <th>순매출</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.date} onClick={() => setSelected(item)}>
                  <td>{item.date}</td>
                  <td>{item.orders}</td>
                  <td>{item.totalSales.toLocaleString()}원</td>
                  <td>{item.shippingCost.toLocaleString()}원</td>
                  <td>{(item.totalSales - item.shippingCost).toLocaleString()}원</td> {/* ✅ 계산 */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
export default SalesByPeriod;
