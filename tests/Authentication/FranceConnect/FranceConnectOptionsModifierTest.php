<?php

namespace Capco\Tests\Authentication\FranceConnect;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\SSO\FranceConnectSSOConfiguration;
use Capco\AppBundle\Repository\FranceConnectSSOConfigurationRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\FranceConnect\FranceConnectOptionsModifier;
use Capco\UserBundle\FranceConnect\FranceConnectResourceOwner;
use PHPUnit\Framework\MockObject\Exception as MockException;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Contracts\Cache\ItemInterface;

/**
 * @internal
 * @coversNothing
 */
final class FranceConnectOptionsModifierTest extends TestCase
{
    private FranceConnectOptionsModifier $franceConnectOptionsModifier;
    private FranceConnectSSOConfigurationRepository|MockObject $repositoryMock;
    private RedisCache|MockObject $redisCacheMock;
    private Manager|MockObject $toggleManagerMock;
    private SessionInterface|MockObject $sessionMock;
    private FranceConnectResourceOwner|MockObject $resourceOwnerMock;
    private ItemInterface|MockObject $fcTokensMock;
    private ItemInterface|MockObject $ssoConfigurationMock;
    private FranceConnectSSOConfiguration|MockObject $fcMock;

    /**
     * @throws MockException
     */
    protected function setUp(): void
    {
        $this->repositoryMock = $this->createMock(FranceConnectSSOConfigurationRepository::class);
        $this->redisCacheMock = $this->createMock(RedisCache::class);
        $this->toggleManagerMock = $this->createMock(Manager::class);
        $this->sessionMock = $this->createMock(SessionInterface::class);
        $this->resourceOwnerMock = $this->createMock(FranceConnectResourceOwner::class);
        $this->fcMock = $this->createMock(FranceConnectSSOConfiguration::class);
        $this->fcTokensMock = $this->createMock(ItemInterface::class);
        $this->ssoConfigurationMock = $this->createMock(ItemInterface::class);

        $this->franceConnectOptionsModifier = new FranceConnectOptionsModifier(
            $this->repositoryMock,
            $this->redisCacheMock,
            $this->toggleManagerMock,
            $this->sessionMock
        );
    }

    /**
     * @covers \FranceConnectOptionsModifier::getAllowedData
     *
     * @throws MockException
     */
    public function testGetAllowedData(): void
    {
        $this->toggleManagerMock->method('isActive')->with('login_franceconnect')->willReturn(true);
        $this->repositoryMock->method('find')->with('franceConnect')->willReturn($this->fcMock);
        $data = [
            'given_name' => true,
            'family_name' => true,
            'birthdate' => false,
            'gender' => false,
            'birthplace' => false,
            'birthcountry' => false,
            'email' => true,
            'preferred_username' => false,
        ];
        $this->fcMock->method('getAllowedData')->willReturn($data);

        $this->assertSame(['given_name', 'family_name', 'email'], $this->franceConnectOptionsModifier->getAllowedData());
    }

    /**
     * @covers \FranceConnectOptionsModifier::getAllowedData
     *
     * @throws MockException
     */
    public function testDidntGetAllowedData(): void
    {
        $this->toggleManagerMock->method('isActive')->with('login_franceconnect')->willReturn(false);

        $this->assertSame([], $this->franceConnectOptionsModifier->getAllowedData());
    }

