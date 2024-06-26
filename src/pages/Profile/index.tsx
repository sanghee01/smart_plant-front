import { FaBookBookmark } from "react-icons/fa6";
import { FaTrophy } from "react-icons/fa";
import { IoChevronBackOutline } from "react-icons/io5";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { Link } from "react-router-dom";
import {
  ProfileBackGround,
  Header,
  Text,
  Main,
  ProfileCard,
  ProfileBox,
  DetailBox,
  PlantImg,
  Level,
  CharacterName,
  BtnContainer,
  BtnBox,
  TextBox,
  IconBox,
  QuestBox,
  HeaderLeft,
  CheckBox,
  CheckImg,
  DetailBoxContainer,
} from "./styles";
import React, { useEffect } from "react";
import axios from "axios";
import { useRecoilValue, useRecoilState } from "recoil";
import { userState } from "../../state/userState";
import { useLocation, useNavigate } from "react-router-dom";
import { plantImgState, plantState, todayMessageState } from "../../state/plantState";
import { isCheckedInState } from "../../state/checkState";
import { errorAlert, successAlert, Confirm, CheckConfirm } from "../../components/Alert";
import { usePlantList } from "../../hooks/useGetPlantList";

const Profile: React.FC = () => {
  const user = useRecoilValue(userState);
  const plant = useRecoilValue(plantState);
  const [todayMessage, setTodayMessage] = useRecoilState(todayMessageState);
  const [isCheckedIn, setIsCheckedIn] = useRecoilState(isCheckedInState);
  const [, setPlant] = useRecoilState(plantState);
  const [, setPlantImg] = useRecoilState(plantImgState);

  const location = useLocation();
  const navigate = useNavigate();

  // URL에서 plantId 쿼리 파라미터 읽기
  const queryParams = new URLSearchParams(location.search);
  const plantId = queryParams.get("plantId");
  const fetchPlantList = usePlantList(); // 식물 목록을 가져오는 훅

  useEffect(() => {
    const fetchPlantData = async () => {
      // user가 있을 경우에만 요청 실행
      if (user && user.accessToken && plantId) {
        try {
          await axios.get(`${import.meta.env.VITE_SERVER_APIADDRESS}/plant/${plantId}`, {
            headers: {
              Authorization: `Bearer ${user.accessToken}`,
            },
          });

          // 식물 데이터 가져오기
          const historyResponse = await axios.get(
            `${import.meta.env.VITE_SERVER_APIADDRESS}/plant-history/${plantId}`,
            {
              headers: {
                Authorization: `Bearer ${user.accessToken}`,
              },
            },
          );

          if (historyResponse.data.content.content.length === 0) {
            //식물 기록 없을 경우
            setTodayMessage("아이 촉촉해~");
            return;
          }
          // soilHumidity에 따른 메시지 설정
          const { soilHumidity } = historyResponse.data.content.content[0];
          if (soilHumidity < 500) {
            setTodayMessage("생명수가 필요해!");
          } else if (soilHumidity >= 500 && soilHumidity < 1000) {
            setTodayMessage("아이 촉촉해~");
          } else {
            setTodayMessage("혹시 여기 수영장?");
          }
        } catch (error) {
          console.error("데이터를 가져오는 중 에러가 발생했습니다:", error);
        }
      }
    };

    fetchPlantData();
  }, [plantId, user]);

  useEffect(() => {
    const checkInStatus = async () => {
      if (user && user.accessToken) {
        // 로그인 상태 확인
        try {
          const response = await axios.get(`${import.meta.env.VITE_SERVER_APIADDRESS}/member/checkin`, {
            headers: {
              Authorization: `Bearer ${user.accessToken}`, // 사용자 인증 토큰
            },
          });

          // API 응답으로부터 출석체크 상태를 확인합니다.
          if (response.data.content === true) {
            setIsCheckedIn(true); // 이미 출석체크를 했다면 상태를 true로 변경
          } else {
            setIsCheckedIn(false); // 그렇지 않으면 false로 설정
          }
        } catch (error) {
          console.error("출석체크 상태 확인 중 에러가 발생했습니다:", error);
        }
      }
    };

    checkInStatus();
  }, [user]);

  useEffect(() => {
    // sessionStorage에서 출석체크 상태를 읽어와서 Recoil 상태를 업데이트
    const storedIsCheckedIn = sessionStorage.getItem("isCheckedIn") === "true";
    setIsCheckedIn(storedIsCheckedIn);
  }, []);

  const handleDeletePlant = async (e: React.MouseEvent<EventTarget>) => {
    e.preventDefault();

    const isConfirmedDelete = await Confirm("정말로 식물을 삭제하시겠습니까?");
    if (user && user.accessToken && plantId && isConfirmedDelete) {
      try {
        await axios.delete(`${import.meta.env.VITE_SERVER_APIADDRESS}/plant/${plantId}`, {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        });
        await successAlert("식물이 삭제되었습니다.");
        await fetchPlantList(); // 식물 목록을 최신 상태로 업데이트
        setPlant({
          id: 0,
          name: "",
          exp: 0,
          level: 1,
          plantType: "",
          uuid: "",
          giveWater: false,
          createDate: "",
          imgPath: "",
        });
        setPlantImg("");
        navigate("/myplant");
      } catch (error) {
        console.error("식물 삭제 중 에러가 발생했습니다:", error);
        await errorAlert("식물을 삭제하는데 실패했습니다.");
      }
    }
  };

  const handleCheckIn = async () => {
    const confirmCheckIn = await CheckConfirm("출석체크하시겠습니까?");
    if (user && user.accessToken && confirmCheckIn) {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_SERVER_APIADDRESS}/member/checkin`,
          {},
          {
            headers: {
              Authorization: `Bearer ${user.accessToken}`,
            },
          },
        );

        if (response.status === 200) {
          setIsCheckedIn(true); // Recoil 상태 업데이트
          sessionStorage.setItem("isCheckedIn", "true"); // sessionStorage에 출석체크 상태 저장
          await successAlert("출석체크가 완료되었습니다.");
          console.log("출석체크 응답:", response);
        }
      } catch (error) {
        console.error("출석체크 중 에러가 발생했습니다:", error);
        await errorAlert("출석체크에 실패했습니다.");
      }
    }
  };

  return (
    <ProfileBackGround>
      <Header>
        <HeaderLeft>
          <IoChevronBackOutline onClick={() => navigate("/myplant")} size="30" />
          <h3>식물이야기</h3>
        </HeaderLeft>
        <RiDeleteBin6Fill size="35" onClick={handleDeletePlant} />
      </Header>
      <Main>
        <ProfileCard>
          <ProfileBox>
            <PlantImg src={plant.imgPath} alt="plant" />
            <CharacterName>{plant.name}</CharacterName>
            <Level>Lv.{plant.level}</Level>
          </ProfileBox>
          <DetailBoxContainer>
            <DetailBox>
              <Text>{plant.createDate}</Text>
              <span>생년월일</span>
            </DetailBox>
            <DetailBox>
              <Text>{plant.exp}%</Text>
              <span>애정도</span>
            </DetailBox>
            <DetailBox>
              <Text>{todayMessage}</Text>
              <span>오늘의 한마디</span>
            </DetailBox>
          </DetailBoxContainer>
        </ProfileCard>
        <BtnContainer>
          <BtnBox>
            <Link to="/encyclopedia">
              <TextBox>
                <Text>식물도감</Text>
              </TextBox>
              <IconBox>
                <FaBookBookmark color="#a8511c" size="60" />
              </IconBox>
            </Link>
          </BtnBox>
          <BtnBox>
            <Link to="/achievement">
              <TextBox>
                <Text>명예의 전당</Text>
              </TextBox>
              <IconBox>
                <FaTrophy color="#ffc400" size="60" />
              </IconBox>
            </Link>
          </BtnBox>
        </BtnContainer>
        <QuestBox $isCheckedIn={isCheckedIn}>
          {isCheckedIn ? (
            <CheckBox>출석하셨습니다!</CheckBox>
          ) : (
            <CheckBox onClick={handleCheckIn}>출석체크를 해주세요!</CheckBox>
          )}
          <CheckBox onClick={!isCheckedIn ? handleCheckIn : undefined}>
            <CheckImg src={isCheckedIn ? "/assets/images/checked.png" : "/assets/images/nonCheck.png"} />
          </CheckBox>
        </QuestBox>
      </Main>
    </ProfileBackGround>
  );
};

export default Profile;
