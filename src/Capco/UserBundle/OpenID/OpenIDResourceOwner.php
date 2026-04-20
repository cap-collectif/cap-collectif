<?php

namespace Capco\UserBundle\OpenID;

use Capco\AppBundle\Helper\EnvHelper;
use Capco\UserBundle\Hwi\FeatureChecker;
use Capco\UserBundle\Hwi\OptionsModifierInterface;
use Capco\UserBundle\Security\JWT;
use Http\Client\Common\HttpMethodsClientInterface;
use HWI\Bundle\OAuthBundle\OAuth\RequestDataStorageInterface;
use HWI\Bundle\OAuthBundle\OAuth\ResourceOwner\GenericOAuth2ResourceOwner;
use HWI\Bundle\OAuthBundle\OAuth\Response\UserResponseInterface;
use HWI\Bundle\OAuthBundle\OAuth\State\State;
use HWI\Bundle\OAuthBundle\Security\Core\Authentication\Token\OAuthToken;
use Psr\Http\Message\ResponseInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\HttpUtils;

class OpenIDResourceOwner extends GenericOAuth2ResourceOwner
{
    protected $paths = [
        'identifier' => 'sub',
    ];

    private ?string $instanceName = null;

    public function __construct(
        HttpMethodsClientInterface $hwiHttpClient,
        HttpUtils $httpUtils,
        array $options,
        string $name,
        RequestDataStorageInterface $hwiStorage,
        OptionsModifierInterface $optionsModifier,
        private readonly FeatureChecker $featureChecker,
        private readonly LoggerInterface $logger
    ) {
        parent::__construct($hwiHttpClient, $httpUtils, $options, $name, $hwiStorage);

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
            'occitanie', 'occitanie-dedicated', 'occitanie-preprod', 'catp', 'cd59' => true,
            default => false,
        };
    }

    // TODO: please save this configuration in BO instead.
    public function isUsingAuthorizationHeaderToGetAccessToken(): bool
    {
        return match ($this->getInstanceName()) {
            'pe', 'parlons-energies', 'catp' => true,
            default => false,
        };
    }

    // TODO: please save this configuration in BO instead.
    public function getScope(): string
    {
        return match ($this->getInstanceName()) {
            'carpentras' => 'openid email family_name given_name',
            'catp' => 'openid profile user-id user-ca',
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

        $resolvedAccessToken = $this->resolveAccessToken($accessToken);
        $content = isset($accessToken['id_token'])
            ? $this->resolveTokenPayload($accessToken)
            : JWT::getPayloadFromJWT($accessToken['access_token']);

        if (null === $content && $this->options['use_bearer_authorization'] && null !== $resolvedAccessToken) {
            $content = $this->httpRequest(
                $this->normalizeUrl($this->options['infos_url'], $extraParameters),
                null,
                ['Authorization' => 'Bearer ' . $resolvedAccessToken]
            );
        }

        if (null === $content && null !== $resolvedAccessToken) {
            $content = $this->doGetUserInformationRequest(
                $this->normalizeUrl(
                    $this->options['infos_url'],
                    array_merge([$this->options['attr_name'] => $resolvedAccessToken], $extraParameters)
                )
            );
        }

        $response = $this->getUserResponse();
        $response->setData($content instanceof ResponseInterface ? $content->getBody() : $content);
        $response->setResourceOwner($this);
        $responseToken = $accessToken;
        if (null !== $resolvedAccessToken) {
            $responseToken['access_token'] = $resolvedAccessToken;
        }
        $response->setOAuthToken(new OAuthToken($responseToken));

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

    /**
     * @param array{access_token?: string, id_token?: string} $accessToken
     */
    public function resolveAccessToken(array $accessToken): ?string
    {
        $tokenField = $this->getTokenField($accessToken);

        return null !== $tokenField ? $accessToken[$tokenField] : null;
    }

    protected function configureOptions(OptionsResolver $resolver): void
    {
        parent::configureOptions($resolver);
        $scope = $this->getScope();

        match ($this->getInstanceName()) {
            'carpentras', 'catp', 'debatpenly', 'debateauidf', 'debatdsf',
            'participer-debat-lithium', 'participer-debat-gravelines',
            'participer-debat-fessenheim', 'participer-debat-bugey',
            'participer-debat-fos', 'rte-cndp', 'pngmdr', 'newlceo-cndp' => $resolver
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

    /**
     * @param array{access_token?: string, id_token?: string} $accessToken
     */
    private function getTokenField(array $accessToken): ?string
    {
        if (isset($accessToken['id_token'])) {
            return 'id_token';
        }

        if (isset($accessToken['access_token'])) {
            return 'access_token';
        }

        return null;
    }

    private function generateNonce(): string
    {
        return md5(microtime(true) . uniqid('', true));
    }

    /**
     * @param array{access_token?: string, id_token?: string} $accessToken
     *
     * @return null|array<string, null|scalar>
     */
    private function resolveTokenPayload(array $accessToken): ?array
    {
        $content = $this->decodeJwtPayload($accessToken['access_token'] ?? null);
        $idTokenPayload = $this->decodeJwtPayload($accessToken['id_token'] ?? null);

        if (null === $idTokenPayload) {
            return $content;
        }

        return $this->mergeMissingClaims($content, $idTokenPayload);
    }

    /**
     * @return null|array<string, null|scalar>
     */
    private function decodeJwtPayload(?string $token): ?array
    {
        if (null === $token || '' === $token) {
            return null;
        }

        return JWT::getPayloadFromJWT($token);
    }

    /**
     * @param null|array<string, null|scalar> $content
     * @param array<string, null|scalar>      $fallbackClaims
     *
     * @return array<string, null|scalar>
     */
    private function mergeMissingClaims(?array $content, array $fallbackClaims): array
    {
        $mergedClaims = $content ?? [];

        foreach ($fallbackClaims as $claim => $value) {
            if (!\array_key_exists($claim, $mergedClaims) || null === $mergedClaims[$claim] || '' === $mergedClaims[$claim]) {
                $mergedClaims[$claim] = $value;
            }
        }

        return $mergedClaims;
    }
}
