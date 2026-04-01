import { createContext, useContext, useEffect, useState } from "react";
import { UserContextService } from "../services/UserContextService";
import { useAuth0 } from "@auth0/auth0-react";

interface UserInfo {
  name: string;
  email: string;
  picture: string;
  globalRole: "super_admin" | "none";
}

interface UserContextType {
  user: UserInfo | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth0();

  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await UserContextService.getUserInfo();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user info", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && isAuthenticated) {
      fetchUser();
    }

    if (!authLoading && !isAuthenticated) {
      setIsLoading(false);
    }

  }, [authLoading, isAuthenticated]);

  return (
    <UserContext.Provider value={{ user, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);