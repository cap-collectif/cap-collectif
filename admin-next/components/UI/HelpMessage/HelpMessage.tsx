import React from 'react'
import {Box, CapUIIcon, CapUIIconSize, Flex, Icon, useTheme} from "@cap-collectif/ui";

type Variant = 'danger' | 'info' | 'success' | 'warning'

type Props = {
    variant: Variant
}


const HelpMessage: React.FC<Props> = ({ variant = 'info', children }) => {

    const {colors} = useTheme();

    const variants = {
        danger: {
            bg: "red.100",
            color: "red.900",
            boxShadowColor: colors.red[300]
        },
        info: {
            bg: "blue.100",
            color: "blue.900",
            boxShadowColor: colors.blue[300]
        },
        success: {
            bg: "green.100",
            color: "green.900",
            boxShadowColor: colors.green[300]
        },
        warning: {
            bg: "yellow.100",
            color: "yellow.900",
            boxShadowColor: colors.yellow[300]
        },
    }

    const getIcon = (
        variant: Variant,
        props?: any,
    ): React.ReactNode => {
        const common: { size: CapUIIconSize } = {
            size: CapUIIconSize.Md,
        }
        switch (variant) {
            case 'info':
                return (
                    <Icon name={CapUIIcon.Info} color="blue.500" {...common} {...props} />
                )
            case 'success':
                return (
                    <Icon name={CapUIIcon.Check} color="green.500" {...common} {...props} />
                )
            case 'danger':
                return (
                    <Icon name={CapUIIcon.Cross} color="red.500" {...common} {...props} />
                )
            case 'warning':
                return (
                    <Icon
                        name={CapUIIcon.Alert}
                        color="yellow.500"
                        {...common}
                        {...props}
                    />
                )
            default:
                throw new Error('Unsupported icon variant!')
        }
    }

    return (
        <Box
            height="max-content"
            m={2}
            p={4}
            pr={5}
            borderRadius="toast"
            bg={variants[variant].bg}
            color={variants[variant].color}
            boxShadow={`0 -5px 0 ${variants[variant].boxShadowColor}, 0 10px 50px rgba(0, 0, 0, 0.15)`}
        >
            <Flex>
                {getIcon(variant, {mr: 2})}
                {children}
            </Flex>
        </Box>
    )
}

export default HelpMessage;