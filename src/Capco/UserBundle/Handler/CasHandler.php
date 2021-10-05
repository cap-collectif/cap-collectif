<?php

namespace Capco\UserBundle\Handler;

use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ContainerBagInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use phpCAS;

/**
 * Used for any case server manipulation.
 *
 * Class CasHandler
 */
class CasHandler
{
    private SessionInterface $session;
    private ContainerBagInterface $params;
    private LoggerInterface $logger;
    private string $environment;

    public function __construct(
        SessionInterface $session,
        ContainerBagInterface $params,
        LoggerInterface $logger,
        string $environment
    ) {
        $this->session = $session;
        $this->params = $params;
        $this->logger = $logger;
        $this->environment = $environment;
    }

    /**
     * build connection to CAS server and login user.
     */
    public function login(string $destination): Response
    {
        $this->setupLogging();
        $this->initializeClient();

        if ('dev' === $this->environment) {
            // THIS SETTING IS NOT RECOMMENDED FOR PRODUCTION.
            // VALIDATING THE CAS SERVER IS CRUCIAL TO THE SECURITY OF THE CAS PROTOCOL!
            phpCAS::setNoCasServerValidation();
        } else {
            // Set the certificate of the CAS server CA and if the CN should be properly verified, Example: certificate path (/path/to/vtca_cachain.pem)
            phpCAS::setCasServerCACert($this->params->get('cas_certificate_file'));
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
        // Initialize phpCAS
        phpCAS::client(
            CAS_VERSION_2_0,
            $this->params->get('cas_host'),
            (int) $this->params->get('cas_port'),
            $this->params->get('cas_context')
        );
    }
}
