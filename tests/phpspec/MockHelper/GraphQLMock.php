<?php

namespace Capco\Tests\phpspec\MockHelper;

trait GraphQLMock
{
    /**
     * This method can accept Collaborator and Argument.
     *
     * @param mixed $argument  Expect a Collaborator or an Argument here
     * @param array $rawInput  Default array input
     * @param array $values    Default array values
     * @param bool  $multiCall Flag to indicate multiple calls
     */
    public function getMockedGraphQLArgumentFormatted(
        mixed $argument,
        array $rawInput = [],
        array $values = [],
        bool $multiCall = false
    ): void {
        if ($multiCall) {
            $argument
                ->offsetGet('input')
                ->shouldBeCalled()
                ->willReturn($rawInput)
            ;

            $argument
                ->exchangeArray($rawInput)
                ->shouldBeCalled()
                ->willReturn($values)
            ;
        } else {
            $argument
                ->offsetGet('input')
                ->shouldBeCalledOnce()
                ->willReturn($rawInput)
            ;

            $argument
                ->exchangeArray($rawInput)
                ->shouldBeCalledOnce()
                ->willReturn($values)
            ;
        }
    }
}
