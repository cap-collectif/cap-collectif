// @flow
import React from 'react';
import { Flex, FormControl, Radio, RadioGroup, Text } from '@cap-collectif/ui';
import { useVoteStepContext } from '~/components/VoteStep/Context/VoteStepContext';
import { type FilterOptions } from '~/components/VoteStep/Filters/useVoteStepFilters';

type Props = {
  options: FilterOptions,
  filterName: string,
};

export const VoteStepFilterRadioGroup = ({ options, filterName }: Props) => {

  const { filters, setFilters } = useVoteStepContext();
  let filter = filters[filterName];

  if (filterName === 'sort' && filter === '') {
    filter = 'random'
  }

  const handleOnChange = e => {
    setFilters(filterName, e.target.value);
  };

  return (
    <RadioGroup mt={2}>
      {options.map(choice => (
        <Flex alignItems="center" key={choice.id}>
          <FormControl>
            <Radio
              id={choice.id === '' ? `${filterName}-all` : choice.id}
              name={filterName}
              value={choice.id}
              checked={choice.id === filter}
              onChange={handleOnChange}>
              <Text
                sx={{
                  marginLeft: '4px !important',
                }}
                color="neutral-gray.900"
                fontSize={3}
                fontWeight={400}>
                {choice?.title || choice?.name}
              </Text>
            </Radio>
          </FormControl>
        </Flex>
      ))}
    </RadioGroup>
  );
};

export default VoteStepFilterRadioGroup;
