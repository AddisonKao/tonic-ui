import { ensureBoolean } from 'ensure-type';
import React, {
  forwardRef,
  useEffect,
  useRef,
} from 'react';
import { Transition } from 'react-transition-group';
import Box from '../Box';
import Icon from '../Icon';
import {
  createTransitionStyle,
  getEnterTransitionProps,
  getExitTransitionProps,
  transitionEasing,
} from '../shared/transitions';
import reflow from '../utils/reflow';
import useForkRef from '../utils/useForkRef';
import {
  useAccordionToggleIndicatorStyle,
} from './styles';
import useAccordionItem from './useAccordionItem';

const mapStateToVariantStyle = (state, props) => {
  const variantStyle = {
    entering: (props) => ({
      transform: 'rotate(-180deg)',
    }),
    entered: (props) => ({
      transform: 'rotate(-180deg)',
    }),
    exiting: (props) => ({
      transform: 'rotate(0deg)',
    }),
    exited: (props) => ({
      transform: 'rotate(0deg)',
    }),
  }[state];

  return (typeof variantStyle === 'function') ? variantStyle(props) : variantStyle;
};

const defaultEasing = {
  enter: transitionEasing.easeOut,
  exit: transitionEasing.easeOut,
};

const defaultTimeout = {
  enter: 133,
  exit: Math.floor(133 * 0.7),
};

const AccordionToggleIndicator = forwardRef((
  {
    appear = true,
    children,
    disabled: disabledProp,
    easing = defaultEasing,
    style,
    timeout = defaultTimeout,
    ...rest
  },
  ref,
) => {
  const context = useAccordionItem(); // context might be an undefined value
  const toggleIndicatorStyleProps = useAccordionToggleIndicatorStyle();
  const nodeRef = useRef(null);
  const combinedRef = useForkRef(nodeRef, ref);
  const disabled = ensureBoolean(disabledProp ?? context?.disabled);
  const isExpanded = ensureBoolean(context?.isExpanded);

  useEffect(() => {
    if (isExpanded) {
      const node = nodeRef.current;
      reflow(node); // force reflow to make the transition work when animating appearance
    }
  }, [isExpanded]);

  return (
    <Transition
      appear={appear}
      in={isExpanded}
      nodeRef={nodeRef}
      timeout={timeout}
      {...rest}
    >
      {(state, childProps) => {
        const transitionProps = isExpanded
          ? getEnterTransitionProps({ style, timeout, easing })
          : getExitTransitionProps({ style, timeout, easing });
        const transition = createTransitionStyle('transform', transitionProps);
        const variantStyle = mapStateToVariantStyle(state, {});
        const styleProps = {
          ...toggleIndicatorStyleProps,
          ...variantStyle,
          'aria-disabled': disabled,
          transition,
        };

        if (typeof children === 'function') {
          return children({
            ...childProps,
            ref: combinedRef,
            style: {
              ...styleProps,
              ...style,
            },
          });
        }

        const iconName = 'chevron-down';

        return (
          <Box
            ref={combinedRef}
            {...styleProps}
            {...childProps}
            style={style}
          >
            {children ?? <Icon width="4x" icon={iconName} />}
          </Box>
        );
      }}
    </Transition>
  );
});

AccordionToggleIndicator.displayName = 'AccordionToggleIndicator';

export default AccordionToggleIndicator;
