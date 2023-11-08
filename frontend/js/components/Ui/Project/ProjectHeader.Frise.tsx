import * as React from 'react'
import Slider from 'react-slick'
import styled from 'styled-components'
import { useSelector } from 'react-redux'
import {
  Heading,
  Tooltip,
  Flex,
  Icon,
  Text,
  Modal,
  Box,
  CapUIIcon,
  headingStyles,
  CapUIIconSize,
} from '@cap-collectif/ui'
import { Link, useParams } from 'react-router-dom'
import { cleanChildren } from '~/utils/cleanChildren'
import useIsMobile from '~/utils/hooks/useIsMobile'
import hexToRgb from '~/utils/colors/hexToRgb'
import StartStep from '~ui/Project/SVG/Start'
import EndStep from '~ui/Project/SVG/End'
import MiddleStep from '~ui/Project/SVG/Step'
import ResetCss from '~/utils/ResetCss'
import { getBaseLocale } from '~/utils/router'
import type { GlobalState } from '~/types'
type FriseProps = {
  children: JSX.Element | JSX.Element[] | string
}
export const Frise = ({ children, ...rest }: FriseProps) => (
  <Box className="frise" width="100%" paddingX={[4, 0]} marginBottom={[-8, -13]} marginTop={3} {...rest}>
    {children}
  </Box>
)
const StepsContainer = styled(Slider)<{
  RGBPrimary: any
}>`
  width: 100%;
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
  children: JSX.Element | JSX.Element[] | string
  currentStepIndex: number
}
export const Steps = ({ children, modalTitle, currentStepIndex, ...rest }: StepsProps) => {
  const mainColor = useSelector((state: GlobalState) => state.default.parameters['color.btn.primary.bg'])
  const RGBPrimary = hexToRgb(mainColor)
  const sliderEle = React.useRef<typeof Slider>(null)
  const validChildren = cleanChildren(children)
  const activeStep =
    validChildren.filter(child => {
      return !!cleanChildren(child.props.children)[0]?.props?.progress
    })[0] || validChildren.filter(child => child.props.state === 'ACTIVE')[0]
  const isMobile = useIsMobile()
  React.useEffect(() => {
    const timeOutID = setTimeout(() => sliderEle.current.slickGoTo(currentStepIndex, false), 350)
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
        {...rest}
      >
        <StepsContainer RGBPrimary={RGBPrimary} ref={sliderEle} {...settings}>
          {validChildren.map((child, index) =>
            React.cloneElement(child, {
              isStart: index === 0,
              isEnd: (index === validChildren.length - 1 && index !== 0),
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
        {...rest}
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
              {React.cloneElement(activeStep, {
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
          <ResetCss>
            <Modal.Header>
              <Heading>{modalTitle}</Heading>
            </Modal.Header>
          </ResetCss>
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
      {...rest}
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
            {React.cloneElement(validChildren[0], {
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
type RouterWrapperProps = {
  readonly router?: boolean
  readonly children: JSX.Element | JSX.Element[] | string
  readonly href: string
  readonly stepId: string
  readonly questionnaireId?: string
  readonly platformLocale: string
}

const Route = ({ children, href, stepId, questionnaireId, platformLocale }: RouterWrapperProps) => {
  const { projectSlug } = useParams()
  const currentLanguage = useSelector((state: GlobalState) => state.language.currentLanguage)
  const baseUrl = getBaseLocale(currentLanguage, platformLocale)
  return (
    <Link
      to={{
        pathname: `${baseUrl}/project/${projectSlug || ''}${href}`,
        state: {
          stepId,
          questionnaireId,
        },
      }}
    >
      {children}
    </Link>
  )
}

const RouterWrapper = ({ router, children, href, stepId, questionnaireId, platformLocale }: RouterWrapperProps) => {
  return router ? (
    <Route stepId={stepId} questionnaireId={questionnaireId} href={href} platformLocale={platformLocale}>
      {children}
    </Route>
  ) : (
    <>{children}</>
  )
}

type StepProps = {
  title: string
  content?: JSX.Element | JSX.Element[] | string
  tooltipLabel?: string | null | undefined
  state: 'ACTIVE' | 'FINISHED' | 'WAITING'
  href: string
  url: string | null | undefined
  children?: JSX.Element | JSX.Element[] | string
  isStart?: boolean
  isEnd?: boolean
  onClick?: (event: Event) => void
  stepId: string
  questionnaireId?: string
  platformLocale?: string
}
export const Step = ({
  title,
  content,
  tooltipLabel,
  state,
  href,
  url,
  children,
  stepId,
  isStart = false,
  isEnd = false,
  questionnaireId,
  onClick,
  platformLocale = 'fr-FR',
  ...rest
}: StepProps) => {
  const mainColor = useSelector((store: GlobalState) => store.default.parameters['color.btn.primary.bg'])
  const RGBPrimary = hexToRgb(mainColor)
  const validChildren = cleanChildren(children)
  const progressBar = validChildren[0]?.props.progress ? validChildren[0] : undefined
  const isMobile = useIsMobile()

  const getBackgroundColor = () => {
    switch (state) {
      case 'ACTIVE':
        return `rgba(${RGBPrimary.r},${RGBPrimary.g},${RGBPrimary.b},0.08)`

      default:
        if (isMobile) {
          return 'neutral-gray.50'
        }

        return 'white'
    }
  }

  const getTextColor = () => {
    switch (state) {
      case 'ACTIVE':
        return mainColor

      case 'FINISHED':
        return 'neutral-gray.900'

      default:
        return 'neutral-gray.500'
    }
  }

  const isValidTooltip = typeof tooltipLabel === 'number' || !!tooltipLabel

  if (!isMobile) {
    return (
      <RouterWrapper
        router={!url && !isMobile}
        href={href}
        stepId={stepId}
        questionnaireId={questionnaireId}
        platformLocale={platformLocale}
      >
        <Flex
          // @ts-ignore
          onClick={onClick}
          className="frise__stepItem"
          color={getBackgroundColor()}
          sx={{
            outline: 'initial',
            '&:hover': {
              color:
                state === 'WAITING'
                  ? getBackgroundColor()
                  : `rgba(${RGBPrimary.r},${RGBPrimary.g},${RGBPrimary.b},0.05)`,
            },
          }}
          flexDirection="column"
          justifyContent="flex-start"
          as="li"
          position="relative"
          marginRight={-5}
          marginLeft={isStart ? -3 : 0}
          height="56px"
          {...rest}
        >
          {isStart && <StartStep />}
          {isEnd && <EndStep />}
          {!isStart && !isEnd && <MiddleStep />}
          <Flex
            className="frise__stepItem__link"
            direction="column"
            align="center"
            position="absolute"
            zIndex={9}
            width="248px"
            top="50%"
            left="50%"
            as="a"
            href={url || undefined}
            paddingX={4}
            textAlign="center"
            height="100%"
            justify="center"
            style={{
              transform: 'translate(-45%,-50%)',
            }}
          >
            {isValidTooltip ? (
              <Tooltip className="platform__body" label={tooltipLabel}>
                <Text
                  {...headingStyles.h5}
                  fontSize={2}
                  className="frise__stepItem__link__title platform__body"
                  color={getTextColor()}
                  truncate={50}
                  fontWeight="semibold"
                >
                  {title}
                </Text>
              </Tooltip>
            ) : (
              <Text
                {...headingStyles.h5}
                fontSize={2}
                className="frise__stepItem__link__title platform__body"
                color={getTextColor()}
                truncate={50}
                fontWeight="semibold"
              >
                {title}
              </Text>
            )}
            <Text
              className="frise__stepItem__link__content platform__body"
              {...headingStyles.h5}
              color={getTextColor()}
            >
              {content}
            </Text>
          </Flex>

          {progressBar
            ? React.cloneElement(progressBar, {
                width: isStart ? '222px' : '232px',
              })
            : null}
        </Flex>
      </RouterWrapper>
    )
  }

  return (
    <>
      {isValidTooltip ? (
        <Tooltip className="platform__body" label={tooltipLabel}>
          <Flex
            className="frise__stepItem"
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
            textAlign="center"
            {...rest}
          >
            <Flex
              className="frise__stepItem__link"
              direction="column"
              align="center"
              position="absolute"
              zIndex={9}
              width="calc(100% - 100px)"
              top="50%"
              left="50%"
              as="a"
              href={url}
              style={{
                transform: 'translate(-50%,-50%)',
              }}
            >
              <Text
                className="frise__stepItem__link__title platform__body"
                as="h5"
                fontSize={1}
                lineHeight="sm"
                fontWeight="semibold"
                truncate={50}
                color={getTextColor()}
              >
                {title}
              </Text>
              <Text
                className="frise__stepItem__link__content platform__body"
                fontSize={1}
                lineHeight="sm"
                fontWeight="normal"
                color={getTextColor()}
              >
                {content}
              </Text>
            </Flex>
            {progressBar &&
              React.cloneElement(progressBar, {
                width: '100%',
                marginLeft: 0,
                style: {
                  transform: 'none',
                },
              })}
          </Flex>
        </Tooltip>
      ) : (
        <>
          <Flex
            className="frise__stepItem"
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
            textAlign="center"
            {...rest}
          >
            <Flex
              className="frise__stepItem__link"
              direction="column"
              align="center"
              position="absolute"
              zIndex={9}
              width="calc(100% - 100px)"
              top="50%"
              left="50%"
              as="a"
              href={url}
              style={{
                transform: 'translate(-50%,-50%)',
              }}
            >
              <Text
                className="frise__stepItem__link__title platform__body"
                {...headingStyles.h5}
                fontWeight="semibold"
                truncate={50}
                color={getTextColor()}
              >
                {title}
              </Text>
              <Text
                className="frise__stepItem__link__content platform__body"
                fontSize={1}
                lineHeight="sm"
                fontWeight="normal"
                color={getTextColor()}
              >
                {content}
              </Text>
            </Flex>
            {progressBar &&
              React.cloneElement(progressBar, {
                width: '100%',
                marginLeft: 0,
                style: {
                  transform: 'none',
                },
              })}
          </Flex>
        </>
      )}
    </>
  )
}
type ProgressPropTypes = {
  progress: number
}

const Progress = ({ progress, ...rest }: ProgressPropTypes) => {
  const mainColor = useSelector((state: GlobalState) => state.default.parameters['color.btn.primary.bg'])
  const RGBPrimary = hexToRgb(mainColor)
  return (
    <Flex
      className="frise__stepItem__progressbar"
      direction="row"
      width="232px"
      height={1}
      position="absolute"
      bottom={0}
      backgroundColor={`rgba(${RGBPrimary.r},${RGBPrimary.g},${RGBPrimary.b},0.47)`}
      marginLeft="2px"
      style={{
        transform: 'skew(328deg,0)',
      }}
      {...rest}
    >
      <Box
        className="frise__stepItem__progress"
        width={`${progress}%`}
        height={1}
        borderRadius="0px 50px 50px 0px"
        backgroundColor={mainColor}
      />
    </Flex>
  )
}

Step.Progress = Progress
