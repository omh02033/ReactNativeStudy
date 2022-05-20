import React from 'react';
import { TextStyle, useColorScheme, StyleProp } from 'react-native';
import styled from 'styled-components/native';

const Text: React.FC<{
  children: React.ReactElement[] | React.ReactElement | string;
  style?: StyleProp<TextStyle>;
}> = ({children, style}) => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <DLText isDarkMode={isDarkMode} style={style}>{children}</DLText>
  );
};

export default Text;

const DLText = styled.Text<{ isDarkMode: boolean }>`
  color: ${({isDarkMode}) => isDarkMode ? '#fff' : '#000'};
`;