import React, { createContext, useReducer } from 'react';

export enum VoiceType {
  female = 'female',
  male = 'male'
}

export interface Settings {
  currentDeckName: string;
  useDarkMode: boolean;
  voiceType: VoiceType;
}

export enum SettingsActionType {
  changeCurrentDeckName = 'changeCurrentDeckName',
  toggleDarkMode = 'toggleDarkMode',
  changeVoiceType = 'changeVoiceType'
}

export interface SettingsAction {
  type: SettingsActionType;
  payload?: VoiceType | string;
}

const reducer = (state: Settings, action: SettingsAction): Settings => {
  switch (action.type) {
    case SettingsActionType.changeCurrentDeckName:
      return { ...state, currentDeckName: action.payload as string };
    case SettingsActionType.toggleDarkMode:
      return { ...state, useDarkMode: !state.useDarkMode };
    case SettingsActionType.changeVoiceType:
      return { ...state, voiceType: action.payload as VoiceType };
    default:
      return state;
  }
};

const [state, dispatch] = useReducer(reducer, {
  currentDeckName: typeof window !== 'undefined' ? localStorage.getItem('currentDeck') ?? 'Default' : 'Default',
  useDarkMode: false,
  voiceType: VoiceType.male,
});

export const SettingsContext = createContext({ state, dispatch });

const SettingsProvider: React.FC = ({ children }) => (
  <SettingsContext.Provider value={{ state, dispatch }}>
    {children}
  </SettingsContext.Provider>
);

export default SettingsProvider;
