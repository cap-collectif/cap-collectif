import { Box, CapUIIcon, CapUIIconSize, Heading, Icon, Modal } from '@cap-collectif/ui'
import useIsMobile from '@shared/hooks/useIsMobile'
import { hexToRgb } from '@shared/utils/colors'
import { cloneElement, FC, useEffect, useRef } from 'react'
import styled from 'styled-components'
import Slider from 'react-slick'
import { cleanChildren } from '@shared/utils/cleanChildren'

const StepsContainer = styled(Slider)<{
  RGBPrimary: any
}>`
  width: 100%;
  overflow: hidden;
  height: 56px;
  & .slick-track {
    margin: 0;
  }
  & p {
    margin-bottom: 0;
  }
  & a {
    color: initial;
    &:hover {
      color: initial;
      text-decoration: none;
    }
  }
  .slick-slide {
    outline: none !important;
    margin-right: 0.375rem;
  }
  .slick-slide:first-child {
    margin-right: -0.625rem;
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
        background: rgba(
          ${props => props.RGBPrimary.r},
          ${props => props.RGBPrimary.g},
          ${props => props.RGBPrimary.b},
          0.85
        );
      }
      &.slick-disabled {
        display: none !important;
      }
      &:before {
        display: none;
      }
    }
  }
`
const StepArrowContainer = styled('button')`
  width: 100%;
  height: 100%;
  cursor: pointer;
  border: none;
  background: #fff;
  padding: 0;
  outline: none;
`
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
`

type StepsProps = {
  modalTitle: string
  children: React.ReactNode
  currentStepIndex: number
  mainColor: string
}
export const Steps: FC<StepsProps> = ({ children, modalTitle, currentStepIndex, mainColor }) => {
  const RGBPrimary = hexToRgb(mainColor)
  const sliderEle = useRef<typeof Slider>(null)
  const validChildren = cleanChildren(children)
  const activeStep =
    validChildren.filter(child => {
      return !!cleanChildren(child.props.children)[0]?.props?.progress
    })[0] || validChildren.filter(child => child.props.state === 'ACTIVE')[0]
  const isMobile = useIsMobile()
  useEffect(() => {
    const timeOutID = setTimeout(() => sliderEle.current?.slickGoTo(currentStepIndex, false), 350)
    return () => {
      clearTimeout(timeOutID)
    }
  }, [currentStepIndex])

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
        <Box
          width={7}
          height={7}
          right={4}
          zIndex={9}
          borderRadius="50%"
          backgroundColor={`rgba(${RGBPrimary.r},${RGBPrimary.g},${RGBPrimary.b},1)`}
          opacity="0.6"
          display="flex !important"
          alignItems="center"
          justifyContent="center"
        >
          <Icon name={CapUIIcon.ArrowRight} size={CapUIIconSize.Sm} color="white" />
        </Box>
      ),
      prevArrow: (
        <Box
          width={7}
          height={7}
          left={4}
          zIndex={9}
          borderRadius="50%"
          backgroundColor={`rgba(${RGBPrimary.r},${RGBPrimary.g},${RGBPrimary.b},1)`}
          opacity="0.6"
          display="flex !important"
          alignItems="center"
          justifyContent="center"
        >
          <Icon name={CapUIIcon.ArrowLeft} size={CapUIIconSize.Sm} color="white" />
        </Box>
      ),
    }
    return (
      <Box
        className="frise__stepList"
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
        borderRadius="normal"
        backgroundColor="white"
        height={11}
        p={0}
      >
        <StepsContainer RGBPrimary={RGBPrimary} ref={sliderEle} {...settings}>
          {validChildren.map((child, index) =>
            cloneElement(child, {
              isStart: index === 0,
              isEnd: index === validChildren.length - 1 && index !== 0,
            }),
          )}
        </StepsContainer>
      </Box>
    )
  }

  if (activeStep) {
    return (
      <Box
        className="frise__stepList"
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
        p={0}
      >
        {/** @ts-ignore */}
        <Modal
          baseId="project-header-frise"
          borderRadius="16px 16px 0px 0px"
          boxShadow="0px 10px 99px rgba(0, 0, 0, 0.302)"
          ariaLabel={modalTitle}
          scrollBehavior="inside"
          disclosure={
            <StepArrowContainer
              onClick={e => {
                e.stopPropagation()
                e.nativeEvent.stopImmediatePropagation()
              }}
            >
              {cloneElement(activeStep, {
                style: {
                  pointerEvents: 'none',
                },
              })}
              <StepsModalToggle className="arrow">
                <Icon
                  name={CapUIIcon.ArrowDown}
                  size={CapUIIconSize.Md}
                  color="white"
                  borderRadius="50%"
                  backgroundColor={`rgba(${RGBPrimary.r},${RGBPrimary.g},${RGBPrimary.b},1)`}
                />
              </StepsModalToggle>
            </StepArrowContainer>
          }
        >
          <Modal.Header>
            <Heading>{modalTitle}</Heading>
          </Modal.Header>
          <Modal.Body as="ul">{children}</Modal.Body>
        </Modal>
      </Box>
    )
  }

  return (
    <Box
      className="frise__stepList"
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
    >
      {/** @ts-ignore */}
      <Modal
        borderRadius="16px 16px 0px 0px"
        boxShadow="0px 10px 99px rgba(0, 0, 0, 0.302)"
        ariaLabel={modalTitle}
        scrollBehavior="inside"
        disclosure={
          <StepArrowContainer
            onClick={e => {
              e.stopPropagation()
              e.nativeEvent.stopImmediatePropagation()
            }}
          >
            {cloneElement(validChildren[0], {
              style: {
                pointerEvents: 'none',
              },
            })}
            <StepsModalToggle
              className="arrow"
              style={{
                height: '100%',
              }}
            >
              <Icon
                style={{
                  opacity: '0.6',
                }}
                padding={4}
                name={CapUIIcon.ArrowDown}
                size={CapUIIconSize.Md}
                color="white"
                borderRadius="50%"
                backgroundColor={`rgba(${RGBPrimary.r},${RGBPrimary.g},${RGBPrimary.b},1)`}
              />
            </StepsModalToggle>
          </StepArrowContainer>
        }
      >
        <Modal.Header>
          <Heading>{modalTitle}</Heading>
        </Modal.Header>
        <Modal.Body as="ul">{children}</Modal.Body>
      </Modal>
    </Box>
  )
}
