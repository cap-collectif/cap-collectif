<?php

namespace Capco\Tests\EventListener;

use Capco\Tests\IdentityWebTestCase;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises HTTP outcomes and real domain data with transactional cleanup; replaces only external boundaries.
 */
final class EmptyUsernameListenerTest extends IdentityWebTestCase
{
    public function testMissingUsernameShowsPromptOnOrdinaryPagesButAllowsGraphql(): void
    {
        $user = $this->account();
        $this->setFeature('server_side_rendering', false);
        $this->login($user->getEmail());
        $user = $this->reload($user->getId());
        $user->setUsername('');
        $this->em->flush();
        $this->browser->loginUser($user);

        $this->browser->request('GET', '/profile/edit-profile');

        self::assertSame(200, $this->browser->getResponse()->getStatusCode(), substr((string) $this->browser->getResponse()->getContent(), 0, 2000));
        self::assertStringContainsString('ChooseAUsernameApp', (string) $this->browser->getResponse()->getContent());
        $viewer = $this->graphql('{ viewer { username } }');
        self::assertSame('', $viewer['viewer']['username']);
    }

    /** @dataProvider ordinaryPageViewers */
    public function testOrdinaryPagesDoNotPromptAnonymousOrNamedViewers(bool $authenticated, int $status): void
    {
        $this->setFeature('server_side_rendering', false);
        if ($authenticated) {
            $this->login($this->account()->getEmail());
        }

        $this->browser->request('GET', '/profile/edit-profile');

        self::assertSame($status, $this->browser->getResponse()->getStatusCode(), substr((string) $this->browser->getResponse()->getContent(), 0, 2000));
        self::assertStringNotContainsString('ChooseAUsernameApp', (string) $this->browser->getResponse()->getContent());
    }

    /** @return iterable<string, array{bool, int}> */
    public static function ordinaryPageViewers(): iterable
    {
        yield 'anonymous viewer is redirected to login' => [false, 302];
        yield 'named viewer can edit their profile' => [true, 200];
    }
}
