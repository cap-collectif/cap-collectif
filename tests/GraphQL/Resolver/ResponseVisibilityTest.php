<?php

namespace Capco\Tests\GraphQL\Resolver;

use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Resolver\User\UserResponsesResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Checks the public response visibility policy with real entities and explicit ACL context.
 */
final class ResponseVisibilityTest extends TestCase
{
    /** @dataProvider visibilityContexts */
    public function testPrivilegedInternalContextIncludesPrivateAndHiddenResponses(bool $disableAcl, bool $hasAuthor): void
    {
        $public = (new ValueResponse())->setQuestion((new SimpleQuestion())->setPrivate(false));
        $private = (new ValueResponse())->setQuestion((new SimpleQuestion())->setPrivate(true));
        $hidden = (new ValueResponse())->setQuestion((new SimpleQuestion())->setHidden(true));
        $responses = new ArrayCollection([$public, $private, $hidden]);
        $visibility = new UserResponsesResolver(new ConnectionBuilder());
        $author = $hasAuthor ? new User() : null;

        self::assertSame($disableAcl ? [$public, $private, $hidden] : [$public], $visibility->filterVisibleResponses($responses, $author, null, new \ArrayObject(['disable_acl' => $disableAcl]))->toArray());
    }

    /** @return iterable<string, array{bool, bool}> */
    public static function visibilityContexts(): iterable
    {
        yield 'ordinary anonymous context' => [false, true];
        yield 'privileged internal context' => [true, true];
        yield 'missing author' => [false, false];
    }
}