    /**
     * @covers \FranceConnectOptionsModifier::modifyOptions
     *
     * @throws MockException
     */
    public function testModifiesOptionsBeforeGoingToFranceconnect(): void
    {
        $this->toggleManagerMock->method('isActive')->with('login_franceconnect')->willReturn(true);
        $sessionId = 'sessionId-123456';
        $sessionMock = $this->sessionMock;
        $sessionMock->method('isStarted')->willReturn(true);
        $sessionMock->method('getId')->willReturn($sessionId);
        // Before redirecting to FranceConnect, the state is not in session
        $sessionMock->method('get')->with(FranceConnectOptionsModifier::SESSION_FRANCE_CONNECT_STATE_KEY)->willReturn(null);
        $fcTokensMock = $this->fcTokensMock;
        // It's not in cache neither
        $fcTokensMock->method('isHit')->willReturn(false);
        // So we have to save state/nonce to cache
        $fcTokensMock->method('set')->with($this->isType('array'))->willReturn($fcTokensMock);
        $fcTokensMock->method('expiresAfter')->with($this->isType('int'));
        $ssoConfigurationMock = $this->ssoConfigurationMock;
        $this->redisCacheMock->method('getItem')->willReturnMap(
            [
                ['FranceConnect_tokens-' . $sessionId, $fcTokensMock],
                ['FranceConnectSSOConfiguration-' . $sessionId, $ssoConfigurationMock],
            ]
        );
        $ssoConfigurationMock->method('isHit')->willReturn(true);
        $ssoConfigArray = [
            'client_id' => 'CLIENT_ID_VALUE',
            'client_secret' => 'CLIENT_SECRET_VALUE',
            'access_token_url' => 'https://fcp-low.integ01.dev-franceconnect.fr/api/v2/token',
            'authorization_url' => 'https://fcp-low.integ01.dev-franceconnect.fr/api/v2/authorize',
            'infos_url' => 'https://fcp-low.integ01.dev-franceconnect.fr/api/v2/userinfo',
            'logout_url' => 'https://fcp-low.integ01.dev-franceconnect.fr/api/v2/session/end',
            'use_authorization_to_get_token' => false,
        ];
        $ssoConfigurationMock->method('get')->willReturn($ssoConfigArray);
        // And we put the state into session to reuse it when coming back from FC.
        $sessionMock->method('set')
            ->with(FranceConnectOptionsModifier::SESSION_FRANCE_CONNECT_STATE_KEY, $this->isType('string'))
        ;

        $this->assertSame(
            $ssoConfigArray,
            $this->franceConnectOptionsModifier->modifyOptions([], $this->resourceOwnerMock)
        );
        $this->assertSame(
            array_merge(['previous-key' => 'A value'], $ssoConfigArray),
            $this->franceConnectOptionsModifier->modifyOptions(['previous-key' => 'A value'], $this->resourceOwnerMock)
        );
    }

    /**
     * @covers \FranceConnectOptionsModifier::modifyOptions
     *
     * @throws MockException
     */
    public function testModifiesOptionsWhenComingBackFromFranceconnect(): void
    {
        $this->toggleManagerMock->method('isActive')->with('login_franceconnect')->willReturn(true);
        $sessionId = 'sessionId-123456';
        $state = 'state-value-12333';
        $this->sessionMock->method('isStarted')->willReturn(true);
        $this->sessionMock->method('getId')->willReturn($sessionId);
        // When coming back from FranceConnect, the state is in session
        $this->sessionMock->method('get')->with(FranceConnectOptionsModifier::SESSION_FRANCE_CONNECT_STATE_KEY)->willReturn($state);
        $this->ssoConfigurationMock->method('isHit')->willReturn(true);
        $ssoConfigArray = [
            'client_id' => 'CLIENT_ID_VALUE',
        ];
        $this->ssoConfigurationMock->method('get')->willReturn($ssoConfigArray);
        $this->redisCacheMock->method('getItem')->with('FranceConnectSSOConfiguration-' . $sessionId)
            ->willReturn($this->ssoConfigurationMock)
        ;

        $this->assertSame($ssoConfigArray, $this->franceConnectOptionsModifier->modifyOptions([], $this->resourceOwnerMock));
        $this->assertSame(
            array_merge(['previous-key' => 'An other value'], $ssoConfigArray),
            $this->franceConnectOptionsModifier->modifyOptions(['previous-key' => 'An other value'], $this->resourceOwnerMock)
        );
    }
}
