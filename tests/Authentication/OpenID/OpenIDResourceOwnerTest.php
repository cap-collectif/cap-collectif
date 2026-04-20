<?php

namespace Capco\Tests\Authentication\OpenID;

use Capco\UserBundle\Hwi\FeatureChecker;
use Capco\UserBundle\Hwi\OptionsModifierInterface;
use Capco\UserBundle\OpenID\OpenIDResourceOwner;
use GuzzleHttp\Psr7\HttpFactory;
use Http\Client\Common\HttpMethodsClient;
use HWI\Bundle\OAuthBundle\OAuth\RequestDataStorageInterface;
use HWI\Bundle\OAuthBundle\OAuth\ResourceOwnerInterface;
use HWI\Bundle\OAuthBundle\OAuth\Response\UserResponseInterface;
use PHPUnit\Framework\MockObject\Exception as MockException;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Http\Client\ClientInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Security\Http\HttpUtils;

/**
 * @internal
 * @coversNothing
 */
final class OpenIDResourceOwnerTest extends TestCase
{
    private ClientInterface & MockObject $httpClientMock;
    private HttpUtils & MockObject $httpUtilsMock;
    private OptionsModifierInterface & MockObject $optionsModifierMock;
    private RequestDataStorageInterface & MockObject $storageMock;
    private FeatureChecker & MockObject $featureCheckerMock;
    private LoggerInterface & MockObject $loggerMock;
    private OpenIDResourceOwner $openIDResourceOwner;
    private string|false $previousInstanceName;

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
        $this->previousInstanceName = getenv('SYMFONY_INSTANCE_NAME');

        $this->httpClientMock = $this->createMock(ClientInterface::class);
        $this->httpUtilsMock = $this->createMock(HttpUtils::class);
        $this->optionsModifierMock = $this->createMock(OptionsModifierInterface::class);
        $this->storageMock = $this->createMock(RequestDataStorageInterface::class);
        $this->featureCheckerMock = $this->createMock(FeatureChecker::class);
        $this->loggerMock = $this->createMock(LoggerInterface::class);

        $this->optionsModifierMock->method('modifyOptions')
            ->withAnyParameters()
            ->willReturn($this->options)
        ;

