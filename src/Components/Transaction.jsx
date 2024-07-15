import axios from 'axios';
import { Chart } from 'chart.js';
import React, { useEffect, useState } from 'react';
import '../Components/Transaction.css'

const Transaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('03'); // Default to March (03)
  const [searchTerm, setSearchTerm] = useState('');
  const [statistics, setStatistics] = useState({ totalSaleAmount: 0, totalSoldItems: 0, totalUnsoldItems: 0 });
  const [barChartData, setBarChartData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedMonth, searchTerm, currentPage]); // Reload data when month, search term, or pagination changes

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadTransactions(), loadStatistics(), loadBarChartData()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/products/${searchTerm}?page=${currentPage}&month=${selectedMonth}`);
      setTransactions(response.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/statistics?month=${selectedMonth}`);
      const [totalSaleAmount, totalSoldItems, totalUnsoldItems] = response.data;
      setStatistics({ totalSaleAmount, totalSoldItems, totalUnsoldItems });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const loadBarChartData = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/barchart?month=${selectedMonth}`);
      setBarChartData(response.data);
      renderBarChart(response.data); // Call render function after setting state
    } catch (error) {
      console.error('Error fetching bar chart data:', error);
    }
  };

  const renderBarChart = (data) => {
    const labels = Object.keys(data);
    const values = Object.values(data);

    const ctx = document.getElementById('barChart');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Number of Items',
          data: values,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
    setCurrentPage(1); // Reset to first page when month changes
  };

  const handleSearchInputChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when search term changes
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="container mt-4">
     <div className="h2">
     <h2>Transactions  Dashboard</h2>
     </div>

      {loading && <div>Loading...</div>}

      {!loading && (
        <>
          {/* Month Selection Dropdown */}
          <div className='group'>
          <div className="form-group">
            <label htmlFor="monthSelect">Select Month:</label>
            <select id="monthSelect" className="form-control" value={selectedMonth} onChange={handleMonthChange}>
              <option value="01">January</option>
              <option value="02">February</option>
              <option value="03">March</option>
              <option value="04">April</option>
              <option value="05">May</option>
              <option value="06">June</option>
              <option value="07">July</option>
              <option value="08">August</option>
              <option value="09">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>

          {/* Search Transactions */}
          <div className="form-group1">
            <label htmlFor="searchInput">Search Transaction:</label>
            <input type="text" id="searchInput" className="form-control" value={searchTerm} onChange={handleSearchInputChange} placeholder="Search by title, description, or price" />
          </div>
          </div>

          {/* Transactions Statistics */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Total Sale Amount</h5>
                  <p className="card-text">${statistics.totalSaleAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Total Sold Items</h5>
                  <p className="card-text">{statistics.totalSoldItems}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Total Unsold Items</h5>
                  <p className="card-text">{statistics.totalUnsoldItems}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Description</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td>{transaction.title}</td>

                  <td>{transaction.category}</td>
                  <td>{transaction.description}</td>
                  <td>{transaction.price}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <nav aria-label="Page navigation">
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" id='button' onClick={handlePrevPage}>Previous</button>
              </li>
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" id='button' onClick={handleNextPage}>Next</button>
              </li>
            </ul>
          </nav>

          {/* Transactions Bar Chart */}
          <div className="mt-4">
            <canvas id="barChart" width="400" height="200"></canvas>
          </div>
        </>
      )}
    </div>
  );
};

export default Transaction;
