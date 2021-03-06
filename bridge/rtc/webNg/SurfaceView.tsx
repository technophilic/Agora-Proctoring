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
import {RtcContext} from '../../../agora-rn-uikit/Contexts';
import {ILocalVideoTrack, IRemoteVideoTrack} from 'agora-rtc-sdk-ng';
import React, {useContext, useEffect} from 'react';
import {StyleProp, StyleSheet, ViewProps, ViewStyle} from 'react-native';
import {VideoMirrorMode, VideoRenderMode} from 'react-native-agora';
import {useRole} from '../../../src/pages/VideoCall';
import {Role} from './Types';

export interface RtcSurfaceViewProps extends ViewProps {
  zOrderMediaOverlay?: boolean;
  zOrderOnTop?: boolean;
  renderMode?: VideoRenderMode;
  channelId?: string;
  mirrorMode?: VideoMirrorMode;
}
export interface RtcUidProps {
  uid: number;
}
export interface StyleProps {
  style?: StyleProp<ViewStyle>;
}

interface SurfaceViewInterface
  extends RtcSurfaceViewProps,
    RtcUidProps,
    StyleProps {}

const SurfaceView = (props: SurfaceViewInterface) => {
  //   console.log('Surface View props', props);
  const {hasJoinedChannel} = useContext(RtcContext);
  const role = useRole();
  const stream: ILocalVideoTrack | IRemoteVideoTrack =
    props.uid === 0
      ? window.engine.localStream.video
      : props.uid === 1
      ? window.engine.screenStream.video
      : window.engine.remoteStreams.get(props.uid)?.video;
  // console.log(props, window.engine, stream);

  useEffect(() => {
    if (
      hasJoinedChannel &&
      role === Role.Student &&
      window?.AgoraProctorUtils
    ) {
      console.log('!!!!agora');
      console.log('!!!!agora', window.AgoraProctorUtils.faceDetect);
      // setInterval(() => {
      // @ts-ignore
      window?.AgoraProctorUtils?.faceDetect(
        document.getElementById('canvas'),
        document.getElementById('0')?.children[0]?.children[0],
      );
      // }, 3000);
    }
  }, [hasJoinedChannel]);

  useEffect(
    function () {
      if (stream?.play) {
        if (props.renderMode === 2) {
          stream.play(String(props.uid), {fit: 'contain'});
        } else {
          stream.play(String(props.uid));
        }
      }
      return () => {
        console.log(`unmounting stream ${props.uid}`, stream);
        stream && stream.stop();
      };
    },
    [props.uid, props.renderMode, stream],
  );

  return stream ? (
    <>
      <div
        id={String(props.uid)}
        className={'video-container'}
        style={{
          ...style.full,
          ...(props.style as Object),
          overflow: 'hidden',
          display:
            props.uid === 0 && hasJoinedChannel && role !== Role.Teacher
              ? 'none'
              : 'block',
      }}
      />
      <canvas
        id={props.uid === 0 ? "canvas" : ''}
        style={{
          // position: 'absolute',
          zIndex: -1,
          borderRadius: 15,
          flex: 1,
          display:
            props.uid === 0 && hasJoinedChannel && role !== Role.Teacher
              ? 'block'
              : 'none',
        }}
        width="848"
        height="480"
      />
    </>
  ) : (
    <div style={{...style.full, backgroundColor: 'black'}} />
  );
};

const style = StyleSheet.create({
  full: {
    flex: 1,
    position: 'relative',
  },
});

export default SurfaceView;
