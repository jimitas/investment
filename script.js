let myChart = null;

// レート設定
const SAVING_RATE_PERCENT = 0.3; // 貯蓄金利は固定
let INVESTMENT_RATE_PERCENT = 5.0; // 投資利回りは変更可能

document.getElementById('simulateBtn').addEventListener('click', function() {
    const investmentRate = parseFloat(document.getElementById('investmentRate').value);
    const monthlyAmount = parseFloat(document.getElementById('monthlyAmount').value);
    const investmentYears = parseInt(document.getElementById('investmentYears').value);

    if (!investmentRate && investmentRate !== 0 || investmentRate < 0 || investmentRate > 100) {
        alert('投資利回りは0%から100%の間で入力してください');
        return;
    }

    if (!monthlyAmount || monthlyAmount <= 0) {
        alert('正しい金額を入力してください');
        return;
    }

    if (!investmentYears || investmentYears < 1 || investmentYears > 50) {
        alert('投資期間は1年から50年の間で入力してください');
        return;
    }

    // 投資利回りを更新
    INVESTMENT_RATE_PERCENT = investmentRate;

    // info-panelの運用期間を更新
    document.getElementById('displayPeriod').textContent = `${investmentYears}年間 (複利)`;

    simulateInvestment(monthlyAmount * 10000, investmentYears);
});

document.getElementById('investmentRate').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('simulateBtn').click();
    }
});

document.getElementById('monthlyAmount').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('simulateBtn').click();
    }
});

document.getElementById('investmentYears').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('simulateBtn').click();
    }
});

