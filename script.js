        const tabs = document.querySelectorAll('.tab-bar a');
        const contents = document.querySelectorAll('.content');
        const tableBody = document.querySelector("#write-plan-table tbody");
        const resetButton = document.getElementById('reset-table');
        const chartCanvas = document.getElementById('write-plan-chart');
        const musicButtons = document.querySelectorAll('.music-item button');
        const audioPlayer = document.getElementById('music-player');
        let chartInstance = null;

        function switchTab(event) {
            event.preventDefault();
            const target = event.currentTarget.getAttribute('data-target');

            tabs.forEach(tab => tab.classList.remove('active-tab'));
            event.currentTarget.classList.add('active-tab');

            contents.forEach(content => {
                content.classList.remove('active');
                if (content.id === target) {
                    content.classList.add('active');
                }
            });

            if (target === 'grafik-content') {
                updateChart();
            }
        }

        tabs.forEach(tab => tab.addEventListener('click', switchTab));

        function addRow(day, saldoAwal = 0) {
            if (day > 30) return;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${day}</td>
                <td><input type="number" value="${saldoAwal}" data-saldo="${day}" ${day === 1 ? "" : "readonly"}></td>
                <td><input type="number" placeholder="0.01" data-lot="${day}"></td>
                <td><input type="number" placeholder="0" data-profit="${day}"></td>
            `;
            tableBody.appendChild(row);

            const profitInput = row.querySelector(`input[data-profit="${day}"]`);
            profitInput.addEventListener("input", () => {
                const profit = parseFloat(profitInput.value) || 0;
                const saldoInput = document.querySelector(`input[data-saldo="${day}"]`);
                const saldoAwal = parseFloat(saldoInput.value) || 0;

                const nextDay = day + 1;
                const saldoAkhir = saldoAwal + profit;

                if (nextDay <= 30) {
                    if (!document.querySelector(`input[data-saldo="${nextDay}"]`)) {
                        addRow(nextDay, saldoAkhir);
                    } else {
                        const nextSaldoInput = document.querySelector(`input[data-saldo="${nextDay}"]`);
                        nextSaldoInput.value = saldoAkhir;
                    }
                }
            });
        }

        function resetTable() {
            tableBody.innerHTML = "";
            addRow(1, 500000);
        }

        resetButton.addEventListener("click", resetTable);

function calculateStatistics(filter) {
    const rows = document.querySelectorAll('#write-plan-table tbody tr');
    const today = new Date();

    let balance = 0;
    let profit = 0;
    let loss = 0;

    rows.forEach(row => {
        // Ambil data hari dari kolom pertama
        const dayCell = row.cells[0].textContent.trim();
        const dayMatch = dayCell.match(/(\d+)/); // Cari angka dalam teks seperti "Hari 1"
        const day = dayMatch ? parseInt(dayMatch[1], 10) : null;

        if (!day) return; // Lewati jika tidak ada angka

        // Hitung rentang waktu berdasarkan filter
        const daysFromToday = today.getDate() - day; // Asumsikan `day` adalah tanggal dalam bulan ini

        let includeRow = false;

        if (filter === "today") {
            includeRow = daysFromToday === 0; // Hari ini
        } else if (filter === "3days") {
            includeRow = daysFromToday >= 0 && daysFromToday <= 2; // Rentang 3 hari
        } else if (filter === "7days") {
            includeRow = daysFromToday >= 0 && daysFromToday <= 6; // Rentang 7 hari
        } else if (filter === "1month") {
            includeRow = daysFromToday >= 0; // Semua dalam bulan ini
        }

        if (includeRow) {
            // Ambil saldo dan profit/rugi dari input di tabel
            const balanceInput = row.querySelector(`input[data-saldo="${day}"]`);
            const profitInput = row.querySelector(`input[data-profit="${day}"]`);

            const saldoValue = parseFloat(balanceInput?.value || 0);
            const profitValue = parseFloat(profitInput?.value || 0);

            balance = saldoValue; // Saldo diambil dari baris terakhir yang cocok
            if (profitValue > 0) {
                profit += profitValue; // Akumulasi keuntungan
            } else {
                loss += Math.abs(profitValue); // Akumulasi kerugian
            }
        }
    });

    // Tampilkan hasil di elemen statistik
    document.getElementById('balance-value').textContent = balance.toLocaleString();
    document.getElementById('profit-value').textContent = profit.toLocaleString();
    document.getElementById('loss-value').textContent = loss.toLocaleString();
}

// Tambahkan event listener untuk tombol filter
document.querySelectorAll('.filter-container button').forEach(button => {
    button.addEventListener('click', () => {
        const filter = button.getAttribute('data-filter');
        calculateStatistics(filter);
    });
});

// Hitung statistik default (Hari Ini) saat halaman dimuat
calculateStatistics('today');

        function getChartData() {
            const days = [];
            const saldoAkhir = [];

            document.querySelectorAll('input[data-saldo]').forEach((input, index) => {
                days.push(`H ${index + 1}`);
                saldoAkhir.push(parseFloat(input.value) || 0);
            });

            return { days, saldoAkhir };
        }

        function updateChart() {
            const { days, saldoAkhir } = getChartData();

            if (chartInstance) {
                chartInstance.destroy();
            }

            chartInstance = new Chart(chartCanvas, {
                type: 'line',
                data: {
                    labels: days,
                    datasets: [{
                        label: '',
                        data: saldoAkhir,
                        borderColor: '#007BFF',
                        backgroundColor: 'rgba(0, 123, 255, 0.2)',
                        fill: true,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: '',
                                color: '#333',
                                font: { size: 14 },
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: '',
                                color: '#333',
                                font: { size: 14 },
                            }
                        }
                    }
                }
            });
        }

    // Fungsi untuk menyimpan data tabel ke localStorage
    function saveTableData() {
        const tableData = [];
        document.querySelectorAll('#write-plan-table tbody tr').forEach(row => {
            const day = row.cells[0].textContent.trim();
            const saldo = row.querySelector(`input[data-saldo]`).value;
            const lot = row.querySelector(`input[data-lot]`).value;
            const profit = row.querySelector(`input[data-profit]`).value;

            tableData.push({ day, saldo, lot, profit });
        });

        localStorage.setItem('tableData', JSON.stringify(tableData));
    }

    // Fungsi untuk memuat data tabel dari localStorage
    function loadTableData() {
        const savedData = localStorage.getItem('tableData');
        if (savedData) {
            const tableData = JSON.parse(savedData);
            tableBody.innerHTML = ""; // Hapus isi tabel sebelum memuat data

            tableData.forEach(data => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${data.day}</td>
                    <td><input type="number" value="${data.saldo}" data-saldo="${data.day}" ${data.day === "1" ? "" : "readonly"}></td>
                    <td><input type="number" placeholder="0.01" data-lot="${data.day}" value="${data.lot}"></td>
                    <td><input type="number" placeholder="0" data-profit="${data.day}" value="${data.profit}"></td>
                `;
                tableBody.appendChild(row);

                // Tambahkan event listener untuk input perubahan profit
                const profitInput = row.querySelector(`input[data-profit="${data.day}"]`);
                profitInput.addEventListener("input", () => {
                    const profit = parseFloat(profitInput.value) || 0;
                    const saldoInput = document.querySelector(`input[data-saldo="${data.day}"]`);
                    const saldoAwal = parseFloat(saldoInput.value) || 0;

                    const nextDay = parseInt(data.day) + 1;
                    const saldoAkhir = saldoAwal + profit;

                    if (nextDay <= 30) {
                        if (!document.querySelector(`input[data-saldo="${nextDay}"]`)) {
                            addRow(nextDay, saldoAkhir);
                        } else {
                            const nextSaldoInput = document.querySelector(`input[data-saldo="${nextDay}"]`);
                            nextSaldoInput.value = saldoAkhir;
                        }
                    }

                    saveTableData(); // Simpan data setiap kali ada perubahan
                });
            });
        } else {
            resetTable(); // Jika tidak ada data, reset tabel
        }
    }

    // Update data ke localStorage saat ada perubahan di tabel
    tableBody.addEventListener('input', saveTableData);

    // Simpan data saat reset tabel
    resetButton.addEventListener("click", () => {
        resetTable();
        saveTableData();
    });

    // Muat data saat halaman di-refresh
    document.addEventListener('DOMContentLoaded', loadTableData);

    // Simpan data ke localStorage setelah menghitung statistik
    document.querySelectorAll('.filter-container button').forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            calculateStatistics(filter);
            saveTableData();
        });
    });

        musicButtons.forEach(button => {
            button.addEventListener('click', () => {
                const src = button.getAttribute('data-src');
                audioPlayer.src = src;
                audioPlayer.play();
            });
        });

        addRow(1, 500000);
