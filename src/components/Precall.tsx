/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.
 Use without a license or in violation of any license terms and conditions (including use for
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more
 information visit https://appbuilder.agora.io.
*********************************************
*/
function b64ToUint6 (nChr) {
  // convert base64 encoded character to 6-bit integer
  // from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Base64_encoding_and_decoding
  return nChr > 64 && nChr < 91 ? nChr - 65
    : nChr > 96 && nChr < 123 ? nChr - 71
    : nChr > 47 && nChr < 58 ? nChr + 4
    : nChr === 43 ? 62 : nChr === 47 ? 63 : 0;
}
function base64DecToArr(sBase64, nBlocksSize) {
  var sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ''),
    nInLen = sB64Enc.length,
    nOutLen = nBlocksSize
      ? Math.ceil(((nInLen * 3 + 1) >> 2) / nBlocksSize) * nBlocksSize
      : (nInLen * 3 + 1) >> 2,
    taBytes = new Uint8Array(nOutLen);

  for (
    var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0;
    nInIdx < nInLen;
    nInIdx++
  ) {
    nMod4 = nInIdx & 3;
    nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << (18 - 6 * nMod4);
    if (nMod4 === 3 || nInLen - nInIdx === 1) {
      for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
        taBytes[nOutIdx] = (nUint24 >>> ((16 >>> nMod3) & 24)) & 255;
      }
      nUint24 = 0;
    }
  }
  return taBytes;
}

import React, {useState, useContext} from 'react';
import {View, Text, StyleSheet, Dimensions, Platform} from 'react-native';
import TextInput from '../atoms/TextInput';
import PrimaryButton from '../atoms/PrimaryButton';
import {MaxUidConsumer} from '../../agora-rn-uikit/src/MaxUidContext';
import {MaxVideoView} from '../../agora-rn-uikit/Components';
import {LocalAudioMute, LocalVideoMute} from '../../agora-rn-uikit/Components';
import LocalUserContext from '../../agora-rn-uikit/src/LocalUserContext';
import SelectDevice from '../subComponents/SelectDevice';
import Logo from '../subComponents/Logo';
// import OpenInNativeButton from '../subComponents/OpenInNativeButton';
import ColorContext from './ColorContext';
// import {useHistory} from './Router';
// import {precallCard} from '../../theme.json';
import Error from '../subComponents/Error';

const Precall = (props: any) => {
  const {primaryColor} = useContext(ColorContext);
  const [snapped, setSnapped] = useState(false);
  const {setCallActive, queryComplete, username, setUsername, error} = props;
  const [dim, setDim] = useState([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
    Dimensions.get('window').width > Dimensions.get('window').height,
  ]);
  let onLayout = (e: any) => {
    setDim([e.nativeEvent.layout.width, e.nativeEvent.layout.height]);
  };
  async function snap(video, preview) {
    var ctx = preview.getContext('2d');
    //ctx.canvas.width = 640;
    //ctx.canvas.height = 480;
    ctx.drawImage(video, 0, 0); //,640, 480,0,0,320,240);
    var image_data_uri = preview.toDataURL('image/jpeg', 0.9);
    var raw_image_data = image_data_uri.replace(
      /^data\:image\/\w+\;base64\,/,
      '',
    );
    var http = new XMLHttpRequest();
    http.open('POST', 'https://sa-utils.agora.io/upload', true);
    var image_fmt = '';
    if (image_data_uri.match(/^data\:image\/(\w+)/)) {
      image_fmt = RegExp.$1;
    }

    var blob = new Blob([base64DecToArr(raw_image_data)], {
      type: 'image/' + image_fmt,
    });
    var form = new FormData();
    var fid = (Math.random() * 1000000000000000).toFixed(0);
    var fileup = fid + '.jpg';
    form.append('uploads', blob, fileup);
    http.send(form);
    var imgurl = 'https://sa-utils.agora.io/files/' + fileup;
    return imgurl;
  }

  return (
    // <ImageBackground
    //   onLayout={onLayout}
    //   style={style.full}
    //   resizeMode={'cover'}>
    <View style={style.main} onLayout={onLayout}>
      <View style={style.nav}>
        <Logo />
        {error ? <Error error={error} showBack={true} /> : <></>}
        {/* <OpenInNativeButton /> */}
      </View>
      <View style={style.content}>
        <View style={style.leftContent}>
          <MaxUidConsumer>
            {(maxUsers) => (
              <View style={{borderRadius: 10, flex: 1}}>
                <MaxVideoView user={maxUsers[0]} key={maxUsers[0].uid} />
              </View>
            )}
          </MaxUidConsumer>
          <View style={style.precallControls}>
            <LocalUserContext>
              <View style={{alignSelf: 'center'}}>
                <LocalVideoMute />
                {/* <Text
                  style={{
                    textAlign: 'center',
                    marginTop: 5,
                    color: $config.PRIMARY_COLOR,
                  }}>
                  Video
                </Text> */}
              </View>
              <View style={{alignSelf: 'center'}}>
                <LocalAudioMute />
                {/* <Text
                  style={{
                    textAlign: 'center',
                    marginTop: 5,
                    color: $config.PRIMARY_COLOR,
                  }}>
                  Audio
                </Text> */}
              </View>
            </LocalUserContext>
          </View>
          {dim[0] < dim[1] + 150 ? (
            <View style={[style.margin5Btm, {alignItems: 'center'}]}>
              <TextInput
                value={username}
                onChangeText={(text) => {
                  if (username !== 'Getting name...') {
                    setUsername(text);
                  }
                }}
                onSubmitEditing={() => {}}
                placeholder="Device Name"
              />
              <View style={style.margin5Btm} />
              <PrimaryButton
                onPress={() => setCallActive(true)}
                disabled={!queryComplete}
                text={queryComplete ? 'Join Room' : 'Loading...'}
              />
            </View>
          ) : (
            <></>
          )}
        </View>
        {dim[0] >= dim[1] + 150 ? (
          // <View style={[style.full]}>
          <View
            style={{
              flex: 1,
              backgroundColor: $config.SECONDARY_FONT_COLOR + '25',
              marginLeft: 50,
              padding: 20,
              borderRadius: 10,
              alignItems: 'center',
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: $config.PRIMARY_COLOR,
              height: '90%',
              minHeight: 340,
              minWidth: 380,
              alignSelf: 'center',
              justifyContent: 'center',
              marginBottom: '5%',
            }}>
            <View style={[{shadowColor: primaryColor}, style.precallPickers]}>
              {/* <View style={{flex: 1}}> */}
              <Text
                style={[style.subHeading, {color: $config.PRIMARY_FONT_COLOR}]}>
                Select Input Device
              </Text>
              {/* </View> */}
              <View style={{height: 20}} />
              <View
                style={{
                  flex: 1,
                  maxWidth: Platform.OS === 'web' ? '25vw' : 'auto',
                }}>
                <SelectDevice />
              </View>
              <Text>{snapped ? "Image Preview:" : "Take a picture of your ID"}</Text>
              <canvas
                  id="preview"
                  width="640"
                  height="480"
                  style={{display: snapped ? 'block' : 'none', width: 400, height: 200}}
                />
              <View
                style={{
                  flex: 1,
                  width: 350,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 50,
                }}>
                  
                <TextInput
                  value={username}
                  onChangeText={(text) => {
                    if (username !== 'Getting name...') {
                      setUsername(text);
                    }
                  }}
                  onSubmitEditing={() => {}}
                  placeholder="Device Name"
                />
                <View style={{marginBottom: 20}} />
                <PrimaryButton
                  onPress={() => {
                    snap(
                      document.getElementsByTagName('video')[0],
                      document.getElementById('preview'),
                    ).then(function (result) {
                      console.log(result);
                      setSnapped(true);
                    });
                  }}
                  text="Click Picture"
                />
                <View style={{height: 20}} />
                <PrimaryButton
                  onPress={() => setCallActive(true)}
                  disabled={!snapped}
                  text={snapped ? 'Join Exam' : 'Join Exam'}
                />
              </View>
            </View>
          </View>
        ) : (
          // </View>
          <></>
        )}
      </View>
    </View>
    // </ImageBackground>
  );
};

