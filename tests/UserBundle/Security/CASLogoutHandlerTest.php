<?php

namespace Capco\Tests\UserBundle\Security;

use Capco\Tests\IdentityWebTestCase;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises HTTP outcomes and real domain data with transactional cleanup; replaces only external boundaries.
 */
final class CASLogoutHandlerTest extends IdentityWebTestCase
{
    /** @dataProvider featureStates */
    public function testLogoutRemovesLocalAuthenticationAndCallsCasOnlyWhenEnabled(bool $enabled): void
    {
        $configuration = $this->em->getRepository(\Capco\AppBundle\Entity\SSO\CASSSOConfiguration::class)->findOneBy([]) ?? new \Capco\AppBundle\Entity\SSO\CASSSOConfiguration();
        $configuration->setEnabled(true);
        $this->em->persist($configuration);
        $this->em->flush();
        $this->setFeature('login_cas', $enabled);
        $cas = $this->createMock(\Capco\UserBundle\Handler\CasHandler::class);
        $cas->expects($enabled ? self::once() : self::never())->method('logout')->with('/');
        self::getContainer()->set(\Capco\UserBundle\Handler\CasHandler::class, $cas);
        $this->login($this->account()->getEmail());
        $this->browser->request('GET', '/logout', [], [], ['HTTP_REFERER' => '/']);
        self::assertSame('/', $this->browser->getResponse()->headers->get('Location'));
        $this->assertViewer(false);
    }

    /** @return iterable<string, array{bool}> */
    public static function featureStates(): iterable
    {
        yield 'CAS enabled' => [true];
        yield 'CAS disabled' => [false];
    }
}
