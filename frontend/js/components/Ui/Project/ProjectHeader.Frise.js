// @flow
import * as React from 'react';
import Slider from 'react-slick';
import styled, { type StyledComponent } from 'styled-components';
import AppBox from '~ui/Primitives/AppBox';
import { type AppBoxProps } from '~ui/Primitives/AppBox.type';
import Modal from '~ds/Modal/Modal';
import Text from '~ui/Primitives/Text';
import Icon from '~ds/Icon/Icon';
import Flex from '~ui/Primitives/Layout/Flex';
import { cleanChildren } from '~/utils/cleanChildren';
import useIsMobile from '~/utils/hooks/useIsMobile';
import Heading from '~ui/Primitives/Heading';
import Tooltip from '~ds/Tooltip/Tooltip';

type FriseProps = {|
  ...AppBoxProps,
  children: React.Node,
|};
export const Frise = ({ children, ...rest }: FriseProps) => (
  <AppBox width="100%" paddingX={[4, 0]} marginBottom={-6} marginTop={3} {...rest}>
    {children}
  </AppBox>
);

const StepsContainer: StyledComponent<{}, {}, typeof Slider> = styled(Slider)`
  width: 100%;
  .slick-slide {
    outline: none !important;
  }
  .slick-next,
  .slick-prev {
    display: none !important;
  }
  &:hover {
    .slick-next,
    .slick-prev {
      display: flex !important;
      &:hover,
      &:focus {
        color: initial;
        background: #0f0038;
      }
      &.slick-disabled {
        display: none !important;
      }
      &:before {
        display: none;
      }
    }
  }
`;

const StepArrowContainer = styled('button')`
  width: 100%;
  height: 100%;
  cursor: pointer;
  border: none;
  background: transparent;
  padding: 0;
  outline: none;
`;
const StepsModalToggle = styled('div')`
  width: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  opacity: 0.6;
  position: absolute;
  top: 0;
  height: calc(100% - 4px);
  right: 0;
  border: none;
  outline: none;
`;
type StepsProps = {|
  ...AppBoxProps,
  modalTitle: string,
  children: React.Node,
|};
export const Steps = ({ children, modalTitle, ...rest }: StepsProps) => {
  const validChildren = cleanChildren(children);
  const activeStep =
    validChildren.filter(child => {
      return !!cleanChildren(child.props.children)[0]?.props?.progress;
    })[0] || validChildren.filter(child => child.props.state === 'ACTIVE')[0];
  const isMobile = useIsMobile();
  if (!isMobile) {
    const settings = {
      dots: false,
      infinite: false,
      speed: 500,
      slidesToShow: 4,
      slidesToScroll: 1,
      arrows: true,
      variableWidth: true,
      nextArrow: (
        <AppBox
          width={7}
          height={7}
          right={4}
          zIndex={9}
          borderRadius="buttonQuickAction"
          backgroundColor="#3008A0"
          css={{ opacity: 0.6 }}
          display="flex !important"
          alignItems="center"
          justifyContent="center">
          <Icon name="ARROW_RIGHT" size="sm" color="white" />
        </AppBox>
      ),
      prevArrow: (
        <AppBox
          width={7}
          height={7}
          left={4}
          zIndex={9}
          borderRadius="buttonQuickAction"
          backgroundColor="#3008A0"
          css={{ opacity: 0.6 }}
          display="flex !important"
          alignItems="center"
          justifyContent="center">
          <Icon name="ARROW_LEFT" size="sm" color="white" />
        </AppBox>
      ),
    };
    return (
      <AppBox
        position="relative"
        display="flex"
        flexDirection="row"
        flexWrap="nowrap"
        width="100%"
        flexBasis="100%"
        alignItems="flex-end"
        marginTop={6}
        justifyContent="flex-start"
        as="ul"
        boxShadow="0px 2px 8px 0px rgba(0,0,0,0.1)"
        borderRadius={1}
        backgroundColor="white"
        height={11}
        css={{ paddingInlineStart: '0px' }}
        {...rest}>
        <StepsContainer {...settings}>{children}</StepsContainer>
      </AppBox>
    );
  }

  if (activeStep) {
    return (
      <AppBox
        position="relative"
        display="flex"
        flexDirection="row"
        flexWrap="nowrap"
        width="100%"
        flexBasis="100%"
        alignItems="flex-end"
        marginTop={6}
        justifyContent="flex-start"
        as="ul"
        boxShadow="0px 2px 8px 0px rgba(0,0,0,0.1)"
        borderRadius={10}
        overflow="hidden"
        height={11}
        css={{ paddingInlineStart: '0px' }}
        {...rest}>
        <Modal
          borderRadius="16px 16px 0px 0px"
          boxShadow="0px 10px 99px rgba(0, 0, 0, 0.302)"
          margin="50% 0 0 0 !important"
          ariaLabel={modalTitle}
          disclosure={
            <StepArrowContainer>
              {React.cloneElement(activeStep)}
              <StepsModalToggle className="arrow">
                <Icon
                  name="ARROW_DOWN"
                  size="md"
                  color="white"
                  borderRadius="buttonQuickAction"
                  backgroundColor="#3008A0"
                />
              </StepsModalToggle>
            </StepArrowContainer>
          }>
          <Modal.Header>
            <Heading>{modalTitle}</Heading>
          </Modal.Header>
          <Modal.Body as="ul">{children}</Modal.Body>
        </Modal>
      </AppBox>
    );
  }

  return (
    <AppBox
      position="relative"
      display="flex"
      flexDirection="row"
      flexWrap="nowrap"
      width="100%"
      flexBasis="100%"
      alignItems="flex-end"
      marginTop={6}
      justifyContent="flex-start"
      as="ul"
      boxShadow="0px 2px 8px 0px rgba(0,0,0,0.1)"
      borderRadius={10}
      overflow="hidden"
      height={11}
      css={{ paddingInlineStart: '0px' }}
      {...rest}>
      <Modal
        borderRadius="16px 16px 0px 0px"
        boxShadow="0px 10px 99px rgba(0, 0, 0, 0.302)"
        margin="50% 0 0 0 !important"
        ariaLabel={modalTitle}
        disclosure={
          <StepArrowContainer>
            {React.cloneElement(validChildren[0])}
            <StepsModalToggle className="arrow" style={{ height: '100%' }}>
              <Icon
                style={{ opacity: '0.6' }}
                padding={4}
                name="ARROW_DOWN"
                size="md"
                color="white"
                borderRadius="buttonQuickAction"
                backgroundColor="#3008A0"
              />
            </StepsModalToggle>
          </StepArrowContainer>
        }>
        <Modal.Header>
          <Heading>{modalTitle}</Heading>
        </Modal.Header>
        <Modal.Body as="ul">{children}</Modal.Body>
      </Modal>
    </AppBox>
  );
};

