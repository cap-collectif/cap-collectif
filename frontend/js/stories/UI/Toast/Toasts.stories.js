/* eslint-disable jsx-a11y/anchor-is-valid */
// @flow
import * as React from 'react';
import Flex from '~ui/Primitives/Layout/Flex';
import Button from '~ds/Button/Button';
import Text from '~ui/Primitives/Text';
import { toast } from '~ds/Toast';

export default {
  title: 'Design system/Toasts',
  argTypes: {},
};
const Template = (args: any) => (
  <Flex direction={['column', 'row']} gridGap={2} wrap="wrap">
    <Button
      variant="primary"
      variantSize="medium"
      onClick={() => {
        toast({
          ...args,
          variant: 'success',
          content: 'Je suis un toast de type success',
        });
      }}>
      Notify success
    </Button>
    <Button
      variant="primary"
      variantSize="medium"
      onClick={() => {
        toast({
          ...args,
          variant: 'info',
          content: 'Je suis un toast de type info',
        });
      }}>
      Notify info
    </Button>
    <Button
      variant="primary"
      variantSize="medium"
      onClick={() => {
        toast({
          ...args,
          variant: 'warning',
          content: 'Je suis un toast de type warning',
        });
      }}>
      Notify warning
    </Button>
    <Button
      variant="primary"
      variantSize="medium"
      variantColor="danger"
      onClick={() => {
        toast({
          ...args,
          variant: 'danger',
          content: 'Je suis un toast de type danger',
        });
      }}>
      Notify danger
    </Button>
  </Flex>
);

export const main = Template.bind({});
main.storyName = 'Default';
main.args = {};

export const withDefinedDuration = Template.bind({});
withDefinedDuration.storyName = 'with defined duration';
withDefinedDuration.args = {
  duration: 4000,
};

const LinksTemplate = () => (
  <Flex direction={['column', 'row']} gridGap={2} wrap="wrap">
    <Button
      variant="primary"
      variantSize="medium"
      onClick={() => {
        toast({
          variant: 'success',
          content: (
            <Text>
              Je suis un toast <a href="#">de type success</a>
            </Text>
          ),
        });
      }}>
      Notify success
    </Button>
    <Button
      variant="primary"
      variantSize="medium"
      onClick={() => {
        toast({
          variant: 'info',
          content: (
            <Text>
              Je suis un toast <a href="#">de type info</a>
            </Text>
          ),
        });
      }}>
      Notify info
    </Button>
    <Button
      variant="primary"
      variantSize="medium"
      onClick={() => {
        toast({
          variant: 'warning',
          content: (
            <Text>
              Je suis un toast <a href="#">de type warning</a>
            </Text>
          ),
        });
      }}>
      Notify warning
    </Button>
    <Button
      variant="primary"
      variantSize="medium"
      variantColor="danger"
      onClick={() => {
        toast({
          variant: 'danger',
          content: (
            <Text>
              Je suis un toast <a href="#">de type danger</a>
            </Text>
          ),
        });
      }}>
      Notify danger
    </Button>
  </Flex>
);

export const withLinks = LinksTemplate.bind({});
withLinks.storyName = 'with links inside';

const positionTemplate = () => (
  <Flex direction={['column', 'row']} gridGap={2} wrap="wrap">
    <Button
      variant="primary"
      variantSize="medium"
      onClick={() => {
        toast({
          position: 'top-left',
          content: 'Je suis un toast',
          variant: 'success',
        });
      }}>
      Notify top left
    </Button>
    <Button
      variant="primary"
      variantSize="medium"
      onClick={() => {
        toast({
          position: 'top',
          content: 'Je suis un toast',
          variant: 'success',
        });
      }}>
      Notify top
    </Button>
    <Button
      variant="primary"
      variantSize="medium"
      onClick={() => {
        toast({
          position: 'top-right',
          content: 'Je suis un toast',
          variant: 'success',
        });
      }}>
      Notify top right
    </Button>
    <Button
      variant="primary"
      variantSize="medium"
      onClick={() => {
        toast({
          position: 'bottom-left',
          content: 'Je suis un toast',
          variant: 'success',
        });
      }}>
      Notify bottom left
    </Button>
    <Button
      variant="primary"
      variantSize="medium"
      onClick={() => {
        toast({
          position: 'bottom',
          content: 'Je suis un toast',
          variant: 'success',
        });
      }}>
      Notify bottom
    </Button>
    <Button
      variant="primary"
      variantSize="medium"
      onClick={() => {
        toast({
          position: 'bottom-right',
          content: 'Je suis un toast',
          variant: 'success',
        });
      }}>
      Notify bottom right
    </Button>
  </Flex>
);

export const withPosition = positionTemplate.bind({});
withPosition.storyName = 'with positionnable notifications';
