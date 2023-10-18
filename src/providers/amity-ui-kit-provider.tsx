import * as React from 'react';

import AuthContextProvider from './auth-provider';

export interface IAmityUIkitProvider {
  userId: string;
  displayName: string;
  apiKey: string;
  apiRegion?: string;
  apiEndpoint?: string;
  children: any;
  authToken: string;
  performLogIn: () => {};
  onSuccessCb: () => {};
  onErrorCb: () => {};
}
export default function AmityUiKitProvider({
  userId,
  displayName,
  apiKey,
  apiRegion,
  apiEndpoint,
  children,
  authToken,
  performLogIn = () => {},
  onSuccessCb = () => {},
  onErrorCb = () => {},
}: IAmityUIkitProvider) {
  return (
    <AuthContextProvider
      userId={userId}
      displayName={displayName || userId}
      apiKey={apiKey}
      apiRegion={apiRegion}
      apiEndpoint={apiEndpoint}
      authToken={authToken}
      performLogIn={performLogIn}
      onSuccessCb={onSuccessCb}
      onErrorCb={onErrorCb}
    >
      {children}
    </AuthContextProvider>
  );
}