function simulateInvestment(monthlyAmount, years) {
    const savingRate = (SAVING_RATE_PERCENT / 100) / 12;
    const investmentRate = (INVESTMENT_RATE_PERCENT / 100) / 12;
    const months = years * 12;

    let savingData = [];
    let investmentData = [];
    let labels = [];

    let savingTotal = 0;
    let investmentTotal = 0;

    // ラベルの間隔を年数に応じて調整
    let labelInterval;
    if (years <= 10) {
        labelInterval = 12; // 1年ごと
    } else if (years <= 30) {
        labelInterval = 24; // 2年ごと
    } else {
        labelInterval = 60; // 5年ごと
    }

    for (let month = 1; month <= months; month++) {
        savingTotal = (savingTotal * (1 + savingRate)) + monthlyAmount;
        investmentTotal = (investmentTotal * (1 + investmentRate)) + monthlyAmount;

        savingData.push(Math.round(savingTotal));
        investmentData.push(Math.round(investmentTotal));

        if (month % labelInterval === 0) {
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

    updateFormulaSection(monthlyAmount, years, months, principal, savingData[months - 1], investmentData[months - 1], savingInterest, investmentProfit, difference);

    drawChart(labels, savingData, investmentData);
}

function updateFormulaSection(monthlyAmount, years, months, principal, savingTotal, investmentTotal, savingInterest, investmentProfit, difference) {
    // 万円単位に変換
    const monthlyManEn = monthlyAmount / 10000;

    // 投資の計算
    const investmentRate = (INVESTMENT_RATE_PERCENT / 100) / 12;
    const investmentMultiplier = ((Math.pow(1 + investmentRate, months) - 1) / investmentRate);
    const investmentPow = Math.pow(1 + investmentRate, months);

    // 貯蓄の計算
    const savingRate = (SAVING_RATE_PERCENT / 100) / 12;
    const savingMultiplier = ((Math.pow(1 + savingRate, months) - 1) / savingRate);

    // 年数の表示を更新
    document.getElementById('yearsInTitle').textContent = years;
    document.getElementById('yearsInFormula1').textContent = years;
    document.getElementById('yearsInFormula2').textContent = years;
    document.getElementById('monthsInFormula').textContent = months;
    document.getElementById('monthsInDetail').textContent = months;
    document.getElementById('yearsInDetail').textContent = years;
    document.getElementById('yearsInInvestCalc1').textContent = years;
    document.getElementById('yearsInSavingCalc1').textContent = years;
    document.getElementById('yearsInComparison').textContent = years;

    // HTMLを更新
    document.getElementById('formulaMonthlyAmount').textContent = monthlyManEn.toFixed(0);

    // 投資の計算過程
    const investmentRateStr = investmentRate.toFixed(6);
    const investmentRateDisplay = investmentRateStr.replace(/0+$/, '').replace(/\.$/, '');
    document.getElementById('investmentMonthlyRate').textContent = investmentRateDisplay;

    const investmentCalc1 = document.getElementById('investmentCalc1');
    investmentCalc1.innerHTML = `<span id="yearsInInvestCalc1">${years}</span>年後の資産 = ${formatCurrency(monthlyAmount)} × {((1.${investmentRateStr.slice(2)})<sup>${months}</sup> - 1) ÷ ${investmentRateDisplay}}`;

    const investmentCalc2 = document.getElementById('investmentCalc2');
    investmentCalc2.textContent = `　　　　　　 = ${formatCurrency(monthlyAmount)} × {(${investmentPow.toFixed(3)} - 1) ÷ ${investmentRateDisplay}}`;

    document.getElementById('investmentCalc3').textContent = `　　　　　　 = ${formatCurrency(monthlyAmount)} × ${Math.round(investmentMultiplier)}`;
    document.getElementById('investmentResult').textContent = formatCurrency(investmentTotal);
    document.getElementById('investmentPrincipalFormula').textContent = formatCurrency(principal);
    document.getElementById('investmentProfitFormula').textContent = formatCurrency(investmentProfit);

    // 貯蓄の計算過程
    const savingRateStr = savingRate.toFixed(6);
    const savingRateDisplay = savingRateStr.replace(/0+$/, '').replace(/\.$/, '');
    document.getElementById('savingMonthlyRate').textContent = savingRateDisplay;

    const savingCalc1 = document.getElementById('savingCalc1');
    savingCalc1.innerHTML = `<span id="yearsInSavingCalc1">${years}</span>年後の資産 = ${formatCurrency(monthlyAmount)} × {((1.${savingRateStr.slice(2)})<sup>${months}</sup> - 1) ÷ ${savingRateDisplay}}`;

    document.getElementById('savingCalc2').textContent = `　　　　　　 = ${formatCurrency(monthlyAmount)} × ${Math.round(savingMultiplier)}`;
    document.getElementById('savingResult').textContent = formatCurrency(savingTotal);
    document.getElementById('savingPrincipalFormula').textContent = formatCurrency(principal);
    document.getElementById('savingInterestFormula').textContent = formatCurrency(savingInterest);

    // 差額
    document.getElementById('formulaDifference').textContent = formatCurrency(difference);

    // レート表示を更新
    updateRateDisplays();
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
                    label: `貯蓄 (${SAVING_RATE_PERCENT.toFixed(1)}%)`,
                    data: savingData,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: borderWidth,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: `投資 (${INVESTMENT_RATE_PERCENT.toFixed(1)}%)`,
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

function updateRateDisplays() {
    // レート表示用のフォーマット関数
    const formatRate = (rate) => {
        // 小数点以下の桁数を調整（0.3 -> "0.3%", 5.0 -> "5.0%"）
        return rate.toFixed(1) + '%';
    };

    const savingRateText = formatRate(SAVING_RATE_PERCENT);
    const investmentRateText = formatRate(INVESTMENT_RATE_PERCENT);

    // 上部パネル
    document.getElementById('savingRateDisplay').textContent = savingRateText;
    document.getElementById('investmentRateDisplay').textContent = investmentRateText;

    // サマリーセクション
    document.getElementById('savingRateSummary').textContent = savingRateText;
    document.getElementById('investmentRateSummary').textContent = investmentRateText;

    // 計算式セクション
    document.getElementById('investmentRateFormula').textContent = investmentRateText.replace('.0', '');
    document.getElementById('investmentRateFormulaText').textContent = investmentRateText.replace('.0', '');
    document.getElementById('savingRateFormula').textContent = savingRateText;
    document.getElementById('savingRateFormulaText').textContent = savingRateText;
}

// ページ読み込み時に初期表示を更新
document.addEventListener('DOMContentLoaded', function() {
    // 投資利回りの入力フィールドから初期値を読み取る
    const investmentRateInput = document.getElementById('investmentRate');

    if (investmentRateInput.value) {
        INVESTMENT_RATE_PERCENT = parseFloat(investmentRateInput.value);
    }

    updateRateDisplays();
});
