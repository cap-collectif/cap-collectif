<?php

namespace spec\Matcher;

use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use PhpSpec\Exception\Example\FailureException;
use PhpSpec\Matcher\Matcher;
use PhpSpec\Wrapper\DelayedCall;

class BeAConnectionMatcher implements Matcher
{
    public function supports(string $name, $subject, array $arguments): bool
    {
        return 'returnConnection' === $name;
    }

    public function positiveMatch(string $name, $subject, array $arguments): ?DelayedCall
    {
        if (!$subject instanceof Connection) {
            throw new FailureException(sprintf('the return value "%s" should be a Connection.', $subject));
        }

        return null;
    }

    public function negativeMatch(string $name, $subject, array $arguments): ?DelayedCall
    {
        if ($subject instanceof Connection) {
            throw new FailureException(sprintf('the return value "%s" should not be a Connection.', $subject));
        }

        return null;
    }

    public function getPriority(): int
    {
        return 0;
    }
}
