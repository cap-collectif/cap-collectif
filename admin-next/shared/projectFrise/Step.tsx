import { CapUIFontSize, CapUILineHeight, Flex, Text, Tooltip, headingStyles } from '@cap-collectif/ui'
import useIsMobile from '@shared/hooks/useIsMobile'
import { cleanChildren } from '@shared/utils/cleanChildren'
import { hexToRgb } from '@shared/utils/colors'
import { cloneElement, FC } from 'react'
import StartStep from './SVG/Start'
import EndStep from './SVG/End'
import MiddleStep from './SVG/Step'
import { pxToRem } from '@shared/utils/pxToRem'

type StepProps = {
  title: string
  content?: React.ReactNode
  tooltipLabel?: string | null | undefined
  state: 'ACTIVE' | 'FINISHED' | 'WAITING'
  href: string
  url: string | null | undefined
  children?: React.ReactNode
  isStart?: boolean
  isEnd?: boolean
  onClick?: (event: Event) => void
  stepId: string
  questionnaireId?: string
  platformLocale?: string
  mainColor: string
  RouterWrapper?: React.JSXElementConstructor<any>
}
export const Step: FC<StepProps> = ({
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
  mainColor,
  RouterWrapper,
}) => {
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

  const renderStep = () => (
    <Flex
      // @ts-ignore
      onClick={onClick}
      className="frise__stepItem"
      color={getBackgroundColor()}
      sx={{
        outline: 'initial',
        '&:hover': {
          color:
            state === 'WAITING' ? getBackgroundColor() : `rgba(${RGBPrimary.r},${RGBPrimary.g},${RGBPrimary.b},0.05)`,
        },
      }}
      flexDirection="column"
      justifyContent="flex-start"
      as="li"
      position="relative"
      marginRight={-5}
      marginLeft={isStart ? -3 : 0}
      height={pxToRem(56)}
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
        width={pxToRem(248)}
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
              fontSize={CapUIFontSize.BodySmall}
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
            fontSize={CapUIFontSize.BodySmall}
            className="frise__stepItem__link__title platform__body"
            color={getTextColor()}
            truncate={50}
            fontWeight="semibold"
            as="h2"
          >
            {title}
          </Text>
        )}
        <Text className="frise__stepItem__link__content platform__body" {...headingStyles.h5} color={getTextColor()}>
          {content}
        </Text>
      </Flex>

      {progressBar
        ? cloneElement(progressBar, {
            width: isStart ? '222px' : '232px',
          })
        : null}
    </Flex>
  )

  if (!isMobile) {
    return RouterWrapper ? (
      <RouterWrapper
        router={!url && !isMobile}
        href={href}
        stepId={stepId}
        questionnaireId={questionnaireId}
        platformLocale={platformLocale}
      >
        {renderStep()}
      </RouterWrapper>
    ) : (
      renderStep()
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
                as="h2"
                fontSize={CapUIFontSize.Caption}
                lineHeight={CapUILineHeight.S}
                fontWeight="semibold"
                truncate={50}
                color={getTextColor()}
              >
                {title}
              </Text>
              <Text
                className="frise__stepItem__link__content platform__body"
                fontSize={CapUIFontSize.Caption}
                lineHeight={CapUILineHeight.S}
                fontWeight="normal"
                color={getTextColor()}
              >
                {content}
              </Text>
            </Flex>
            {progressBar &&
              cloneElement(progressBar, {
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
                fontSize={CapUIFontSize.Caption}
                lineHeight={CapUILineHeight.S}
                fontWeight="normal"
                color={getTextColor()}
              >
                {content}
              </Text>
            </Flex>
            {progressBar &&
              cloneElement(progressBar, {
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
