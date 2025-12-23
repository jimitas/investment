let myChart = null;

document.getElementById('simulateBtn').addEventListener('click', function() {
    const monthlyAmount = parseFloat(document.getElementById('monthlyAmount').value);

    if (!monthlyAmount || monthlyAmount <= 0) {
        alert('正しい金額を入力してください');
        return;
    }

    simulateInvestment(monthlyAmount * 10000);
});

document.getElementById('monthlyAmount').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('simulateBtn').click();
    }
});

function simulateInvestment(monthlyAmount) {
    const savingRate = 0.003 / 12;
    const investmentRate = 0.05 / 12;
    const months = 240;

    let savingData = [];
    let investmentData = [];
    let labels = [];

    let savingTotal = 0;
    let investmentTotal = 0;

    for (let month = 1; month <= months; month++) {
        savingTotal = (savingTotal * (1 + savingRate)) + monthlyAmount;
        investmentTotal = (investmentTotal * (1 + investmentRate)) + monthlyAmount;

        savingData.push(Math.round(savingTotal));
        investmentData.push(Math.round(investmentTotal));

        if (month % 24 === 0) {
            labels.push(`${month / 12}年`);
        } else if (month === 1) {
            labels.push('0年');
        } else {
            labels.push('');
        }
    }

    const principal = monthlyAmount * months;
    const savingInterest = savingData[months - 1] - principal;
    const investmentProfit = investmentData[months - 1] - principal;
    const difference = investmentData[months - 1] - savingData[months - 1];

    document.getElementById('savingTotal').textContent = formatCurrency(savingData[months - 1]);
    document.getElementById('savingPrincipal').textContent = formatCurrency(principal);
    document.getElementById('savingInterest').textContent = formatCurrency(savingInterest);

    document.getElementById('investmentTotal').textContent = formatCurrency(investmentData[months - 1]);
    document.getElementById('investmentPrincipal').textContent = formatCurrency(principal);
    document.getElementById('investmentProfit').textContent = formatCurrency(investmentProfit);

    document.getElementById('difference').textContent = formatCurrency(difference);

    document.getElementById('resultSection').style.display = 'block';

    drawChart(labels, savingData, investmentData);
}

function drawChart(labels, savingData, investmentData) {
    const ctx = document.getElementById('myChart').getContext('2d');

    if (myChart !== null) {
        myChart.destroy();
    }

    const isMobile = window.innerWidth <= 480;
    const isTablet = window.innerWidth > 480 && window.innerWidth <= 768;

    const fontSize = isMobile ? 10 : isTablet ? 12 : 14;
    const legendPadding = isMobile ? 10 : isTablet ? 15 : 20;
    const borderWidth = isMobile ? 2 : 3;

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '貯蓄 (0.3%)',
                    data: savingData,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: borderWidth,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: '投資 (5.0%)',
                    data: investmentData,
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: borderWidth,
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: fontSize,
                            weight: 'bold'
                        },
                        padding: legendPadding,
                        boxWidth: isMobile ? 30 : 40
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    titleFont: {
                        size: fontSize
                    },
                    bodyFont: {
                        size: fontSize
                    },
                    padding: isMobile ? 8 : 12,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += formatCurrency(context.parsed.y);
                            return label;
                        },
                        title: function(tooltipItems) {
                            const index = tooltipItems[0].dataIndex;
                            const month = index + 1;
                            const year = Math.floor(month / 12);
                            const remainingMonth = month % 12;
                            if (remainingMonth === 0) {
                                return `${year}年目`;
                            } else {
                                return `${year}年${remainingMonth}ヶ月目`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: !isMobile,
                        text: '経過年数',
                        font: {
                            size: fontSize,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        font: {
                            size: fontSize - 2
                        },
                        maxRotation: 0,
                        minRotation: 0,
                        autoSkip: false,
                        callback: function(value, index) {
                            return this.getLabelForValue(value);
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: !isMobile,
                        text: '資産額 (円)',
                        font: {
                            size: fontSize,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        font: {
                            size: fontSize - 2
                        },
                        callback: function(value) {
                            if (isMobile) {
                                return '¥' + (value / 10000).toFixed(0) + '万';
                            }
                            return formatCurrency(value);
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

function formatCurrency(value) {
    return '¥' + Math.round(value).toLocaleString('ja-JP');
}
