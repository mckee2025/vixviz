// 定义全局变量
let allData = [];
let daysToShow = 30;
let showVIX = true;
let showVX = true;
let selectedDate = new Date('2025-05-14');

// 定义全局函数
function updateChart(days) {
  daysToShow = days;
  document.querySelectorAll('.button-row button').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.button-row button[onclick="updateChart(${days})"]`).classList.add('active');
  updateChartWithDate();
}

function toggleSeries(series) {
  if (series === 'VIX') {
    showVIX = !showVIX;
  }
  if (series === 'VX') {
    showVX = !showVX;
  }
  updateChartWithDate();
}

function updateChartWithDate() {
  console.log('Updating chart with date:', selectedDate);
  const datePicker = document.getElementById('datePicker');
  if (datePicker && datePicker.value) {
    selectedDate = new Date(datePicker.value);
  }

  const startDate = new Date(selectedDate);
  startDate.setDate(startDate.getDate() - daysToShow);

  const filteredData = allData.filter(row => {
    return row.Date >= startDate && row.Date <= selectedDate;
  });
  console.log('Filtered data length:', filteredData.length);

  const latestEntry = allData[allData.length - 1];
  document.getElementById('latest-date').textContent = latestEntry.Date.toISOString().split('T')[0];
  document.getElementById('latest-vix').textContent = latestEntry.VIX_Spot;
  document.getElementById('latest-vx').textContent = latestEntry.VX_Spot;

  const traces = [];
  if (showVX) {
    traces.push({
      x: filteredData.map(row => row.Date),
      y: filteredData.map(row => row.VX_Spot),
      type: 'scatter',
      mode: 'lines',
      name: 'VX Spot',
      line: { color: '#1f77b4', connectgaps: false, shape: 'spline' }
    });
  }
  if (showVIX) {
    traces.push({
      x: filteredData.map(row => row.Date),
      y: filteredData.map(row => row.VIX_Spot),
      type: 'scatter',
      mode: 'lines',
      name: 'VIX Spot',
      line: { color: '#ff7f0e', connectgaps: false, shape: 'spline' }
    });
  }
  console.log('Traces:', traces);

  const layout = {
    title: {
      text: `VIX and VX Trends (${daysToShow} Days)`,
      font: { size: window.innerWidth <= 768 ? 14 : 18 } // 手机上缩小标题字体
    },
    xaxis: {
      title: 'Date',
      type: 'date',
      tickangle: window.innerWidth <= 768 ? 45 : 0, // 手机上旋转 X 轴标签
      tickfont: { size: window.innerWidth <= 768 ? 10 : 12 }
    },
    yaxis: {
      title: 'Value',
      tickfont: { size: window.innerWidth <= 768 ? 10 : 12 }
    },
    margin: {
      t: window.innerWidth <= 768 ? 40 : 50,
      b: window.innerWidth <= 768 ? 60 : 50,
      l: 50,
      r: 50
    },
    showlegend: true,
    legend: {
      orientation: window.innerWidth <= 768 ? 'h' : 'v', // 手机上水平显示图例
      x: 0,
      y: -0.2
    }
  };

  Plotly.newPlot('vix-chart', traces, layout);
}


/*

function updateChartWithDate() {
  console.log('Updating chart with date:', selectedDate);
  const datePicker = document.getElementById('datePicker');
  if (datePicker && datePicker.value) {
    selectedDate = new Date(datePicker.value);
  }

  const startDate = new Date(selectedDate);
  startDate.setDate(startDate.getDate() - daysToShow);

  const filteredData = allData.filter(row => {
    return row.Date >= startDate && row.Date <= selectedDate;
  });
  console.log('Filtered data length:', filteredData.length);

  // 显示最新一天的数据
  const latestEntry = allData[allData.length - 1]; // 最后一天数据
  document.getElementById('latest-date').textContent = latestEntry.Date.toISOString().split('T')[0];
  document.getElementById('latest-vix').textContent = latestEntry.VIX_Spot;
  document.getElementById('latest-vx').textContent = latestEntry.VX_Spot;

  const traces = [];
  if (showVX) {
    traces.push({
      x: filteredData.map(row => row.Date),
      y: filteredData.map(row => row.VX_Spot),
      type: 'scatter',
      mode: 'lines',
      name: 'VX Spot',
      line: { color: '#1f77b4', connectgaps: false, shape: 'spline' } // 添加平滑曲线
    });
  }
  if (showVIX) {
    traces.push({
      x: filteredData.map(row => row.Date),
      y: filteredData.map(row => row.VIX_Spot),
      type: 'scatter',
      mode: 'lines',
      name: 'VIX Spot',
      line: { color: '#ff7f0e', connectgaps: false, shape: 'spline' } // 添加平滑曲线
    });
  }
  console.log('Traces:', traces);

  const layout = {
    title: `VIX and VX Trends (${daysToShow} Days)`,
    xaxis: { title: 'Date', type: 'date' },
    yaxis: { title: 'Value' },
    margin: { t: 50, b: 50, l: 50, r: 50 },
    showlegend: true
  };

  Plotly.newPlot('vix-chart', traces, layout);
}

*/

document.addEventListener('DOMContentLoaded', function () {
  console.log('Script started');
  document.querySelector('.button-row button[onclick="updateChart(30)"]').classList.add('active');

  fetch('/data/vix-data.json')
    .then(response => {
      console.log('Fetch response status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to fetch vix-data.json');
      }
      return response.json();
    })
    .then(data => {
      console.log('Loaded data:', data);
      console.log('First few entries:', data.slice(0, 3));
      allData = data.map(row => {
        const [month, day, year] = row.Date.split('/');
        const normalizedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        const parsedDate = new Date(normalizedDate);
        console.log('Parsed date for', row.Date, ':', parsedDate);
        return {
          Date: parsedDate,
          VX_Spot: row.VX_Spot,
          VIX_Spot: row.VIX_Spot
        };
      });
      console.log('Processed allData:', allData.slice(0, 3));
      selectedDate = new Date(allData[allData.length - 1].Date);
      updateChartWithDate();
    })
    .catch(error => {
      console.error('Fetch or processing error:', error);
    });
});