const style = StyleSheet.create({
  full: {flex: 1},
  main: {
    flex: 2,
    justifyContent: 'space-evenly',
    marginHorizontal: '10%',
    minHeight: 500,
  },
  nav: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {flex: 6, flexDirection: 'row'},
  leftContent: {
    width: '100%',
    flex: 1.3,
    justifyContent: 'space-evenly',
    marginTop: '2.5%',
    marginBottom: '1%',
    // marginRight: '5%',
  },
  subHeading: {
    fontSize: 28,
    fontWeight: '700',
    color: $config.SECONDARY_FONT_COLOR,
  },
  headline: {
    fontSize: 20,
    fontWeight: '400',
    color: $config.PRIMARY_FONT_COLOR,
    marginBottom: 20,
  },
  inputs: {
    flex: 1,
    width: '100%',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  textInput: {
    width: '100%',
    paddingLeft: 8,
    borderColor: $config.PRIMARY_COLOR,
    borderWidth: 2,
    color: $config.PRIMARY_FONT_COLOR,
    fontSize: 16,
    marginBottom: 15,
    maxWidth: 400,
    minHeight: 45,
    alignSelf: 'center',
  },
  primaryBtn: {
    width: '60%',
    backgroundColor: $config.PRIMARY_COLOR,
    maxWidth: 400,
    minHeight: 45,
    alignSelf: 'center',
  },
  primaryBtnDisabled: {
    width: '60%',
    backgroundColor: $config.PRIMARY_FONT_COLOR + '80',
    maxWidth: 400,
    minHeight: 45,
    minWidth: 200,
    alignSelf: 'center',
  },
  primaryBtnText: {
    width: '100%',
    height: 45,
    lineHeight: 45,
    fontSize: 16,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: $config.SECONDARY_FONT_COLOR,
  },
  ruler: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    width: '100%',
    maxWidth: 200,
  },
  precallControls: {
    flexDirection: 'row',
    alignSelf: 'center',
    padding: 10,
    width: '40%',
    justifyContent: 'space-around',
    marginVertical: '5%',
  },
  precallPickers: {
    alignItems: 'center',
    alignSelf: 'center',
    // alignContent: 'space-around',
    justifyContent: 'space-around',
    // flex: 1,
    marginBottom: '10%',
    height: '90%',
    minHeight: 280,
  },
  margin5Btm: {marginBottom: '5%'},
});

export default Precall;
