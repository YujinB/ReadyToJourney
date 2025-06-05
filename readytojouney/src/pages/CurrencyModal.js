// src/components/CurrencyModal.js
import { useEffect, useState } from "react";
import styles from './Financial.module.css';

const majorCurrencies = ['USD', 'EUR', 'JPY', 'CNY', 'TWD', 'GBP'];

function CurrencyModal({ onClose }) {
  const [isCalculatorMode, setIsCalculatorMode] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({});
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [foreignAmount, setForeignAmount] = useState('');
  const [krwAmount, setKrwAmount] = useState('');

  useEffect(() => {
    fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`)
      .then(res => res.json())
      .then(data => setExchangeRates(data.rates))
      .catch(() => alert("환율 정보를 불러오지 못했습니다."));
  }, [baseCurrency]);

  const handleForeignChange = (e) => {
    const value = e.target.value;
    setForeignAmount(value);
    const rate = exchangeRates['KRW'];
    if (rate && !isNaN(value) && value !== '') {
      const adjusted = baseCurrency === 'JPY' ? value * 100 : value;
      setKrwAmount((adjusted * rate).toFixed(2));
    } else {
      setKrwAmount('');
    }
  };

  const handleKrwChange = (e) => {
    const value = e.target.value;
    setKrwAmount(value);
    const rate = exchangeRates['KRW'];
    if (rate && !isNaN(value) && value !== '') {
      const raw = value / rate;
      const adjusted = baseCurrency === 'JPY' ? raw / 100 : raw;
      setForeignAmount(adjusted.toFixed(2));
    } else {
      setForeignAmount('');
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        {!isCalculatorMode ? (
          <>
            <div style={{display:"flex", justifyContent:"space-between"}}>
                <h3>🌍 주요 국가 실시간 환율 (기준: KRW)</h3>
                <button style={{marginRight:"10px"}} onClick={() => setIsCalculatorMode(true)}>환율 계산하기</button>
            </div>
            <ul style={{ fontSize: '16px', maxHeight: '300px', overflowY: 'auto', listStyle:"none", margin:"20px 0 5px 0"}}>
            {majorCurrencies.map((code) => {
                const rate = exchangeRates[code];
                let displayRate = '로딩 중...';

                if (rate && exchangeRates['KRW']) {
                let krwPerUnit = exchangeRates['KRW'] / rate;

                if (code === 'JPY') {
                    krwPerUnit = (krwPerUnit * 100).toFixed(2); // 100엔 기준
                    displayRate = `${code} ≈ ${krwPerUnit} KRW`;
                } else {
                    displayRate = `${code} ≈ ${krwPerUnit.toFixed(2)} KRW`;
                }
                }

                return <li key={code}>{displayRate}</li>;
            })}
            </ul>
            <div style={{display:"flex", justifyContent:"end"}}>
                <button onClick={onClose}>닫기</button>
            </div>
          </>
        ) : (
          <>
            <h3>💱 외화 ⇄ 원화 계산기</h3>

            <label style={{display:"flex", alignItems:"center", gap:"5px"}}>
              외화 선택 :
              <select
                value={baseCurrency}
                onChange={(e) => {
                  setBaseCurrency(e.target.value);
                  setForeignAmount('');
                  setKrwAmount('');
                }}
              >
                {majorCurrencies.map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>

              <p style={{ fontSize: '14px', marginLeft: '10px' }}>
                환율: {
                    exchangeRates['KRW']
                    ? baseCurrency === 'JPY'
                        ? `100 JPY ≈ ${(exchangeRates['KRW'] * 100).toFixed(2)} KRW`
                        : `1 ${baseCurrency} ≈ ${exchangeRates['KRW'].toFixed(2)} KRW`
                    : '로딩 중...'
                }
                </p>
            </label>

            

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                    type="number"
                    placeholder={`${baseCurrency} 입력`}
                    value={foreignAmount}
                    onChange={handleForeignChange}
                    style={{ flex: 1 }}
                    />
                    <span>{baseCurrency}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                    type="number"
                    placeholder="KRW 입력"
                    value={krwAmount}
                    onChange={handleKrwChange}
                    style={{ flex: 1 }}
                    />
                    <span>KRW</span>
                </div>
                </div>


            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <button onClick={() => setIsCalculatorMode(false)}>← 뒤로</button>
              <button onClick={onClose}>닫기</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CurrencyModal;
