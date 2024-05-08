import styled from "styled-components";
import { useCallback, useState } from "react";
import { resendMail } from "../../services/resendMail";

const ReAuthMail = () => {
  const [email, setEmail] = useState("");
  const [messageTxt, setMessageTxt] = useState("");
  const [errorTxt, setErrorTxt] = useState("");

  const handleChangeEmail = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
    },
    [email],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      setErrorTxt("");
      e.preventDefault();
      try {
        const response = await resendMail(email);
        setMessageTxt(response);
      } catch (error: any) {
        const errorMessage = error.response.data.message;
        const errorContent = error.response.data.content;
        if (errorMessage) alert(errorMessage);
        if (errorContent) setErrorTxt(errorContent);
      }
    },
    [email],
  );
  return (
    <Container>
      <Header>
        <Logo src="/assets/images/logo2.png"></Logo>
        <Title>이메일 재인증</Title>
        <p>이메일을 인증하지 못한 경우 </p>
        <p>가입하신 이메일을 입력하고</p>
        <p>재인증 요청을 해서 활성화 시켜주세요!</p>
      </Header>
      <SubmitForm onSubmit={handleSubmit}>
        <input type="email" id="email" placeholder="이메일" onChange={handleChangeEmail} />
        <button type="submit">이메일 재인증 요청하기</button>
        {messageTxt && <MessageTxt>{messageTxt}</MessageTxt>}
        {errorTxt && <ErrorTxt>{errorTxt}</ErrorTxt>}
      </SubmitForm>
    </Container>
  );
};

const Logo = styled.img`
  height: 55px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
  height: 100%;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  & p {
    font-weight: bold;
    color: gray;
  }
`;

const Title = styled.p`
  font-size: 22px;
  margin-bottom: 55px;
`;

const SubmitForm = styled.form`
  display: flex;
  flex-direction: column;
  margin-top: 45px;
  width: 70%;

  & input {
    padding: 15px;
    margin: 5px 0;
    border-radius: 5px;
    border: 1px solid gray;
  }

  & button {
    padding: 15px;
    margin: 5px 0;
    border-radius: 5px;
    border: none;
    font-weight: bold;
    background-color: #8cd57e;
  }
`;

const MessageTxt = styled.p`
  margin-top: 10px;
  color: #3c8929;
  font-weight: bold;
  font-size: 0.9rem;
`;

const ErrorTxt = styled(MessageTxt)`
  color: #e01e5a;
`;

export default ReAuthMail;
