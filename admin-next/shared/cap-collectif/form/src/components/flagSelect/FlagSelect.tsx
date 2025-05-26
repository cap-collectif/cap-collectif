// @ts-nocheck

import cn from 'classnames'
import * as React from 'react'
import { components, ControlProps, GroupBase } from 'react-select'
import {
  Box,
  BoxPropsOf,
  CapInputSize,
  CapUIIcon,
  CapUIIconSize,
  Flex,
  Icon,
  Spinner,
  Select,
  useFormControl,
  Text,
  CapUIFontSize,
  CapUILineHeight,
} from '@cap-collectif/ui'
import flags from './flags'
import { COUNTRY_CODES } from './enums'

export type FlagType = {
  name: string
  dial_code: number
  country_code: string
  flag: string
  currency: string
  currency_symbol: string
}
export type FlagOptionType = {
  value: string
  label: React.ReactNode
}
export interface FlagSelectProps extends Omit<BoxPropsOf<'input'>, 'onChange'> {
  readonly isDisabled?: boolean
  readonly isInvalid?: boolean
  readonly variantSize?: CapInputSize
  readonly uniqueCountry?: COUNTRY_CODES
}
const flagsOptions: FlagOptionType[] = flags.map((flag: FlagType) => ({
  value: flag.country_code,
  label: (
    <Flex direction="row" spacing={2} align="center">
      <Box>{flag.flag}</Box>
      <Text
        color="gray.900"
        fontSize={CapUIFontSize.BodyRegular}
        lineHeight={CapUILineHeight.Normal}
        m={0}
        ml={2}
      >
        {flag.country_code} (+{flag.dial_code})
      </Text>
    </Flex>
  ),
}))

export function Control<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({ children, ...props }: ControlProps<Option, IsMulti, Group>) {
  const { isLoading } = props.selectProps
  return (
    <components.Control {...props}>
      {Array.isArray(children) && children[0]}
      {isLoading && <Spinner mr={2} color="blue.500" />}
      {!isLoading && !props.isDisabled && (
        <Flex
          mr={2}
          direction="column"
          style={{ cursor: 'pointer' }}
          onClick={props.clearValue}
        >
          <Icon
            name={CapUIIcon.ArrowUp}
            size={CapUIIconSize.Xs}
            color="gray.700"
          />
          <Icon
            name={CapUIIcon.ArrowDown}
            size={CapUIIconSize.Xs}
            color="gray.700"
          />
        </Flex>
      )}
    </components.Control>
  )
}

const FlagSelect: React.FC<FlagSelectProps> = ({
  className,
  variantSize,
  uniqueCountry,
  onChange,
  value,
  ...props
}: FlagSelectProps) => {
  const inputProps = useFormControl<HTMLInputElement>(props)
  const getUniqueCountryIndexByCountryCode = (CountryCode: string) =>
    flagsOptions.findIndex((flag: FlagOptionType) => flag.value === CountryCode)

  return (
    <Select
      {...inputProps}
      isDisabled={!!uniqueCountry}
      options={flagsOptions}
      defaultValue={
        uniqueCountry
          ? flagsOptions[getUniqueCountryIndexByCountryCode(uniqueCountry)]
          : value
          ? flagsOptions[
              getUniqueCountryIndexByCountryCode(
                flags.find((flag: FlagOptionType) => flag.dial_code === value)
                  .country_code,
              )
            ]
          : null
      }
      inputId="color"
      components={{ Control }}
      className={cn('cap-phone-number-select', `${className}-select`)}
      onChange={value => {
        onChange(
          flags[getUniqueCountryIndexByCountryCode(value.value)].dial_code,
        )
      }}
    />
  )
}
export default FlagSelect
