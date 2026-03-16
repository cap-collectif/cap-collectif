<?php

namespace Capco\Tests\Authentication\FranceConnect;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\SSO\FranceConnectSSOConfiguration;
use Capco\AppBundle\Repository\FranceConnectSSOConfigurationRepository;
use Capco\UserBundle\FranceConnect\FranceConnectOptionsModifier;
use Capco\UserBundle\FranceConnect\FranceConnectResourceOwner;
use Capco\UserBundle\Hwi\FeatureChecker;
use Capco\UserBundle\Jwt\Jwt;
use Http\Client\Common\HttpMethodsClientInterface;
use HWI\Bundle\OAuthBundle\OAuth\RequestDataStorageInterface;
use HWI\Bundle\OAuthBundle\OAuth\ResourceOwnerInterface;
use HWI\Bundle\OAuthBundle\OAuth\Response\UserResponseInterface;
use PHPUnit\Framework\MockObject\Exception as MockException;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Http\Message\ResponseInterface;
use Psr\Log\LoggerInterface;
use stdClass;
use Symfony\Component\Cache\CacheItem;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\HttpUtils;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @internal
 * @coversNothing
 */
final class FranceConnectResourceOwnerTest extends TestCase
{
    private HttpMethodsClientInterface|MockObject $httpClientMock;
    private HttpUtils|MockObject $httpUtilsMock;
    private FranceConnectOptionsModifier|MockObject $optionsModifierMock;
    private RequestDataStorageInterface|MockObject $storageMock;
    private RequestStack|MockObject $requestStackMock;
    private RedisCache|MockObject $redisCacheMock;
    private FeatureChecker|MockObject $featureCheckerMock;
    private TranslatorInterface|MockObject $translatorMock;
    private LoggerInterface|MockObject $loggerMock;
    private FranceConnectResourceOwner $franceConnectResourceOwner;
    private FranceConnectSSOConfigurationRepository|MockObject $repositoryMock;
    private SessionInterface|MockObject $sessionMock;
    private Jwt|MockObject $jwtMock;
    /**
     * @var array<string, mixed>
     */
    private array $options = [
        'access_token_url' => '',
        'authorization_url' => '',
        'client_id' => '',
        'client_secret' => '',
        'infos_url' => '',
        'logout_url' => '',
    ];

    /**
     * @throws MockException
     */
    protected function setUp(): void
    {
        $this->httpClientMock = $this->createMock(HttpMethodsClientInterface::class);
        $this->httpUtilsMock = $this->createMock(HttpUtils::class);
        $this->optionsModifierMock = $this->createMock(FranceConnectOptionsModifier::class);
        $this->storageMock = $this->createMock(RequestDataStorageInterface::class);
        $this->requestStackMock = $this->createMock(RequestStack::class);
        $this->redisCacheMock = $this->createMock(RedisCache::class);
        $this->featureCheckerMock = $this->createMock(FeatureChecker::class);
        $this->translatorMock = $this->createMock(TranslatorInterface::class);
        $this->loggerMock = $this->createMock(LoggerInterface::class);
        $this->repositoryMock = $this->createMock(FranceConnectSSOConfigurationRepository::class);
        $this->sessionMock = $this->createMock(SessionInterface::class);
        $this->jwtMock = $this->createMock(Jwt::class);

        $this->optionsModifierMock->expects($this->once())->method('modifyOptions')->withAnyParameters()->willReturn($this->options);

        $this->franceConnectResourceOwner = new FranceConnectResourceOwner(
            $this->httpClientMock,
            $this->httpUtilsMock,
            $this->options,
            'name',
            $this->storageMock,
            $this->requestStackMock,
            $this->redisCacheMock,
            $this->optionsModifierMock,
            $this->featureCheckerMock,
            $this->translatorMock,
            $this->loggerMock,
            $this->repositoryMock,
            $this->jwtMock
        );
    }

    /**
     * @covers \FranceConnectResourceOwner::__construct
     */
    public function testInitializable(): void
    {
        $this->assertInstanceOf(FranceConnectResourceOwner::class, $this->franceConnectResourceOwner);
    }

