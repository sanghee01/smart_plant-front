import axios from "axios";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { userState } from "../state/userState";
import { warningAlert } from "../components/Alert";
import { notificationState } from "../state/notificationState";

export function useGetNotification() {
  const user = useRecoilValue(userState);
  const accessToken = user?.accessToken;

  const setNotification = useSetRecoilState(notificationState);

  const getNotifiction = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_SERVER_APIADDRESS}/notification`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setNotification(response.data.content);
    } catch (error: any) {
      await warningAlert(error.response.data.message);
    }
  };
  return getNotifiction;
}