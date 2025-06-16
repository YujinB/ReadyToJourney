import { useEffect, useState } from "react";
import profile from "../profile.jpg"

function MyPage() {
  const [userInfo, setUserInfo] = useState(null);
  const [travelSummaries, setTravelSummaries] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL;


  useEffect(() => {
    async function fetchData() {
      try {
        const userRes = await fetch(`${API_URL}/userInfo`);
        const userData = await userRes.json();
        setUserInfo(userData);

        const travelRes = await fetch(`${API_URL}/events`);
        const travelData = await travelRes.json();
        setTravelSummaries(travelData);
      } catch (error) {
        console.error("데이터 불러오기 실패", error);
      }
    }

    fetchData();
  }, []);

  if (!userInfo) return <div>로딩중...</div>;

  return (
    <div style={{ minHeight:"380px", display: "flex", gap: "40px", padding: "50px 120px"}}>
      {/* 왼쪽 사용자 정보 */}
      <div style={{ flex: "1", borderRight: "1px solid #ccc", display:"flex", flexDirection:"column", gap:"10px", alignContent:"center", textAlign:"center", fontSize:"18px"}}>
        <img src={profile} style={{width:"200px", height:"200px", display:"block", margin:"0 auto", marginBottom:"10px"}}/>
        <p>
          <strong>이름:</strong> {userInfo.name}
        </p>
        <p>
          <strong>이메일:</strong> {userInfo.email}
        </p>
      </div>

      {/* 오른쪽 여행 플랜 카드 */}
      <div style={{ flex: "2", display:"flex", flexDirection:"column", gap:"10px"}}>
        <h2 style={{marginBottom:"10px"}}>여행 플랜 목록</h2>
        {travelSummaries.length === 0 ? (
          <p>등록된 여행 플랜이 없습니다.</p>
        ) : (
          travelSummaries.map((plan) => (
            <div
              key={plan.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "15px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              <h3>{plan.title}</h3>
              <p>
                일정: {new Date(plan.start).toLocaleDateString()} ~ {new Date(plan.end).toLocaleDateString()}
                </p>
              <p>총 지출: {plan.totalExpense.toLocaleString()} 원</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MyPage;
