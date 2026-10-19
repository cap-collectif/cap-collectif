<?php

namespace Capco\Tests\Controller\Site;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\SSO\Oauth2SSOConfiguration;
use Capco\AppBundle\Toggle\Manager;
use Capco\Tests\FeatureFlags\FeatureFlagsAwareTest;
use Capco\Tests\FeatureFlags\FeatureFlagsTrait;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Request;

/**
 * @internal
 * @coversNothing
 * @phpunit-status non-compliant
 * @phpunit-reason Checks the private Symfony security session target-path key rather than proving the
 * destination through the HTTP login flow.
 */
final class SSOControllerTest extends WebTestCase implements FeatureFlagsAwareTest
{
    use FeatureFlagsTrait;

    private KernelBrowser $client;
    private bool $providerWasEnabled;

    protected function setUp(): void
    {
        $this->client = self::createClient();

        $configuration = $this->getOauth2Configuration();
        $this->providerWasEnabled = $configuration->isEnabled();
        $configuration->setEnabled(true);
        self::getContainer()->get(EntityManagerInterface::class)->flush();

        self::getContainer()
            ->get(RedisCache::class)
            ->deleteItem('SSOConfiguration - openid')
        ;
    }

    protected function tearDown(): void
    {
        $configuration = $this->getOauth2Configuration();
        $configuration->setEnabled($this->providerWasEnabled);
        self::getContainer()->get(EntityManagerInterface::class)->flush();
        self::getContainer()
            ->get(RedisCache::class)
            ->deleteItem('SSOConfiguration - openid')
        ;

        parent::tearDown();
    }

    public static function featureFlagOverrides(): array
    {
        return [Manager::login_openid => true];
    }

    /**
     * @runInSeparateProcess
     * @preserveGlobalState disabled
     */
    public function testOpenidLoginRedirectsToTheConfiguredProviderAndPreservesDestination(): void
    {
        $this->client->request(Request::METHOD_GET, '/login/openid?_destination=https://capco.test/');

        $response = $this->client->getResponse();
        self::assertSame(302, $response->getStatusCode());

        $location = $response->headers->get('Location');
        self::assertNotNull($location);
        self::assertStringStartsWith($this->getOauth2Configuration()->getAuthorizationUrl(), $location);

        $query = [];
        parse_str((string) parse_url($location, \PHP_URL_QUERY), $query);
        self::assertArrayHasKey('redirect_uri', $query);
        self::assertSame('/login/check-openid', parse_url($query['redirect_uri'], \PHP_URL_PATH));
        self::assertSame(
            'https://capco.test/',
            $this->client->getRequest()->getSession()->get('_security.main.target_path')
        );
    }

    private function getOauth2Configuration(): Oauth2SSOConfiguration
    {
        $configuration = self::getContainer()
            ->get(EntityManagerInterface::class)
            ->getRepository(Oauth2SSOConfiguration::class)
            ->find('ssoOauth2')
        ;

        self::assertInstanceOf(Oauth2SSOConfiguration::class, $configuration);

        return $configuration;
    }
}
