<?php

namespace Capco\Tests\GraphQL\Resolver\Reply;

use Capco\Tests\ResponseVisibilityWebTestCase;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises HTTP outcomes and real domain data with transactional cleanup; replaces only external boundaries.
 */
final class ReplyResponsesResolverTest extends ResponseVisibilityWebTestCase
{
    /**
     * @dataProvider viewers
     *
     * @param list<string> $expected
     */
    public function testPrivateAndHiddenResponsesRespectTheViewer(string $kind, array $expected): void
    {
        $author = $this->account();
        $contribution = $this->contribution('Reply', $author);
        if ('author' === $kind) {
            $this->login($author->getEmail());
        } elseif ('admin' === $kind) {
            $admin = $this->account()->addRole('ROLE_ADMIN');
            $this->em->flush();
            $this->login($admin->getEmail());
        } elseif ('other' === $kind) {
            $this->login($this->account()->getEmail());
        }
        $this->assertVisibleResponses('Reply', $contribution->getId(), $expected);
    }

    /** @return iterable<string, array{string, list<string>}> */
    public static function viewers(): iterable
    {
        yield 'anonymous' => ['anonymous', ['Answer public']];
        yield 'unrelated account' => ['other', ['Answer public']];
        yield 'author' => ['author', ['Answer public', 'Answer private']];
        yield 'administrator' => ['admin', ['Answer public', 'Answer private', 'Answer hidden']];
    }
}
