<?php

namespace Capco\Tests\phpspec\MockHelper;

use PhpSpec\Wrapper\Collaborator;

trait GraphQLMock{
    public function getMockedGraphQLArgumentFormatted(Collaborator $argument, array $rawInput = [], array $values = [], bool $multiCall = false): void
    {
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
