/* eslint-disable jsx-a11y/anchor-is-valid */
// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { number } from 'storybook-addon-knobs';
import Flex from '~ui/Primitives/Layout/Flex';
import Button from '~ds/Button/Button';
import Text from '~ui/Primitives/Text';
import { toast } from '~ds/Toast';

storiesOf('Design system|Toasts', module)
  .add('default', () => {
    return (
      <Flex direction={['column', 'row']} gridGap={2} wrap="wrap">
        <Button
          variant="primary"
          variantSize="medium"
          onClick={() => {
            toast({
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
              variant: 'danger',
              content: 'Je suis un toast de type danger',
            });
          }}>
          Notify danger
        </Button>
      </Flex>
    );
  })
  .add('with defined duration', () => {
    const duration = number('Duration', 4000);
    return (
      <Flex direction={['column', 'row']} gridGap={2} wrap="wrap">
        <Button
          variant="primary"
          variantSize="medium"
          onClick={() => {
            toast({
              variant: 'success',
              duration,
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
              duration,
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
              duration,
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
          variantColor="danger"
          variantSize="medium"
          onClick={() => {
            toast({
              variant: 'danger',
              duration,
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
  })
  .add('with links inside', () => {
    return (
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
  })
  .add('with positionnable notifications', () => {
    return (
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
  });
