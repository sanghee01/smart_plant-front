import { useNavigate } from "react-router";
import { useCallback, useEffect, useState, useRef } from "react";
import React from "react";
import {
  Container,
  Header,
  Logo,
  SubmitForm,
  InputBox,
  LoginCheckBox,
  Input,
  SubmitBtn,
  FindBox,
  KakaoLogin,
  EasyLoginBox,
} from "./style";
import { useSetRecoilState } from "recoil";
import { userState } from "../../state/userState";
import { useLocation } from "react-router";
import { login } from "../../services/loginApi";
import { useRedirectIfLoggedIn } from "../../hooks/useRedirectIfLoggedIn";
import { warningAlert, successAlert } from "../../components/Alert";

const SignIn = () => {
  useRedirectIfLoggedIn(); // 로그인 상태면 /home으로 redirect 되도록 하는 함수

  const navigate = useNavigate();
  const setUser = useSetRecoilState(userState);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activate = searchParams.get("activate");
  const didMountRef = useRef(false);

  useEffect(() => {
    if (!didMountRef.current && activate === "true") {
      didMountRef.current = true;
      successAlert("메일 인증 성공! 로그인을 해주세요.");
    }
  }, [activate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleChangeEmail = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);

  const handleChangePassword = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // 로그인 및 유저 정보 가져오기
      try {
        const response = await login(email, password); // authApi에서 login 함수 사용
        setUser({ username: response.username, email: response.email, accessToken: response.accessToken }); // 사용자 상태 업데이트

        navigate("/myplant");
      } catch (error: any) {
        const errorMessage = error.response.data.content;

        if (!errorMessage) {
          await warningAlert(error.response.data.message);
        }
        if (errorMessage.email && errorMessage.password) {
          await warningAlert(`아이디, 비밀번호는 ${errorMessage.email}.`);
        } else if (errorMessage.email) {
          await warningAlert(`아이디는 ${errorMessage.email}.`);
        } else if (errorMessage.password) {
          await warningAlert(`비밀번호는 ${errorMessage.password}.`);
        }
      }
    },
    [email, navigate, password, setUser],
  );

  return (
    <Container>
      <Header>
        <Logo src="/assets/images/logo2.png"></Logo>
        <p>나만의 무럭이 키우기를 시작해주세용!</p>
      </Header>
      <SubmitForm onSubmit={handleSubmit}>
        <InputBox>
          <Input type="email" id="email" name="email" onChange={handleChangeEmail} placeholder="이메일" />
          <Input type="password" id="password" name="password" onChange={handleChangePassword} placeholder="비밀번호" />
          <LoginCheckBox>
            <input type="checkbox" id="keeplogin" name="keeplogin" placeholder="로그인 상태 유지" />
            <span>로그인 상태 유지</span>
          </LoginCheckBox>
          <SubmitBtn type="submit">로그인</SubmitBtn>
        </InputBox>
        <FindBox>
          <span onClick={() => navigate("/findpassword")}>비밀번호 찾기</span>
          <span>|</span>
          <span onClick={() => navigate("/resend-mail")}>이메일 재인증</span>
          <span>|</span>
          <span onClick={() => navigate("/signup")}> 회원가입</span>
        </FindBox>
        <EasyLoginBox>
          <hr />
          <p>간편 로그인</p>
          <KakaoLogin>
            <img src="/assets/images/kakaoLogo.png" />
            {/* <button onClick={handleKakaoLogin}>카카오 로그인</button> */}
            <a
              href={`https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=c32c867533ca7a7d9039737157709aaa&redirect_uri=${
                import.meta.env.VITE_SERVER_APIADDRESS
              }/user/kakao/callback`}
            >
              카카오 로그인
            </a>
          </KakaoLogin>
        </EasyLoginBox>
      </SubmitForm>
    </Container>
  );
};

export default SignIn;
