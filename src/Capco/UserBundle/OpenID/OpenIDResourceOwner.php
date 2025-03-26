<?php

namespace Capco\UserBundle\OpenID;

use Capco\AppBundle\Helper\EnvHelper;
use Capco\UserBundle\Hwi\FeatureChecker;
use Capco\UserBundle\Hwi\OptionsModifierInterface;
use Capco\UserBundle\Security\JWT;
use HWI\Bundle\OAuthBundle\OAuth\RequestDataStorageInterface;
use HWI\Bundle\OAuthBundle\OAuth\ResourceOwner\GenericOAuth2ResourceOwner;
use HWI\Bundle\OAuthBundle\OAuth\Response\UserResponseInterface;
use HWI\Bundle\OAuthBundle\OAuth\State\State;
use HWI\Bundle\OAuthBundle\Security\Core\Authentication\Token\OAuthToken;
use Psr\Log\LoggerInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\HttpUtils;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

class OpenIDResourceOwner extends GenericOAuth2ResourceOwner
{
    /**
     * @var array<string, string>
     */
    protected array $paths = [
        'identifier' => 'sub',
    ];

    private ?string $instanceName = null;

    public function __construct(
        HttpClientInterface $hwiHttpClient,
        HttpUtils $httpUtils,
        array $options,
        string $name,
        RequestDataStorageInterface $hwiStorage,
        OptionsModifierInterface $optionsModifier,
        private readonly FeatureChecker $featureChecker,
        private readonly LoggerInterface $logger
    ) {
        $this->httpClient = $hwiHttpClient;
        $this->httpUtils = $httpUtils;
        $this->name = $name;
        $this->storage = $hwiStorage;

        $options = $optionsModifier->modifyOptions($options, $this);
        if (!empty($options['paths'])) {
            $this->addPaths($options['paths']);
        }
        unset($options['paths']);

        if (!empty($options['options'])) {
            $options += $options['options'];
            unset($options['options']);
        }
        unset($options['options']);

        // Resolve merged options
        $resolver = new OptionsResolver();
        $this->configureOptions($resolver);
        $this->options = $resolver->resolve($options);

        $this->state = new State($this->options['state'] ?: null);

        $this->configure();
    }

    // TODO: please save this configuration in BO instead.
    public function isRefreshingUserInformationsAtEveryLogin(): bool
    {
        return match ($this->getInstanceName()) {
            'occitanie', 'occitanie-dedicated' => true,
            default => false,
        };
    }

    // TODO: please save this configuration in BO instead.
    public function isUsingAuthorizationHeaderToGetAccessToken(): bool
    {
        return match ($this->getInstanceName()) {
            'pe', 'parlons-energies' => true,
            default => false,
        };
    }

    // TODO: please save this configuration in BO instead.
    public function getScope(): string
    {
        return match ($this->getInstanceName()) {
            'carpentras' => 'openid email family_name given_name',
            'pe', 'parlons-energies' => 'openid email givenName',
            default => 'openid email profile',
        };
    }

    public function getUserInformation(
        array $accessToken,
        array $extraParameters = []
    ): UserResponseInterface {
        $this->paths = (new OpenIDPathMapper(
            EnvHelper::get('SYMFONY_INSTANCE_NAME')
        ))->getOpenIDMapping();

        $content = JWT::getPayloadFromJWT($accessToken['access_token']);

        if (null === $content && $this->options['use_bearer_authorization']) {
            $content = $this->httpRequest(
                $this->normalizeUrl($this->options['infos_url'], $extraParameters),
                null,
                ['Authorization' => 'Bearer ' . $accessToken['access_token']]
            );
        }

        if (null === $content) {
            $content = $this->doGetUserInformationRequest(
                $this->normalizeUrl(
                    $this->options['infos_url'],
                    array_merge([$this->options['attr_name'] => $accessToken['access_token']], $extraParameters)
                )
            );
        }

        $response = $this->getUserResponse();
        $response->setData($content instanceof ResponseInterface ? $content->getContent() : $content);
        $response->setResourceOwner($this);
        $response->setOAuthToken(new OAuthToken($accessToken));

        return $response;
    }

    public function getAuthorizationUrl($redirectUri, array $extraParameters = []): string
    {
        if (!$this->featureChecker->isServiceEnabled('openid')) {
            $message = 'Openid is not enabled';
            $this->logger->error($message);

            throw new AuthenticationException($message);
        }

        switch ($this->getInstanceName()) {
            case 'pe':
            case 'parlons-energies':
                $extraParameters = array_merge($extraParameters, [
                    'acr_values' => 'sesameEDF',
                ]);

                break;

            default:
                break;
        }

        return parent::getAuthorizationUrl($redirectUri, $extraParameters);
    }

    protected function configureOptions(OptionsResolver $resolver): void
    {
        parent::configureOptions($resolver);
        $scope = $this->getScope();

        match ($this->getInstanceName()) {
            'carpentras', 'debatpenly', 'debateauidf', 'debatdsf',
            'participer-debat-lithium', 'participer-debat-gravelines',
            'participer-debat-fessenheim', 'participer-debat-bugey', 'participer-debat-fos' => $resolver
                ->setDefaults([
                    'state' => null,
                    'csrf' => true,
                    'scope' => $scope,
                ])
                ->setRequired('logout_url'),
            'pe', 'parlons-energies' => $resolver
                ->setDefaults([
                    'scope' => $scope,
                    'state' => null,
                    'csrf' => true,
                    'nonce' => $this->generateNonce(),
                ])
                ->setRequired('logout_url'),
            default => $resolver
                ->setDefaults([
                    'scope' => $scope,
                ])
                ->setRequired('logout_url'),
        };
    }

    protected function doGetTokenRequest($url, array $parameters = []): ResponseInterface
    {
        $headers = [];

        $parameters['client_id'] = $this->options['client_id'];
        $parameters['client_secret'] = $this->options['client_secret'];

        if ($this->isUsingAuthorizationHeaderToGetAccessToken()) {
            $headers['Authorization'] =
                'Basic ' .
                base64_encode($this->options['client_id'] . ':' . $this->options['client_secret']);
            unset($parameters['client_id'], $parameters['client_secret']);
        }

        return $this->httpRequest(
            $url,
            http_build_query($parameters, '', '&', \PHP_QUERY_RFC3986),
            $headers
        );
    }

    private function getInstanceName(): string
    {
        if (!$this->instanceName) {
            $this->instanceName = EnvHelper::get('SYMFONY_INSTANCE_NAME');
        }

        return $this->instanceName;
    }

    private function generateNonce(): string
    {
        return md5(microtime(true) . uniqid('', true));
    }
}
