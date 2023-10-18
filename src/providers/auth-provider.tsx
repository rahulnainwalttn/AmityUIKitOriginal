import React, { useEffect, useState, type FC } from 'react';
import { Client } from '@amityco/ts-sdk-react-native';
import type { AuthContextInterface } from '../types/auth.interface';
import { Alert } from 'react-native';
import type { IAmityUIkitProvider } from './amity-ui-kit-provider';

export const AuthContext = React.createContext<AuthContextInterface>({
  client: {},
  isConnecting: false,
  error: '',
  login: () => {},
  logout: () => {},
  isConnected: false,
  sessionState: '',
});

export const AuthContextProvider: FC<IAmityUIkitProvider> = ({
  userId,
  displayName,
  apiKey,
  apiRegion,
  apiEndpoint,
  children,
  authToken,
  performLogIn,
  onSuccessCb,
  onErrorCb,
}: IAmityUIkitProvider) => {
  const [error, setError] = useState('');
  const [isConnecting, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionState, setSessionState] = useState('');
  console.log('sessionState:', sessionState);
  console.log('isConnected:', isConnected);

  const client: Amity.Client = Client.createClient(apiKey, apiRegion, {
    apiEndpoint: { http: apiEndpoint },
  });

  console.log('client:', client);
  const sessionHandler: Amity.SessionHandler = {
    sessionWillRenewAccessToken(renewal) {
      renewal.renew();
    },
  };

  useEffect(() => {
    return Client.onSessionStateChange((state: Amity.SessionStates) =>
      setSessionState(state)
    );
  }, []);

  useEffect(() => {
    const isNeedToLoggIn =
      sessionState === 'notLoggedIn' ||
      sessionState === 'tokenExpired' ||
      sessionState === 'terminated';
    if (sessionState === 'established') {
      setIsConnected(true);
    } else if (isNeedToLoggIn) {
      performLogIn();
    }
  }, [sessionState]);

  const handleConnect = async () => {
    const params = {
      userId: userId,
      displayName: displayName,
    };
    if (authToken) {
      params.authToken = authToken;
    }
    const response = await Client.login(params, sessionHandler);

    if (response) {
      console.log('response:', response);
    }
  };

  const login = async () => {
    setError('');
    setLoading(true);
    try {
      handleConnect();
      onSuccessCb?.();
    } catch (e) {
      const errorText =
        (e as Error)?.message ?? 'Error while handling request!';
      onErrorCb?.(Error);
      setError(errorText);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    login();
  }, [userId]);

  // TODO
  const logout = async () => {
    try {
      Client.stopUnreadSync();
      await Client.logout();
    } catch (e) {
      const errorText =
        (e as Error)?.message ?? 'Error while handling request!';

      Alert.alert(errorText);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        error,
        isConnecting,
        login,
        client,
        logout,
        isConnected,
        sessionState,
      }}
    >
      {children}
    </AuthContext.Provider>
    //
  );
};
export default AuthContextProvider;