type StepProps = {|
  ...AppBoxProps,
  title: string,
  content: string,
  tooltipLabel?: string,
  state: 'ACTIVE' | 'FINISHED' | 'WAITING',
  children?: React.Node,
|};
export const Step = ({ title, content, tooltipLabel, state, children, ...rest }: StepProps) => {
  const validChildren = cleanChildren(children);
  const progressBar = validChildren[0]?.props.progress ? validChildren[0] : undefined;
  const isMobile = useIsMobile();
  const getBackgroundColor = () => {
    switch (state) {
      case 'ACTIVE':
        return '#EBE7F9';
      default:
        if (isMobile) {
          return 'neutral-gray.50';
        }
        return 'white';
    }
  };
  const getTextColor = () => {
    switch (state) {
      case 'ACTIVE':
        return '#6030E8';
      case 'FINISHED':
        return 'neutral-gray.900';
      default:
        return 'neutral-gray.500';
    }
  };

  if (!isMobile) {
    return (
      <Tooltip label={tooltipLabel} delay={[1500, 350]}>
        <AppBox
          color={getBackgroundColor()}
          css={{
            outline: 'initial',
            cursor: state === 'WAITING' ? 'initial' : 'pointer',
            '&:hover': {
              color: state === 'WAITING' ? getBackgroundColor() : '#F8F7FD',
            },
          }}
          display="flex !important"
          flexDirection="column"
          justifyContent="flex-start"
          as="li"
          position="relative"
          marginRight={-5}
          {...rest}>
          <svg width="248" height="56" viewBox="0 0 248 56" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0.999756 0H16.9998V26.6896C16.9094 26.429 16.7913 26.1756 16.6454 25.9337L0.999756 0ZM16.9998 29.3104C16.9094 29.571 16.7913 29.8244 16.6454 30.0663L0.999756 56H16.9998V29.3104Z"
              fill="currentColor"
            />
            <rect width="216" height="56" transform="translate(17)" fill="currentColor" />
            <path
              d="M233 0L246.636 26.1506C247.24 27.3095 247.24 28.6905 246.636 29.8494L233 56V0Z"
              fill="currentColor"
            />
          </svg>
          <Flex
            direction="column"
            align="center"
            position="absolute"
            zIndex={9}
            width="248px"
            top="50%"
            left="50%"
            style={{ transform: 'translate(-45%,-50%)' }}>
            <Text as="p" fontSize={2} lineHeight="sm" fontWeight="semibold" color={getTextColor()}>
              {title}
            </Text>
            <Text fontSize={1} lineHeight="sm" fontWeight="normal" color={getTextColor()}>
              {content}
            </Text>
          </Flex>
          {children}
        </AppBox>
      </Tooltip>
    );
  }
  return (
    <Tooltip label={tooltipLabel}>
      <AppBox
        display="flex !important"
        flexDirection="column"
        justifyContent="flex-start"
        as="li"
        position="relative"
        width="100%"
        height="100%"
        minHeight={11}
        backgroundColor={getBackgroundColor()}
        marginBottom={2}
        borderRadius="normal"
        overflow="hidden"
        {...rest}>
        <Flex
          direction="column"
          align="center"
          position="absolute"
          zIndex={9}
          width="100%"
          top="50%"
          left="50%"
          style={{ transform: 'translate(-50%,-50%)' }}>
          <Text as="h5" fontSize={1} lineHeight="sm" fontWeight="semibold" color={getTextColor()}>
            {title}
          </Text>
          <Text fontSize={1} lineHeight="sm" fontWeight="normal" color={getTextColor()}>
            {content}
          </Text>
        </Flex>
        {progressBar &&
          React.cloneElement(progressBar, {
            width: '100%',
            marginLeft: 0,
            style: { transform: 'none' },
          })}
      </AppBox>
    </Tooltip>
  );
};
type ProgressPropTypes = {|
  progress: number,
|};

const Progress = ({ progress, ...rest }: ProgressPropTypes) => (
  <Flex
    direction="row"
    width="100%"
    height={1}
    position="absolute"
    bottom={0}
    backgroundColor="#B19BED"
    marginLeft="2px"
    style={{ transform: 'skew(328deg,0)' }}
    {...rest}>
    <div
      style={{
        width: `${progress}%`,
        height: '4px',
        borderRadius: '0px 50px 50px 0px',
        backgroundColor: '#6030E8',
      }}
    />
  </Flex>
);
Step.Progress = Progress;
