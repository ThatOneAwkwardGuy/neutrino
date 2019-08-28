/** @jsx jsx */
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useRef, useState } from 'react';
import { jsx, keyframes } from '@emotion/core';
import PropTypes from 'prop-types';
import { CheckIcon, FlameIcon, InfoIcon, CloseIcon, AlertIcon } from './icons';
import * as colors from './colors';

export const borderRadius = 4;
export const gutter = 8;
export const toastWidth = 360;
export const shrinkKeyframes = keyframes`from { height: 100%; } to { height: 0% }`;

const A11yText = ({ ...props }) => (
  <span
    style={{
      border: 0,
      clip: 'rect(1px, 1px, 1px, 1px)',
      height: 1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      whiteSpace: 'nowrap',
      width: 1
    }}
    {...props}
  />
);

const appearances = {
  success: {
    icon: CheckIcon,
    text: colors.G500,
    fg: colors.G300,
    bg: colors.G50
  },
  error: {
    icon: FlameIcon,
    text: colors.R500,
    fg: colors.R300,
    bg: colors.R50
  },
  warning: {
    icon: AlertIcon,
    text: colors.Y500,
    fg: colors.Y300,
    bg: colors.Y50
  },
  info: {
    icon: InfoIcon,
    text: colors.N400,
    fg: colors.B200,
    bg: 'white'
  }
};
export type AppearanceTypes = $Keys<typeof appearances>;

const Button = props => (
  <div
    style={{
      cursor: 'pointer',
      flexShrink: 0,
      opacity: 0.5,
      padding: `${gutter}px ${gutter * 1.5}px`,
      transition: 'opacity 150ms',

      ':hover': { opacity: 1 }
    }}
    {...props}
  />
);

const Content = props => (
  <div
    style={{
      flexGrow: 1,
      fontSize: 14,
      lineHeight: 1.4,
      minHeight: 40,
      padding: `${gutter}px ${gutter * 1.5}px`
    }}
    {...props}
  />
);

const Countdown = ({ autoDismissTimeout, opacity, isRunning, ...props }) => (
  <div
    css={{
      animation: `${shrinkKeyframes} ${autoDismissTimeout}ms linear`,
      animationPlayState: isRunning ? 'running' : 'paused',
      backgroundColor: 'rgba(0,0,0,0.1)',
      bottom: 0,
      height: 0,
      left: 0,
      opacity,
      position: 'absolute',
      width: '100%'
    }}
    {...props}
  />
);

Countdown.propTypes = {
  autoDismissTimeout: PropTypes.number.isRequired,
  opacity: PropTypes.number.isRequired,
  isRunning: PropTypes.bool.isRequired
};

const Icon = ({ appearance, autoDismiss, autoDismissTimeout, isRunning }) => {
  const meta = appearances[appearance];
  const Glyph = meta.icon;

  return (
    <div
      style={{
        backgroundColor: meta.fg,
        borderTopLeftRadius: borderRadius,
        borderBottomLeftRadius: borderRadius,
        color: meta.bg,
        flexShrink: 0,
        paddingBottom: gutter,
        paddingTop: gutter,
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
        width: 30
      }}
    >
      <Countdown
        opacity={autoDismiss ? 1 : 0}
        autoDismissTimeout={autoDismissTimeout}
        isRunning={isRunning}
      />
      <Glyph style={{ position: 'relative', zIndex: 1 }} />
    </div>
  );
};

Icon.propTypes = {
  appearance: PropTypes.objectOf(PropTypes.object).isRequired,
  autoDismiss: PropTypes.bool.isRequired,
  autoDismissTimeout: PropTypes.number.isRequired,
  isRunning: PropTypes.bool.isRequired
};

function getTranslate(placement) {
  const pos = placement.split('-');
  const relevantPlacement = pos[1] === 'center' ? pos[0] : pos[1];
  const translateMap = {
    right: 'translate3d(120%, 0, 0)',
    left: 'translate3d(-120%, 0, 0)',
    bottom: 'translate3d(0, 120%, 0)',
    top: 'translate3d(0, -120%, 0)'
  };

  return translateMap[relevantPlacement];
}

const toastStates = (placement: Placement) => ({
  entering: { transform: getTranslate(placement) },
  entered: { transform: 'translate3d(0,0,0)' },
  exiting: { transform: 'scale(0.66)', opacity: 0 },
  exited: { transform: 'scale(0.66)', opacity: 0 }
});

const ToastElement = ({
  appearance,
  placement,
  transitionDuration,
  transitionState,
  ...props
}) => {
  const [height, setHeight] = useState('auto');
  const elementRef = useRef(null);

  useEffect(() => {
    if (transitionState === 'entered') {
      const el = elementRef.current;
      setHeight(el.offsetHeight + gutter);
    }
    if (transitionState === 'exiting') {
      setHeight(0);
    }
  }, [transitionState]);

  return (
    <div
      ref={elementRef}
      style={{
        height,
        transition: `height ${transitionDuration - 100}ms 100ms`
      }}
    >
      <div
        style={{
          backgroundColor: appearances[appearance].bg,
          borderRadius,
          boxShadow: '0 3px 8px rgba(0, 0, 0, 0.175)',
          color: appearances[appearance].text,
          display: 'flex',
          marginBottom: gutter,
          transition: `transform ${transitionDuration}ms cubic-bezier(0.2, 0, 0, 1), opacity ${transitionDuration}ms`,
          width: toastWidth,
          ...toastStates(placement)[transitionState]
        }}
        {...props}
      />
    </div>
  );
};

ToastElement.propTypes = {
  appearance: PropTypes.string.isRequired,
  placement: PropTypes.string.isRequired,
  transitionDuration: PropTypes.number.isRequired,
  transitionState: PropTypes.string.isRequired
};

export const NeutrinoToast = ({
  appearance,
  autoDismiss,
  autoDismissTimeout,
  children,
  isRunning,
  onDismiss,
  placement,
  transitionDuration,
  transitionState,
  onMouseEnter,
  onMouseLeave
}: ToastProps) => (
  <ToastElement
    className="NeutrinoToast"
    appearance={appearance}
    placement={placement}
    transitionState={transitionState}
    transitionDuration={transitionDuration}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <Icon
      appearance={appearance}
      autoDismiss={autoDismiss}
      autoDismissTimeout={autoDismissTimeout}
      isRunning={isRunning}
    />
    <Content>{children}</Content>
    {onDismiss ? (
      <Button onClick={onDismiss} role="button">
        <CloseIcon />
        <A11yText>Close</A11yText>
      </Button>
    ) : null}
  </ToastElement>
);
