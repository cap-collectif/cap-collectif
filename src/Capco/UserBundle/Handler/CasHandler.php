<?php

namespace Capco\UserBundle\Handler;

use Capco\AppBundle\Entity\SSO\CASSSOConfiguration;
use Capco\AppBundle\Repository\CASSSOConfigurationRepository;
use phpCAS;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\SessionInterface;

/**
 * Used for any case server manipulation.
 *
 * Class CasHandler
 */
class CasHandler
{
    private readonly ?CASSSOConfiguration $configuration;

    public function __construct(
        private readonly SessionInterface $session,
        private readonly LoggerInterface $logger,
        CASSSOConfigurationRepository $repository,
        private readonly string $environment
    ) {
        $this->configuration = $repository->findOneBy([]);
    }

    /**
     * build connection to CAS server and login user.
     */
    public function login(string $destination): Response
    {
        $this->setupLogging();
        $this->initializeClient();

        if ('dev' === $this->environment || 'test' === $this->environment) {
            // THIS SETTING IS NOT RECOMMENDED FOR PRODUCTION.
            // VALIDATING THE CAS SERVER IS CRUCIAL TO THE SECURITY OF THE CAS PROTOCOL!
            phpCAS::setNoCasServerValidation();
        } else {
            // Set the certificate of the CAS server CA and if the CN should be properly verified, Example: certificate path (/path/to/vtca_cachain.pem)
            phpCAS::setCasServerCACert($this->getConfiguration()->getCasCertificateFile());
        }

        // Check CAS authentication
        $auth = phpCAS::checkAuthentication();
        if (!$auth) {
            // Force CAS authentication
            phpCAS::forceAuthentication();
        }

        // Get returned attributes by CAS server, not used as specified at time of code writing !
        // $attributes = phpCAS::getAttributes();

        // Put returned login in session for reuse in authentication process
        $this->session->set('cas_login', phpCAS::getUser());

        // Redirect to given destination
        return $this->redirect($destination);
    }

    /**
     * build connection to cas server and logout user.
     */
    public function logout(string $destination): void
    {
        $this->setupLogging();
        $this->initializeClient();

        // Clear session, disconnect user from application
        $this->session->clear();

        // Logout from CAS server, disconnect user from CAS server and redirect to given destination
        phpCAS::logoutWithRedirectService($destination);
    }

    protected function redirect(string $url, int $status = 302): Response
    {
        return new RedirectResponse($url, $status);
    }

    private function setupLogging(): void
    {
        if ('dev' === $this->environment) {
            // Enable debugging for dev environment only
            phpCAS::setLogger($this->logger);
            // Enable verbose error messages. Disable it in production!
            phpCAS::setVerbose(true);
        }
    }

    private function initializeClient(): void
    {
        $serverURL = $this->getServerUrlParts();

        // Initialize phpCAS
        phpCAS::client(
            $this->getVersion(),
            $serverURL['host'],
            (int) $serverURL['port'],
            $serverURL['path']
        );
    }

    private function getVersion(): string
    {
        $versions = [
            1 => CAS_VERSION_1_0,
            2 => CAS_VERSION_2_0,
            3 => CAS_VERSION_3_0,
        ];

        return $versions[$this->getConfiguration()->getCasVersion()];
    }

    private function getServerUrlParts(): array
    {
        $serverUrl = $this->getConfiguration()->getCasServerUrl();
        $defaultPort = 'https' === parse_url($serverUrl, \PHP_URL_SCHEME) ? 443 : 80;

        return [
            'host' => parse_url($serverUrl, \PHP_URL_HOST),
            'port' => parse_url($serverUrl, \PHP_URL_PORT) ?? $defaultPort,
            'path' => parse_url($serverUrl, \PHP_URL_PATH),
        ];
    }

    private function getConfiguration(): CASSSOConfiguration
    {
        if (null === $this->configuration) {
            throw new \RuntimeException(self::class . ' : configuration not found');
        }

        return $this->configuration;
    }
}