    /**
     * @covers \FranceConnectResourceOwner::getScope
     */
    public function testUsesConfiguredScope(): void
    {
        $this->optionsModifierMock->expects($this->once())->method('getAllowedData')->willReturn(['given_name', 'family_name', 'birthplace']);

        $this->assertSame(
            'openid given_name family_name birthplace',
            $this->franceConnectResourceOwner->getScope()
        );
    }

    /**
     * @covers \FranceConnectResourceOwner::getAuthorizationUrl
     */
    public function testGeneratesNonceIfItIsNotFoundInStorage(): void
    {
        $this->featureCheckerMock->expects($this->once())->method('isServiceEnabled')->with('franceconnect')->willReturn(true);
        $cacheItem = new CacheItem();
        $this->redisCacheMock->expects($this->once())->method('getItem')->with(FranceConnectOptionsModifier::REDIS_FRANCE_CONNECT_TOKENS_CACHE_KEY . '-1')->willReturn($cacheItem);
        $this->sessionMock->expects($this->once())->method('getId')->willReturn('1');
        $this->requestStackMock->expects($this->once())->method('getSession')->willReturn($this->sessionMock);

        $this->assertMatchesRegularExpression(
            '/nonce=[a-zA-Z0-9]+/',
            $this->franceConnectResourceOwner->getAuthorizationUrl('redirectUri')
        );
    }

    /**
     * @covers \FranceConnectResourceOwner::getUserInformation
     */
    public function testGetUserInformationV2(): void
    {
        $fcConfiguration = new FranceConnectSSOConfiguration();
        $fcConfiguration->setId(1);
        $fcConfiguration->setEmail('test@cap-collectif.com');
        $fcConfiguration->setUseV2(true);
        $fcConfiguration->setEnvironment('TESTING');

        $this->repositoryMock->expects($this->once())->method('find')->willReturn($fcConfiguration);

        $responseMock = $this->createMock(ResponseInterface::class);
        $responseMock->method('getStatusCode')->willReturn(200);
        $responseMock->method('getBody')->willReturn('mock_response_token');

        $this->httpClientMock->expects($this->once())
            ->method('send')
            ->with(
                'GET',
                '',
                [
                    'Authorization' => 'Bearer mocked_access_token',
                    'Content-Type' => 'application/x-www-form-urlencoded',
                    'User-Agent' => 'HWIOAuthBundle (https://github.com/hwi/HWIOAuthBundle)',
                ],
                ''
            )
            ->willReturn($responseMock)
        ;

        $this->jwtMock->expects($this->once())
            ->method('decode')
            ->willReturn(new stdClass())
        ;

        $userInformation = $this->franceConnectResourceOwner->getUserInformation(['access_token' => 'mocked_access_token']);

        self::assertInstanceOf(UserResponseInterface::class, $userInformation);
        self::assertInstanceOf(ResourceOwnerInterface::class, $userInformation->getResourceOwner());
        self::assertEquals('mocked_access_token', $userInformation->getOAuthToken()->getAccessToken());
        self::assertEquals([], $userInformation->getData());
    }

    /**
     * @covers \Capco\UserBundle\FranceConnect\FranceConnectResourceOwner::checkSignature
     */
    public function testCheckSignatureConvertsUnexpectedJwtErrorsToAuthenticationException(): void
    {
        $fcConfiguration = new FranceConnectSSOConfiguration();
        $fcConfiguration->setUseV2(true);
        $fcConfiguration->setEnvironment('TESTING');
        $fcConfiguration->setAuthorizationUrl('https://fcp-low.sbx.dev-franceconnect.fr/api/v2/authorize');

        $this->jwtMock->expects($this->once())
            ->method('decode')
            ->willThrowException(new \RuntimeException('Unknown kid'))
        ;
        $this->loggerMock->expects($this->once())
            ->method('error')
            ->with(
                'FranceConnect token verification failed.',
                $this->callback(static fn (array $context): bool => isset($context['exception']))
            )
        ;

        $this->expectException(AuthenticationException::class);
        $this->expectExceptionMessage('FranceConnect token verification failed.');

        $this->franceConnectResourceOwner->checkSignature('mock-token', $fcConfiguration);
    }
}
