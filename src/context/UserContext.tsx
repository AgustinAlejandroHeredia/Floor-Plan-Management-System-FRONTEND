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
  lodaingUserContext: boolean;
  error: Error | null;
}

const UserContext = createContext<UserContextType>({
  user: null,
  lodaingUserContext: true,
  error: null,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth0();

  const [user, setUser] = useState<UserInfo | null>(null);
  const [lodaingUserContext, setLodaingUserContext] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await UserContextService.getUserInfo();
        setUser(data);
      } catch (error: any) {
        console.error("Error fetching user info", error);
        setError(error)
      } finally {
        setLodaingUserContext(false);
      }
    };

    if (!authLoading && isAuthenticated) {
      fetchUser();
    }

    if (!authLoading && !isAuthenticated) {
      setLodaingUserContext(false);
    }

  }, [authLoading, isAuthenticated]);

  return (
    <UserContext.Provider value={{ user, lodaingUserContext, error }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);