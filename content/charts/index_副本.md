---
title: "VIX and VX Futures Trends"
date: 2025-05-15
draft: false
---
<style>
  .button-row {
    margin-bottom: 10px;
  }
  button {
    padding: 8px 16px;
    margin-right: 10px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  button:hover {
    background-color: #45a049;
  }
  #datePicker {
    padding: 5px;
    margin-left: 10px;
  }
</style>
<div style="margin-bottom: 20px;">
  <div class="button-row">
    <button onclick="updateChart(30)">30天</button>
    <button onclick="updateChart(60)">60天</button>
    <button onclick="updateChart(90)">90天</button>
    <button onclick="updateChart(120)">120天</button>
  </div>
  <div class="button-row">
    <button onclick="toggleSeries('VIX')">显示/隐藏 VIX</button>
    <button onclick="toggleSeries('VX')">显示/隐藏 VX</button>
  </div>
  <div class="button-row">
    <label for="datePicker">选择日期: </label>
    <input type="date" id="datePicker" onchange="updateChartWithDate()">
  </div>
</div>
<div id="vix-chart" style="width: 100%; height: 500px;"></div>
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>

<script>
  console.log('Script started'); // 添加在脚本开头
  let allData = [];
  let daysToShow = 30;
  let showVIX = true;
  let showVX = true;
  let selectedDate = new Date('2025-05-14');
  // ... 其余代码不变 ...

  let allData = [];
  let daysToShow = 30;
  let showVIX = true;
  let showVX = true;
  let selectedDate = new Date('2025-05-14'); // 设置为数据的最后一天

fetch('/data/vix-data.json')
  .then(response => {
    console.log('Fetch response status:', response.status); // 检查 HTTP 状态
    if (!response.ok) throw new Error('Failed to fetch vix-data.json');
    return response.json();
  })
  .then(data => {
    console.log('Loaded data:', data); // 检查加载的数据
    console.log('First few entries:', data.slice(0, 3)); // 显示前三条数据
    allData = data.map(row => {
      const [month, day, year] = row.Date.split('/');
      const normalizedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      const parsedDate = new Date(normalizedDate);
      console.log('Parsed date for', row.Date, ':', parsedDate); // 检查日期解析
      return {
        Date: parsedDate,
        VX_Spot: row.VX_Spot,
        VIX_Spot: row.VIX_Spot
      };
    });
    console.log('Processed allData:', allData.slice(0, 3)); // 检查处理后的数据
    updateChartWithDate();
  })
  .catch(error => {
    console.error('Fetch or processing error:', error); // 捕获错误
  });






/*  fetch('/data/vix-data.json')
    .then(response => response.json())
    .then(data => {
      allData = data.map(row => ({
        Date: new Date(row.Date),
        VX_Spot: row.VX_Spot,
        VIX_Spot: row.VIX_Spot
      }));
      updateChartWithDate();
    });
*/

  function updateChart(days) {
    daysToShow = days;
    updateChartWithDate();
  }

  function toggleSeries(series) {
    if (series === 'VIX') showVIX = !showVIX;
    if (series === 'VX') showVX = !showVX;
    updateChartWithDate();
  }

  function updateChartWithDate() {
    const datePicker = document.getElementById('datePicker');
    if (datePicker.value) {
      selectedDate = new Date(datePicker.value);
    }

    const startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - daysToShow);

    const filteredData = allData.filter(row => {
      return row.Date >= startDate && row.Date <= selectedDate;
    });

    const traces = [];
    if (showVX) {
      traces.push({
        x: filteredData.map(row => row.Date),
        y: filteredData.map(row => row.VX_Spot),
        type: 'scatter',
        mode: 'lines',
        name: 'VX Spot',
        line: { color: '#1f77b4', connectgaps: false }
      });
    }
    if (showVIX) {
      traces.push({
        x: filteredData.map(row => row.Date),
        y: filteredData.map(row => row.VIX_Spot),
        type: 'scatter',
        mode: 'lines',
        name: 'VIX Spot',
        line: { color: '#ff7f0e', connectgaps: false }
      });
    }

    const layout = {
      title: `VIX 和 VX 趋势（${daysToShow} 天）`,
      xaxis: { title: '日期', type: 'date' },
      yaxis: { title: '值' },
      margin: { t: 50, b: 50, l: 50, r: 50 },
      showlegend: true
    };

    Plotly.newPlot('vix-chart', traces, layout);
  }
</script>

