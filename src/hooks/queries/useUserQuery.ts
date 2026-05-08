import { useQuery } from "@tanstack/react-query";
import { getUser } from "../../services/endpoints";
import type { ApiUser } from "../../types/apiTypes";

export interface UserMetaData {
  sub?: string;
  name?: string;
  email?: string;
  department?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
}

const fetchUser = async (): Promise<UserMetaData> => {
  const response = await getUser();

  const user: ApiUser = response.data;

  return {
    sub: user.id,
    email: user.email,
    name: user.user_metadata?.name,
    department: user.user_metadata?.department,
    email_verified: user.user_metadata?.email_verified,
    phone_verified: user.user_metadata?.phone_verified,
  };
};

export const useUserQuery = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
  });
};