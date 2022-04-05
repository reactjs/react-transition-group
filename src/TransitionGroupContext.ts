import React from 'react';

export default React.createContext<{ isMounting: boolean } | null>(null);
