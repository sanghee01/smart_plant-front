import styled from "styled-components";
import HistoryLineChart from "../../components/HistoryLineChart";
import { useEffect } from "react";
import { useGetPlantHistoryData } from "../../hooks/useGetPlantHistoryData";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { plantHistoryState } from "../../state/plantState";
import HistoryBarChart from "../../components/HistoryBarChart";
import { userState } from "../../state/userState";

const History = () => {
  const getPlantHistoryData = useGetPlantHistoryData();
  const plantHistoryData = useRecoilValue(plantHistoryState);
  const user = useRecoilValue(userState);
  const setPlantHistory = useSetRecoilState(plantHistoryState);

  useEffect(() => {
    let intervalId: any;
    if (plantHistoryData.length === 0 && user?.username === "koala") {
      // 현재 아두이노 기기 가지고 있는 계정이 코알라뿐이므로
      getPlantHistoryData();
    } else if (user?.username === "koala") {
      // 3분마다 식물 데이터 업데이트 요청
      intervalId = setInterval(() => {
        getPlantHistoryData();
      }, 180000);
    } else if (user?.username !== "koala") {
      // 식물 1이 아닐 경우 더미데이터로 대체
      fetch("/plant-history.json")
        .then((response) => response.json())
        .then((data) => setPlantHistory(data.content.content));
    }

    // cleanup 함수 반환
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []); // 빈 배열을 두 번째 인자로 전달하여 한 번만 실행되도록 설정

  const dateList = plantHistoryData.map((data) => data.createdDate);
  const tempList = plantHistoryData.map((data) => data.temp);
  const humidityList = plantHistoryData.map((data) => data.humidity);
  const soilHumidityList = plantHistoryData.map((data) => (data.soilHumidity / 1000) * 100);
  const lightList = plantHistoryData.map((data) =>
    100 - (data.light / 2000) * 100 < 0 ? 0 : 100 - (data.light / 2000) * 100,
  );
  const remainingWaterList = plantHistoryData.map((data) => (data.remainingWater / 3000) * 100);
  const gaveWaterList = plantHistoryData.map((data) => Number(data.gaveWater));

  return (
    <Container>
      <h3>식물 히스토리</h3>
      <HistoryLineChart
        dataName="온도(°C)"
        min={0}
        max={30}
        dataList={dateList}
        value={tempList}
        borderColor="#ff7e5d"
        backgroundColor="#f1ad9c"
      />
      <HistoryLineChart
        dataName="습도(%)"
        min={0}
        max={100}
        dataList={dateList}
        value={humidityList}
        borderColor="#8ebbf5"
        backgroundColor="#c0d9f5"
      />
      <HistoryLineChart
        dataName="토양 습도(%)"
        min={0}
        max={100}
        dataList={dateList}
        value={soilHumidityList}
        borderColor="#c27203"
        backgroundColor="#d7c4a7"
      />
      <HistoryLineChart
        dataName="빛의 세기(%)"
        min={0}
        max={100}
        dataList={dateList}
        value={lightList}
        borderColor="#ffd000"
        backgroundColor="#fffed3"
      />
      <HistoryBarChart
        dataName="물통에 남은 물의 양(%)"
        min={0}
        max={100}
        dataList={dateList}
        value={remainingWaterList}
        backgroundColor="#b9e8f7"
      />
      <HistoryBarChart
        dataName="물주기 여부 (0, 1)"
        min={0}
        max={1}
        dataList={dateList}
        value={gaveWaterList}
        backgroundColor="#979cf5"
      />
    </Container>
  );
};

export default History;

const Container = styled.div`
  margin: 0 auto;
  width: 80%;
  padding-bottom: 130px;
  h3 {
    padding: 30px 0;
  }
  canvas {
    margin-bottom: 30px;
  }
`;
