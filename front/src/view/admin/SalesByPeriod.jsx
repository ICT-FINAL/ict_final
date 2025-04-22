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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

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
    const filteredData = data.filter((item) => {
      const date = new Date(item.date);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      if (selectedMonth && selectedYear) {
        return month === selectedMonth && year === selectedYear;
      } else if (selectedMonth) {
        return month === selectedMonth;
      } else if (selectedYear) {
        return year === selectedYear;
      }
      return true;
    });

    setFiltered(filteredData);
  }, [selectedMonth, selectedYear, data]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, selectedYear]);

  const summary = filtered.reduce(
    (acc, curr) => {
      const coupon = curr.couponDiscount || 0;
      const productTotal = curr.totalSales + coupon - curr.shippingCost;
      const profit = productTotal * 0.2 - coupon;

      acc.orders += curr.orders;
      acc.totalSales += curr.totalSales;
      acc.shippingCost += curr.shippingCost;
      acc.couponDiscount += coupon;
      acc.profit += profit;
      return acc;
    },
    { orders: 0, totalSales: 0, shippingCost: 0, couponDiscount: 0, profit: 0 }
  );

  const netSales = summary.totalSales - summary.shippingCost;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const chartData = {
    labels: filtered.map((item) => item.date),
    datasets: [
      {
        label: "일자별 매출총액",
        data: filtered.map((item) => item.totalSales),
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
          {[1,2,3,4,5,6,7,8,9,10,11,12].map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={selectedMonth === m ? 'selected' : ''}
            >
              {m}월
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
          <div className="table-wrapper">
          <table className="sales-table">
            <thead>
              <tr>
                <th>일자</th>
                <th>주문수</th>
                <th>매출총액</th>
                <th>배송총액</th>
                <th>쿠폰총액</th>
                <th>순매출</th>
                <th>순이익</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => {
                const coupon = item.couponDiscount || 0;
                const productTotal = item.totalSales + coupon - item.shippingCost;
                const profit = productTotal * 0.2 - coupon;

                return (
                  <tr key={item.date} onClick={() => setSelected(item)}>
                    <td>{item.date}</td>
                    <td>{item.orders}</td>
                    <td>{item.totalSales.toLocaleString()}원</td>
                    <td>{item.shippingCost.toLocaleString()}원</td>
                    <td>{coupon.toLocaleString()}원</td>
                    <td>{(item.totalSales - item.shippingCost).toLocaleString()}원</td>
                    <td>{Math.round(profit).toLocaleString()}원</td>
                  </tr>
                );
              })}
              {currentPage === totalPages && filtered.length > 0 && (
                <tr className="summary-row">
                  <td><strong>합계</strong></td>
                  <td><strong>{summary.orders}</strong></td>
                  <td><strong>{summary.totalSales.toLocaleString()}원</strong></td>
                  <td><strong>{summary.shippingCost.toLocaleString()}원</strong></td>
                  <td><strong>{summary.couponDiscount.toLocaleString()}원</strong></td>
                  <td><strong>{netSales.toLocaleString()}원</strong></td>
                  <td><strong>{Math.round(summary.profit).toLocaleString()}원</strong></td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={currentPage === i + 1 ? "active" : ""}
              >
                {i + 1}
              </button>
            ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesByPeriod;
