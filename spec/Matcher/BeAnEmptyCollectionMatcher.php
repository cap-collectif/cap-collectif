<?php

namespace spec\Matcher;

use PhpSpec\Exception\Example\FailureException;
use PhpSpec\Matcher\Matcher;
use PhpSpec\Wrapper\DelayedCall;
use Doctrine\Common\Collections\ArrayCollection;

class BeAnEmptyCollectionMatcher implements Matcher
{
    public function supports(string $name, $subject, array $arguments): bool
    {
        return 'returnEmptyCollection' === $name;
    }

    public function positiveMatch(string $name, $subject, array $arguments): ?DelayedCall
    {
        if (!$subject instanceof ArrayCollection) {
            throw new FailureException(
                sprintf('the return value "%s" should be a Collection.', $subject)
            );
        }
        if ($subject->count() > 0) {
            throw new FailureException(
                sprintf('the return value "%s" must be an empty Collection.', $subject)
            );
        }

        return null;
    }

    public function negativeMatch(string $name, $subject, array $arguments): ?DelayedCall
    {
        if ($subject instanceof ArrayCollection) {
            throw new FailureException(
                sprintf('the return value "%s" should not be a Collection.', $subject)
            );
        }

        return null;
    }

    public function getPriority(): int
    {
        return 0;
    }
}
