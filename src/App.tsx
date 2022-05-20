import React, { useState, useRef, useEffect } from 'react';

import {
  SafeAreaView,
  useColorScheme,
  Animated
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import TouchID from 'react-native-touch-id';
import ReactNativeBiometrics from 'react-native-biometrics';
import { SFSymbol } from "react-native-sfsymbols";
import { GaugeProgress } from 'react-native-simple-gauge';

import styled from 'styled-components/native';

import { Text } from '@/components';
import { bioTypes } from '@/types';
import { flex } from '@/style';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const svgFill = isDarkMode ? "#fff" : "#000";
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  
  const fadeAnim = useRef<Animated.Value>(new Animated.Value(0)).current;
  const initialTime = useRef<number>(0);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [bioType, setBioType] = useState<bioTypes>('Not');
  const [isPressing, setIsPressing] = useState<boolean>(false);
  const [gaugeFill, setGaugeFill] = useState<number>(0);
  const [goTimer, setGoTimer] = useState<boolean>(false);
  const [bioing, setBioing] = useState<boolean>(false);
  const interval = useRef<NodeJS.Timer>();
  
  ReactNativeBiometrics.isSensorAvailable()
  .then((resultObject) => {
    const { available, biometryType } = resultObject;
 
    if (available && biometryType === ReactNativeBiometrics.TouchID) {
      setBioType('TouchID');
    } else if (available && biometryType === ReactNativeBiometrics.FaceID) {
      setBioType('FaceID');
    } else if (available && biometryType === ReactNativeBiometrics.Biometrics) {
      setBioType('Biometrics');
    } else {
      setBioType('Not');
    }
  });

  const Biometrics = async () => {
    setBioing(true);
    TouchID.authenticate('to demo this react-native component', {passcodeFallback: true})
    .then((success: any) => {
      console.log(success);
      setIsOpen(true);
      setBioing(false);
      // Alert.alert('Face ID Success');
    }).catch((err: any) => {
      console.log(err);
      setIsOpen(false);
      setBioing(false);
      // Alert.alert('Failed');
    });
  }

  useEffect(() => {
    if(goTimer) {
      interval.current = setInterval(() => {
        initialTime.current += 1;
        setGaugeFill(initialTime.current);
      }, 10);
      return () => clearInterval(interval.current);
    }
  }, [goTimer]);

  useEffect(() => {
    if(isPressing) {
      Animated.timing(
        fadeAnim,
        {
          toValue: 1,
          duration: 500,
          useNativeDriver: false
        }
      ).start();
      setGoTimer(true);
    } else {
      clearInterval(interval.current);
      setGoTimer(false);
      if(!bioing) {
        Animated.timing(
          fadeAnim,
          {
            toValue: 0,
            duration: 500,
            useNativeDriver: false
          }
        ).start();
        initialTime.current = 0;
        setGaugeFill(0);
      }
    }
  }, [isPressing]);

  useEffect(() => {
    if(gaugeFill >= 100) {
      clearInterval(interval.current);
      Biometrics();
    }
  }, [gaugeFill]);

  const PressIn = () => {
    if(!isOpen) setIsPressing(true);
  }
  const PressOut = () => {
    if(!isOpen) setIsPressing(false);
  }

  return (
    <SafeAreaView style={[backgroundStyle, {flex:1}]}>
      <SView style={flex.center}>
        <BView style={flex.center}>
          <Btn size={50} onPress={Biometrics} style={flex.center}>
            {bioType === 'FaceID' && (
              <SFSymbol
                name="faceid"
                weight="semibold"
                scale="large"
                color={svgFill}
                size={35}
                resizeMode="center"
                multicolor={false}
                style={{ width: 32, height: 32 }}
              />
            )}
            {bioType === 'TouchID' && (
              <SFSymbol
                name="touchid"
                weight="semibold"
                scale="large"
                color={svgFill}
                size={35}
                resizeMode="center"
                multicolor={false}
                style={{ width: 32, height: 32 }}
              />
            )}
            {bioType === 'Biometrics' && (
              <SFSymbol
                name="lock.circle"
                weight="semibold"
                scale="large"
                color={svgFill}
                size={35}
                resizeMode="center"
                multicolor={false}
                style={{ width: 32, height: 32 }}
              />
            )}
            {bioType === 'Not' && (
              <>
                <GaugeView style={{
                  opacity: isOpen ? 1 : fadeAnim
                  // opacity: 1,
                }}>
                  <GaugeProgress
                  style={{
                    transform: [{translateX: -50}, {translateY:-50}],
                  }}
                  size={100}
                  width={7}
                  fill={gaugeFill}
                  // fill={50}
                  rotation={90}
                  cropDegree={0}
                  tintColor="#4682b4"
                  // delay={5000}
                  backgroundColor="#b0c4de"
                  stroke={[2, 2]} //For a equaly dashed line
                  />
                </GaugeView>
                <Btn size={50} style={flex.center} onPressIn={PressIn} onPressOut={PressOut}>
                  <SFSymbol
                    name="hand.tap.fill"
                    weight="semibold"
                    scale="large"
                    color={svgFill}
                    size={35}
                    resizeMode="center"
                    multicolor={false}
                    style={{ width: 32, height: 32 }}
                  />
                </Btn>
              </>
            )}
          </Btn>
        </BView>
        <LView style={flex.center}>
          {/* <Lock fill={svgFill} /> */}
          <SFSymbol
            name={isOpen ? "lock.open" : "lock"}
            weight="semibold"
            scale="large"
            color={svgFill}
            size={16}
            resizeMode="center"
            multicolor={false}
            style={{ width: 32, height: 32 }}
          />
          <Text style={{color: isOpen ? "#56ff6d" : "#fb3e3e"}}>{isOpen ? 'Allow access' : 'access denied'}</Text>
        </LView>
      </SView>
    </SafeAreaView>
  );
};

const SView = styled.View`
  flex: 1;
`;
const Btn = styled.TouchableOpacity<{size: number, test?: boolean}>`
  width: ${({size}) => size}px;
  height: ${({size}) => size}px;
  position: relative;
  ${({test}) => test && (
    'border: 1px solid #fff;border-radius: 10px;'
  )}
`;
const BView = styled.View`
  height: 20%;
  width: 100%;
`;
const LView = styled.View`
  width: 100%;
  flex-direction: row;
`;

const GaugeView = styled(Animated.View)`
  position: absolute;
  left: 50%;
  top: 50%;
`;

export default App;
