import React, {useState} from 'react';
import {createContext} from 'react';

export const whiteboardPaper = document.createElement('div');
whiteboardPaper.className = 'whiteboardPaper';

export const whiteboardContext = createContext(
  {} as whiteboardContextInterface,
);

export interface whiteboardContextInterface {
  whiteboardActive: boolean;
  joinWhiteboardRoom: () => void;
  leaveWhiteboardRoom: () => void;
}

const WhiteboardConfigure: React.FC = (props) => {
  // Defines intent, whether whiteboard should be active or not
  const [whiteboardActive, setWhiteboardActive] = useState(false);
  // Defines whiteboard room state, whether disconnected, Connected, Connecting etc.

  const joinWhiteboardRoom = () => {
    setWhiteboardActive(true);
  };

  const leaveWhiteboardRoom = () => {
    setWhiteboardActive(false);
  };

  return (
    <whiteboardContext.Provider
      value={{
        whiteboardActive,
        joinWhiteboardRoom,
        leaveWhiteboardRoom,
      }}>
      {props.children}
    </whiteboardContext.Provider>
  );
};

export default WhiteboardConfigure;