        $this->openIDResourceOwner = $this->createOpenIDResourceOwner('catp');
    }

    protected function tearDown(): void
    {
        if (false === $this->previousInstanceName) {
            putenv('SYMFONY_INSTANCE_NAME');
        } else {
            putenv('SYMFONY_INSTANCE_NAME=' . $this->previousInstanceName);
        }
    }

    /**
     * @covers \Capco\UserBundle\OpenID\OpenIDResourceOwner::getUserInformation
     */
    public function testGetUserInformationCompletesMissingClaimsWithIdTokenPayload(): void
    {
        $this->httpClientMock->expects($this->never())->method('sendRequest');

        $userInformation = $this->openIDResourceOwner->getUserInformation([
            'access_token' => $this->generateJwt([
                'sub' => 'openid_id',
                'given_name' => 'Jean',
            ]),
            'id_token' => $this->generateJwt([
                'sub' => 'openid_id',
                'given_name' => 'Jeanne',
                'family_name' => 'Michel',
                'other email' => 'jean.michel+other@ca-ts.fr',
            ]),
        ]);

        self::assertInstanceOf(UserResponseInterface::class, $userInformation);
        self::assertInstanceOf(ResourceOwnerInterface::class, $userInformation->getResourceOwner());
        self::assertSame('Jean', $userInformation->getData()['given_name']);
        self::assertSame('Michel', $userInformation->getData()['family_name']);
        self::assertSame('jean.michel+other@ca-ts.fr', $userInformation->getData()['other email']);
    }

    /**
     * @covers \Capco\UserBundle\OpenID\OpenIDResourceOwner::getUserInformation
     */
    public function testGetUserInformationCompletesMissingClaimsWithIdTokenOutsideCatp(): void
    {
        $resourceOwner = $this->createOpenIDResourceOwner('capco');

        $this->httpClientMock->expects($this->never())->method('sendRequest');

        $userInformation = $resourceOwner->getUserInformation([
            'access_token' => $this->generateJwt([
                'sub' => 'openid_id',
                'given_name' => 'Jean',
            ]),
            'id_token' => $this->generateJwt([
                'sub' => 'openid_id',
                'given_name' => 'Jeanne',
                'family_name' => 'Michel',
                'other email' => 'jean.michel+other@ca-ts.fr',
            ]),
        ]);

        self::assertSame('Jean', $userInformation->getData()['given_name']);
        self::assertSame('Michel', $userInformation->getData()['family_name']);
        self::assertSame('jean.michel+other@ca-ts.fr', $userInformation->getData()['other email']);
    }

    /**
     * @covers \Capco\UserBundle\OpenID\OpenIDResourceOwner::getUserInformation
     */
    public function testGetUserInformationUsesIdTokenWhenAccessTokenIsOpaque(): void
    {
        $this->httpClientMock->expects($this->never())->method('sendRequest');

        $idToken = $this->generateJwt([
            'sub' => 'openid_id',
            'other email' => 'jean.michel+other@ca-ts.fr',
        ]);
        $userInformation = $this->openIDResourceOwner->getUserInformation([
            'access_token' => 'opaque-access-token',
            'id_token' => $idToken,
        ]);

        self::assertSame('openid_id', $userInformation->getData()['sub']);
        self::assertSame('jean.michel+other@ca-ts.fr', $userInformation->getData()['other email']);
        self::assertSame($idToken, $userInformation->getAccessToken());
    }

    /**
     * @covers \Capco\UserBundle\OpenID\OpenIDResourceOwner::getUserInformation
     */
    public function testGetUserInformationUsesAccessTokenWhenIdTokenIsMissing(): void
    {
        $this->httpClientMock->expects($this->never())->method('sendRequest');

        $accessToken = $this->generateJwt([
            'sub' => 'openid_id',
            'given_name' => 'Jean',
            'family_name' => 'Michel',
        ]);
        $userInformation = $this->openIDResourceOwner->getUserInformation([
            'access_token' => $accessToken,
        ]);

        self::assertSame('Jean', $userInformation->getData()['given_name']);
        self::assertSame('Michel', $userInformation->getData()['family_name']);
        self::assertSame($accessToken, $userInformation->getAccessToken());
    }

    /**
     * @covers \Capco\UserBundle\OpenID\OpenIDResourceOwner::getUserInformation
     */
    public function testGetUserInformationFallsBackToUserInfoWhenNoTokenPayloadCanBeDecoded(): void
    {
        $responseMock = $this->createMock(ResponseInterface::class);
        $responseMock->method('getBody')->willReturn(json_encode([
            'sub' => 'openid_id',
            'email' => 'openid_user@test.com',
        ]));

        $this->httpClientMock->expects($this->once())
            ->method('sendRequest')
            ->willReturn($responseMock)
        ;

        $userInformation = $this->openIDResourceOwner->getUserInformation([
            'access_token' => 'opaque-access-token',
        ]);

        self::assertSame('openid_id', $userInformation->getData()['sub']);
        self::assertSame('openid_user@test.com', $userInformation->getData()['email']);
    }

    private function createOpenIDResourceOwner(string $instanceName): OpenIDResourceOwner
    {
        putenv('SYMFONY_INSTANCE_NAME=' . $instanceName);

        $httpFactory = new HttpFactory();

        return new OpenIDResourceOwner(
            new HttpMethodsClient($this->httpClientMock, $httpFactory, $httpFactory),
            $this->httpUtilsMock,
            $this->options,
            'openid',
            $this->storageMock,
            $this->optionsModifierMock,
            $this->featureCheckerMock,
            $this->loggerMock
        );
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function generateJwt(array $payload): string
    {
        return implode('.', [
            base64_encode((string) json_encode(['alg' => 'HS256', 'typ' => 'JWT'])),
            base64_encode((string) json_encode($payload)),
            'signature',
        ]);
    }
}
