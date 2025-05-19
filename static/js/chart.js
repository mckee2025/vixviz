(function() {
       // 定义全局变量
       let allData = [];
       let daysToShow = 30;
       let showVIX = true;
       let showVX = true;
       let selectedDate = new Date('2025-05-15');

       // 定义全局函数
       window.updateChart = function(days) {
         daysToShow = days;
         document.querySelectorAll('.button-row button').forEach(btn => btn.classList.remove('active'));
         document.querySelector(`.button-row button[onclick="updateChart(${days})"]`).classList.add('active');
         window.updateChartWithDate();
       };

       window.toggleSeries = function(series) {
         if (series === 'VIX') {
           showVIX = !showVIX;
         }
         if (series === 'VX') {
           showVX = !showVX;
         }
         window.updateChartWithDate();
       };

       window.updateChartWithDate = function() {
         console.log('Updating chart with date:', selectedDate);
         const datePicker = document.getElementById('datePicker');
         console.log('datePicker:', datePicker);
         console.log('datePicker.value:', datePicker.value);
         if (datePicker && datePicker.value) {
           // Robust date parsing
           const [year, month, day] = datePicker.value.split('-');
           const parsedDate = new Date(year, month - 1, day);
           if (!isNaN(parsedDate.getTime())) {
             selectedDate = parsedDate;
           } else {
             console.warn('Invalid date selected:', datePicker.value);
           }
         }
         console.log('selectedDate:', selectedDate);

         const startDate = new Date(selectedDate);
         startDate.setDate(startDate.getDate() - daysToShow);
         console.log('startDate:', startDate, 'selectedDate:', selectedDate);

         const filteredData = allData.filter(row => {
           return row.Date >= startDate && row.Date <= selectedDate;
         });
         console.log('Filtered data length:', filteredData.length);
         console.log('Filtered data sample:', filteredData.slice(0, 3));

         const latestEntry = allData[allData.length - 1];
         document.getElementById('latest-date').textContent = latestEntry.Date.toISOString().split('T')[0];
         document.getElementById('latest-vix').textContent = latestEntry['VIX Closing'] ? latestEntry['VIX Closing'].toFixed(2) : 'N/A';
         document.getElementById('latest-vx').textContent = latestEntry['VX Closing'] ? latestEntry['VX Closing'].toFixed(2) : 'N/A';

         const traces = [];
         if (showVX) {
           traces.push({
             x: filteredData.map(row => row.Date),
             y: filteredData.map(row => row['VX Closing']),
             type: 'scatter',
             mode: 'lines',
             name: 'VX Spot',
             line: { color: '#1f77b4', connectgaps: false, shape: 'spline' },
             hovertemplate: '%{x|%Y-%m-%d}<br>VX: %{y:.2f}<extra></extra>'
           });
         }
         if (showVIX) {
           traces.push({
             x: filteredData.map(row => row.Date),
             y: filteredData.map(row => row['VIX Closing']),
             type: 'scatter',
             mode: 'lines',
             name: 'VIX Spot',
             line: { color: '#ff7f0e', connectgaps: false, shape: 'spline' },
             hovertemplate: '%{x|%Y-%m-%d}<br>VIX: %{y:.2f}<extra></extra>'
           });
         }
         console.log('Traces:', traces);

         const layout = {
           title: {
             text: `VIX and VX Trends (${daysToShow} Days)`,
             font: { size: window.innerWidth <= 768 ? 14 : 18 }
           },
           xaxis: {
             title: 'Date',
             type: 'date',
             tickangle: window.innerWidth <= 768 ? 45 : 0,
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
             orientation: window.innerWidth <= 768 ? 'h' : 'v',
             x: 0,
             y: -0.2
           },
           hovermode: 'x unified'
         };

         Plotly.newPlot('vix-chart', traces, layout);
       };

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
                 'VX Closing': row['VX Closing'] ? parseFloat(row['VX Closing']) : null,
                 'VIX Closing': row['VIX Closing'] ? parseFloat(row['VIX Closing']) : null
               };
             });
             console.log('Processed allData:', allData.slice(0, 3));
             selectedDate = new Date(allData[allData.length - 1].Date);
             window.updateChartWithDate();
           })
           .catch(error => {
             console.error('Fetch or processing error:', error);
           });
       });
     })();