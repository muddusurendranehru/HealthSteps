export interface AuthUser {
  id: string;
  email: string;
}

export function useAuth() {
  const getUserFromStorage = (): AuthUser | null => {
    const userData = localStorage.getItem('auth_user');
    return userData ? JSON.parse(userData) : null;
  };

  const setUser = (user: AuthUser | null) => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_user');
    window.location.reload();
  };

  return {
    user: getUserFromStorage(),
    isAuthenticated: !!getUserFromStorage(),
    setUser,
    logout,
  };
}
