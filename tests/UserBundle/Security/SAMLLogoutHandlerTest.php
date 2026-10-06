<?php

declare(strict_types=1);

namespace Capco\Tests\UserBundle\Security;

use Capco\Tests\SamlWebTestCase;
use SimpleSAML\Auth\Simple;
use SimpleSAML\Configuration;
use SimpleSAML\Session;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Observes local logout over HTTP and the external IdP logout destination using a transient SimpleSAML session.
 */
final class SAMLLogoutHandlerTest extends SamlWebTestCase
{
    /** @dataProvider featureStates */
    public function testLogoutClearsTheLocalSessionAndContactsTheIdpOnlyWhenEnabled(bool $enabled): void
    {
        // The library's cleanup runs normally, with a transient session that never writes provider data.
        Configuration::setPreLoadedConfig(Configuration::loadFromArray(['baseurlpath' => 'https://saml-provider.test/', 'secretsalt' => 'test-only-saml-secret', 'session.phpsession.cookiename' => 'SAMLContract']));
        Session::useTransientSession();
        $account = $this->account();
        $id = $account->getId();
        $email = $account->getEmail();
        $password = $account->getPassword();
        $client = $this->createMock(Simple::class);
        $client->expects($enabled ? self::once() : self::never())->method('logout')->with('/projects');
        $this->setSamlClient($client);
        $this->setFeature('login_saml', $enabled);
        $this->browser->loginUser($account);
        $session = self::getContainer()->get('session');
        $session->set('saml-contract-marker', 'private session data');
        $session->save();
        $oldSessionId = $session->getId();
        $this->assertViewer(true, $id);

        $this->browser->request('GET', '/logout', [], [], ['HTTP_REFERER' => '/projects']);

        self::assertSame(302, $this->browser->getResponse()->getStatusCode());
        self::assertSame('/projects', $this->browser->getResponse()->headers->get('Location'));
        self::assertNull($this->browser->getRequest()->getSession()->get('saml-contract-marker'));
        $this->assertViewer(false);
        // Replaying the pre-logout cookie cannot restore authentication or private session data.
        $this->browser->getCookieJar()->set(new \Symfony\Component\BrowserKit\Cookie($session->getName(), $oldSessionId));
        $this->assertViewer(false);
        self::assertNull($this->browser->getRequest()->getSession()->get('saml-contract-marker'));
        $account = $this->reload($id);
        self::assertSame($email, $account->getEmail());
        self::assertSame($password, $account->getPassword());
    }

    /** @return iterable<string, array{bool}> */
    public static function featureStates(): iterable
    {
        yield 'SAML enabled' => [true];
        yield 'SAML disabled' => [false];
    }
}
