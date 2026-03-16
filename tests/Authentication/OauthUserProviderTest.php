<?php

namespace Capco\Tests\Authentication;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\SSO\FranceConnectSSOConfiguration;
use Capco\AppBundle\Exception\FranceConnectAuthenticationException;
use Capco\AppBundle\GraphQL\Mutation\GroupMutation;
use Capco\AppBundle\Repository\FranceConnectSSOConfigurationRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\FranceConnect\FranceConnectResourceOwner;
use Capco\UserBundle\Handler\UserInvitationHandler;
use Capco\UserBundle\OpenID\OpenIDExtraMapper;
use Capco\UserBundle\OpenID\OpenIDResourceOwner;
use Capco\UserBundle\Repository\UserRepository;
use Capco\UserBundle\Security\Core\User\OauthUserProvider;
use FOS\UserBundle\Model\UserManagerInterface;
use HWI\Bundle\OAuthBundle\OAuth\ResourceOwner\FacebookResourceOwner;
use HWI\Bundle\OAuthBundle\OAuth\Response\UserResponseInterface;
use HWI\Bundle\OAuthBundle\Security\Core\Authentication\Token\OAuthToken;
use PHPUnit\Framework\MockObject\Exception as MockException;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Cache\InvalidArgumentException;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Session\Flash\FlashBagInterface;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @internal
 * @coversNothing
 */
final class OauthUserProviderTest extends TestCase
{
    private UserManagerInterface $userManagerMock;
    private UserRepository $userRepositoryMock;
    private OpenIDExtraMapper $extraMapperMock;
    private Indexer $indexerMock;
    private GroupMutation $groupMutationMock;
    private FranceConnectSSOConfigurationRepository $franceConnectSSOConfigurationRepositoryMock;
    private LoggerInterface $loggerMock;
    private UserInvitationHandler $userInvitationHandlerMock;
    private TokenStorageInterface $tokenStorageMock;
    private RequestStack $requestStackMock;
    private RedisCache $redisCacheMock;
    private TranslatorInterface $translatorMock;
    private RouterInterface $routerMock;
    private Session $sessionMock;
    private OauthUserProvider $oauthUserProvider;
    private UserResponseInterface & MockObject $responseMock;
    private OpenIDResourceOwner & MockObject $resourceOwnerMock;
    private TokenInterface & MockObject $tokenMock;

    /**
     * @throws MockException
     * @throws \JsonException
     */
    protected function setUp(): void
    {
        $this->userManagerMock = $this->createMock(UserManagerInterface::class);
        $this->userRepositoryMock = $this->createMock(UserRepository::class);
        $this->extraMapperMock = $this->createMock(OpenIDExtraMapper::class);
        $this->indexerMock = $this->createMock(Indexer::class);
        $this->groupMutationMock = $this->createMock(GroupMutation::class);
        $this->franceConnectSSOConfigurationRepositoryMock = $this->createMock(FranceConnectSSOConfigurationRepository::class);
        $this->loggerMock = $this->createMock(LoggerInterface::class);
        $this->userInvitationHandlerMock = $this->createMock(UserInvitationHandler::class);
        $this->tokenStorageMock = $this->createMock(TokenStorageInterface::class);
        $this->requestStackMock = $this->createMock(RequestStack::class);
        $this->redisCacheMock = $this->createMock(RedisCache::class);
        $this->translatorMock = $this->createMock(TranslatorInterface::class);
        $this->routerMock = $this->createMock(RouterInterface::class);
        $this->sessionMock = $this->createMock(Session::class);
        $this->responseMock = $this->createMock(UserResponseInterface::class);
        $this->resourceOwnerMock = $this->createMock(OpenIDResourceOwner::class);
        $this->tokenMock = $this->createMock(TokenInterface::class);

        $state = urlencode(base64_encode((string) json_encode(['csrf_token' => '12345'], \JSON_THROW_ON_ERROR)));
        $request = new Request();
        $request->query->set('state', $state);
        $request->setSession($this->sessionMock);
        $this->requestStackMock->method('getCurrentRequest')->willReturn($request);
        $this->requestStackMock->method('getSession')->willReturn($this->sessionMock);
        $this->sessionMock->method('getFlashBag')->willReturn($this->createMock(FlashBagInterface::class));
        $this->routerMock
            ->method('generate')
            ->willReturnMap([
                ['app_homepage', [], RouterInterface::ABSOLUTE_URL, 'https://capco.dev/'],
                ['capco_profile_edit', [], RouterInterface::ABSOLUTE_URL, 'https://capco.dev/profile/edit-profile'],
            ])
        ;

        $this->oauthUserProvider = new OauthUserProvider(
            $this->userManagerMock,
            $this->userRepositoryMock,
            $this->extraMapperMock,
            $this->indexerMock,
            [],
            $this->groupMutationMock,
            $this->franceConnectSSOConfigurationRepositoryMock,
            $this->loggerMock,
            $this->userInvitationHandlerMock,
            $this->tokenStorageMock,
            $this->requestStackMock,
            $this->redisCacheMock,
            $this->translatorMock,
            $this->routerMock,
            'capco'
        );
    }

    /**
     * @covers \Capco\UserBundle\Security\Core\User\OauthUserProvider::loadUserByOAuthUserResponse
     */
    public function testLoadsNewOpenidUser(): void
    {
        $responseMock = $this->responseMock;
        $resourceOwnerMock = $this->resourceOwnerMock;
        $tokenMock = $this->tokenMock;
        $user = new User();

        $this->generateGenericOpenIdResponse($responseMock, $resourceOwnerMock);
        $this->tokenStorageMock->method('getToken')->willReturn($tokenMock);
        $tokenMock->method('getUser')->willReturn(null);
        // We try to find a user that match the criterias, but could not find one.
        $this->userRepositoryMock->method('findByAccessTokenOrUsername')->with('openid_access_token', 'openid_id')
            ->willReturn(null)
        ;
        $this->userRepositoryMock->method('findOneByEmail')->with('openid_user@test.com')->willReturn(null);
        $this->userManagerMock->method('createUser')
            ->willReturn($user)
        ;
        $this->extraMapperMock->method('map')->with($user, $responseMock);
        // We flush the new values.
        $this->userManagerMock->method('updateUser')->with($user);

        $this->assertSame($user, $this->oauthUserProvider->loadUserByOAuthUserResponse($responseMock));

        $this->assertSame('openid_id', $user->getOpenId());
        $this->assertSame('openid_access_token', $user->getOpenIdAccessToken());
        $this->assertSame('openid_user', $user->getUsername());
        $this->assertEquals('openid_user@test.com', $user->getEmail());
        $this->assertTrue($user->isEnabled());
    }

    /**
     * @covers \Capco\UserBundle\Security\Core\User\OauthUserProvider::loadUserByOAuthUserResponse
     *
     * @throws MockException
     */
    public function testLoadsNewOpenidRedhatUser(): void
    {
        /** @var UserResponseInterface&MockObject $responseMock */
        $responseMock = $this->createMock(UserResponseInterface::class);
        /** @var OpenIDResourceOwner&MockObject $resourceOwnerMock */
        $resourceOwnerMock = $this->createMock(OpenIDResourceOwner::class);
        $user = new User();
        /** @var TokenInterface&MockObject $tokenMock */
        $tokenMock = $this->createMock(TokenInterface::class);
        $this->generateGenericRedhatResponse($responseMock, $resourceOwnerMock);
        $this->tokenStorageMock->method('getToken')->willReturn($tokenMock);
        $tokenMock->method('getUser')->willReturn(null);
        // We try to find a user that match the criteria, but could not find one.
        $this->userRepositoryMock->method('findByAccessTokenOrUsername')->with('openid_access_token', 'openid_id')
            ->willReturn(null)
        ;
        $this->userRepositoryMock->method('findOneByEmail')->with('openid_user@test.com')->willReturn(null);
        $this->userManagerMock->method('createUser')
            ->willReturn($user)
        ;
        $this->extraMapperMock->method('map')->with($user, $responseMock);

        $this->assertSame($user, $this->oauthUserProvider->loadUserByOAuthUserResponse($responseMock));

        $this->assertSame('openid_id', $user->getOpenId());
        $this->assertSame('openid_access_token', $user->getOpenIdAccessToken());
        $this->assertSame('openid_user', $user->getUsername());
        $this->assertEquals('openid_user@test.com', $user->getEmail());
        $this->assertTrue($user->isEnabled());
    }

    /**
     * @covers \Capco\UserBundle\Security\Core\User\OauthUserProvider::loadUserByOAuthUserResponse
     *
     * @throws MockException
     */
    public function testLoadsNewFacebookUser(): void
    {
        $ressourceOwner = $this->createMock(FacebookResourceOwner::class);
        $ressourceOwner->method('getName')->willReturn('facebook');

        /** @var UserResponseInterface&MockObject $responseMock */
        $responseMock = $this->createMock(UserResponseInterface::class);
        $user = new User();
        /** @var TokenInterface&MockObject $tokenMock */
        $tokenMock = $this->createMock(TokenInterface::class);
        $this->generateGenericFacebookResponse($responseMock, $ressourceOwner);
        $this->tokenStorageMock->method('getToken')->willReturn($tokenMock);
        $tokenMock->method('getUser')->willReturn(null);
        // We try to find a user that match the criteria, but could not find one.
        $this->userRepositoryMock->method('findByAccessTokenOrUsername')->with('facebook_access_token', '2081576388576162')
            ->willReturn(null)
        ;
        $this->userRepositoryMock->method('findOneByEmail')->with('facebook_2081576388576162')->willReturn(null);
        $this->userManagerMock->method('createUser')
            ->willReturn($user)
        ;

        $this->assertSame($user, $this->oauthUserProvider->loadUserByOAuthUserResponse($responseMock));

        $this->assertSame('2081576388576162', $user->getFacebookId());
        $this->assertSame('facebook_access_token', $user->getFacebookAccessToken());
        $this->assertSame('facebook_user', $user->getUsername());
        $this->assertNull($user->getEmail());
        $this->assertTrue($user->isEnabled());
    }

    /**
     * @covers \Capco\UserBundle\Security\Core\User\OauthUserProvider::loadUserByOAuthUserResponse
     *
     * @throws MockException
     */
    public function testLoadsExistingOpenidUser(): void
    {
        /** @var UserResponseInterface&MockObject $responseMock */
        $responseMock = $this->createMock(UserResponseInterface::class);
        /** @var OpenIDResourceOwner&MockObject $resourceOwnerMock */
        $resourceOwnerMock = $this->createMock(OpenIDResourceOwner::class);
        /** @var TokenInterface&MockObject $tokenMock */
        $tokenMock = $this->createMock(TokenInterface::class);
        $user = new User();

        $this->generateGenericOpenIdResponse($responseMock, $resourceOwnerMock);
        $this->tokenStorageMock->method('getToken')->willReturn($tokenMock);
        $tokenMock->method('getUser')->willReturn(null);
        // We disable refresh user information at every login
        $resourceOwnerMock->method('isRefreshingUserInformationsAtEveryLogin')->willReturn(false);
        // We try to find a user that match the criterias, and find one.
        $this->userRepositoryMock->method('findByAccessTokenOrUsername')->with('openid_access_token', 'openid_id')
            ->willReturn($user)
        ;
        $this->assertSame($user, $this->oauthUserProvider->loadUserByOAuthUserResponse($responseMock));

        $this->assertSame('openid_id', $user->getOpenId());
        $this->assertSame('openid_access_token', $user->getOpenIdAccessToken());
    }

    /**
     * @covers \Capco\UserBundle\Security\Core\User\OauthUserProvider::loadUserByOAuthUserResponse
     *
     * @throws MockException
     */
    public function testAssociatesAUserToFranceconnect(): void
    {
        /** @var UserResponseInterface&MockObject $responseMock */
        $responseMock = $this->createMock(UserResponseInterface::class);
        /** @var FranceConnectResourceOwner&MockObject $resourceOwnerMock */
        $resourceOwnerMock = $this->createMock(FranceConnectResourceOwner::class);
        /** @var TokenInterface&MockObject $tokenMock */
        $tokenMock = $this->createMock(TokenInterface::class);
        /** @var FranceConnectSSOConfiguration&MockObject $fcConfigMock */
        $fcConfigMock = $this->createMock(FranceConnectSSOConfiguration::class);
        /** @var OAuthToken&MockObject $OAuthTokenMock */
        $OAuthTokenMock = $this->createMock(OAuthToken::class);
        /** @var ItemInterface&MockObject $cacheItemMock */
        $cacheItemMock = $this->createMock(ItemInterface::class);

        $cacheItemMock->method('isHit')->willReturn(true);
        $cacheItemMock->method('get')->willReturn(['state' => '12345', 'nonce' => '54321']);
        $this->redisCacheMock->method('getItem')->with($this->isType('string'))->willReturn($cacheItemMock);

        $this->generateGenericFranceConnectResponse($responseMock, $resourceOwnerMock, $OAuthTokenMock);

        $user = new User();
        $user->setId('some-uuid')
            ->setFirstname('toto')
            ->setLastname('ala')
            ->setDateOfBirth(new \DateTime('1992-12-12'))
            ->setGender('m')
            ->setEmail('viewer@email.com')
            ->setUsername('toto')
        ;
        $this->tokenStorageMock->method('getToken')->willReturn($tokenMock);
        $tokenMock->method('getUser')->willReturn($user);
        $allowedData = [
            'given_name' => true,
            'family_name' => true,
            'birthdate' => true,
            'gender' => true,
            'birthplace' => false,
            'birthcountry' => false,
            'email' => true,
            'preferred_username' => false,
        ];
        // We try to find a user that match the criteria, and find one.
        $this->franceConnectSSOConfigurationRepositoryMock->method('find')->with('franceConnect')->willReturn($fcConfigMock);
        $fcConfigMock->method('getAllowedData')->willReturn($allowedData);

        $this->assertSame($user, $this->oauthUserProvider->loadUserByOAuthUserResponse($responseMock));
    }

    /**
     * @covers \Capco\UserBundle\Security\Core\User\OauthUserProvider::connect
     *
     * @throws MockException
     */
    public function testDoesNotDisconnectPreviousFranceConnectUserWhenEmailMismatch(): void
    {
        /** @var FranceConnectResourceOwner&MockObject $resourceOwnerMock */
        $resourceOwnerMock = $this->createMock(FranceConnectResourceOwner::class);
        /** @var UserResponseInterface&MockObject $responseMock */
        $responseMock = $this->createMock(UserResponseInterface::class);
        /** @var User&MockObject $currentUser */
        $currentUser = $this->createMock(User::class);
        /** @var OAuthToken&MockObject $oauthTokenMock */
        $oauthTokenMock = $this->createMock(OAuthToken::class);

        $resourceOwnerMock->method('getName')->willReturn('franceconnect');
        $responseMock->method('getResourceOwner')->willReturn($resourceOwnerMock);
        $responseMock->method('getEmail')->willReturn('fc-id');
        $responseMock->method('getUsername')->willReturn('fc-id');
        $responseMock->method('getAccessToken')->willReturn('fc-access-token');
        $responseMock->method('getData')->willReturn(['email' => 'fc@email.com']);
        $responseMock->method('getOAuthToken')->willReturn($oauthTokenMock);
        $oauthTokenMock->method('getRawToken')->willReturn(['id_token' => 'fc-id-token']);

        $currentUser->method('getEmail')->willReturn('local@email.com');
        $this->sessionMock->expects($this->exactly(5))->method('set')
            ->withConsecutive(
                [\Capco\UserBundle\Security\Http\Logout\Handler\FranceConnectLogoutHandler::SESSION_LOGOUT_REQUIRED_KEY, true],
                [\Capco\UserBundle\Security\Http\Logout\Handler\FranceConnectLogoutHandler::SESSION_ID_TOKEN_KEY, 'fc-id-token'],
                [\Capco\UserBundle\Security\Http\Logout\Handler\FranceConnectLogoutHandler::SESSION_POST_LOGOUT_REDIRECT_URL_KEY, 'https://capco.dev/'],
                [\Capco\UserBundle\Security\Http\Logout\Handler\FranceConnectLogoutHandler::SESSION_IMMEDIATE_LOGOUT_REQUIRED_KEY, true],
                [\Capco\UserBundle\Security\Http\Logout\Handler\FranceConnectLogoutHandler::SESSION_AFTER_LOGOUT_REDIRECT_URL_KEY, 'https://capco.dev/profile/edit-profile#account']
            )
        ;

        $this->userRepositoryMock
            ->expects($this->never())
            ->method('findByAccessTokenOrUsername')
        ;
        $this->userManagerMock
            ->expects($this->never())
            ->method('updateUser')
        ;

        $this->oauthUserProvider->connect($currentUser, $responseMock);
    }

    /**
     * @covers \Capco\UserBundle\Security\Core\User\OauthUserProvider::loadUserByOAuthUserResponse
     *
     * @throws MockException
     */
    public function testLoadsExistingOpenidUserAndUpdatesValues(): void
    {
        /** @var UserResponseInterface&MockObject $responseMock */
        $responseMock = $this->createMock(UserResponseInterface::class);
        /** @var OpenIDResourceOwner&MockObject $resourceOwnerMock */
        $resourceOwnerMock = $this->createMock(OpenIDResourceOwner::class);
        /** @var User&MockObject $userMock */
        $userMock = $this->createMock(User::class);
        /** @var TokenInterface&MockObject $tokenMock */
        $tokenMock = $this->createMock(TokenInterface::class);
        $this->generateGenericOpenIdResponse($responseMock, $resourceOwnerMock);

        $this->tokenStorageMock->method('getToken')->willReturn($tokenMock);
        $tokenMock->method('getUser')->willReturn(null);
        $resourceOwnerMock->method('isRefreshingUserInformationsAtEveryLogin')->willReturn(true);
        $this->userRepositoryMock->method('findByAccessTokenOrUsername')->with('openid_access_token', 'openid_id')->willReturn($userMock);
        $userMock->method('getId')->willReturn('<some uuid>');
        $userMock->method('setOpenId')->with('openid_id')->willReturn($userMock);
        $userMock->method('setOpenIdAccessToken')->with('openid_access_token')->willReturn($userMock);
        $userMock->method('setUsername')->with('openid_user')->willReturn($userMock);
        $userMock->method('setEmail')->with('openid_user@test.com')->willReturn($userMock);

        $this->assertSame($userMock, $this->oauthUserProvider->loadUserByOAuthUserResponse($responseMock));
    }

    /**
     * @covers \Capco\UserBundle\Security\Core\User\OauthUserProvider::loadUserByOAuthUserResponse
     *
     * @throws MockException
     * @throws InvalidArgumentException
     */
    public function testLoadsNewFranceConnectUserWhenAccessTokenAndUsernameAreNull(): void
    {
        /** @var UserResponseInterface&MockObject $responseMock */
        $responseMock = $this->createMock(UserResponseInterface::class);
        /** @var FranceConnectResourceOwner&MockObject $resourceOwnerMock */
        $resourceOwnerMock = $this->createMock(FranceConnectResourceOwner::class);
        /** @var OAuthToken&MockObject $OAuthTokenMock */
        $OAuthTokenMock = $this->createMock(OAuthToken::class);
        /** @var TokenInterface&MockObject $tokenMock */
        $tokenMock = $this->createMock(TokenInterface::class);
        /** @var ItemInterface&MockObject $cacheItemMock */
        $cacheItemMock = $this->createMock(ItemInterface::class);
        /** @var FranceConnectSSOConfiguration&MockObject $fcConfigMock */
        $fcConfigMock = $this->createMock(FranceConnectSSOConfiguration::class);

        $user = new User();
        $data = [
            'given_name' => 'Jean Jacques',
            'family_name' => 'GoldMan',
            'birthdate' => null,
            'gender' => 'male',
            'birthplace' => null,
            'birthcountry' => null,
            'email' => 'jeanjacques@goldman.com',
            'preferred_username' => 'jj',
        ];
        $allowedData = [
            'given_name' => true,
            'family_name' => true,
            'birthdate' => true,
            'gender' => true,
            'birthplace' => false,
            'birthcountry' => false,
            'email' => true,
            'preferred_username' => true,
        ];

        $cacheItemMock->method('isHit')->willReturn(true);
        $cacheItemMock->method('get')->willReturn(['state' => '12345', 'nonce' => '54321']);
        $this->redisCacheMock->method('getItem')->with($this->isType('string'))->willReturn($cacheItemMock);

        $resourceOwnerMock->method('getName')->willReturn('franceconnect');
        $responseMock->method('getResourceOwner')->willReturn($resourceOwnerMock);
        $responseMock->method('getOAuthToken')->willReturn($OAuthTokenMock);
        $responseMock->method('getData')->willReturn($data);
        $responseMock->method('getEmail')->willReturn('jeanjacques@goldman.com');
        $responseMock->method('getNickname')->willReturn('JJ');
        $responseMock->method('getAccessToken')->willReturn(null);
        $responseMock->method('getUsername')->willReturn(null);
        $responseMock->method('getFirstName')->willReturn('Jean Jacques');
        $responseMock->method('getLastName')->willReturn('GoldMan');

        $state = base64_encode((string) json_encode(['csrf_token' => '12345']));
        $nonce = base64_encode((string) json_encode(['nonce' => '54321']));
        $OAuthTokenMock->method('getRawToken')->willReturn(['id_token' => $state . '.' . $nonce]);

        $this->tokenStorageMock->method('getToken')->willReturn($tokenMock);
        $tokenMock->method('getUser')->willReturn(null);
        $this->userRepositoryMock
            ->expects($this->once())
            ->method('findByAccessTokenOrUsername')
            ->with(null, null)
            ->willReturn(null)
        ;
        $this->userRepositoryMock->method('findOneByEmail')->with('jeanjacques@goldman.com')->willReturn(null);
        $this->userManagerMock->method('createUser')->willReturn($user);
        $this->franceConnectSSOConfigurationRepositoryMock->method('find')->with('franceConnect')->willReturn($fcConfigMock);
        $fcConfigMock->method('getAllowedData')->willReturn($allowedData);
        $this->translatorMock->method('trans')->willReturnCallback(fn ($messageKey) => $messageKey);

        $this->assertSame($user, $this->oauthUserProvider->loadUserByOAuthUserResponse($responseMock));
    }

    /**
     * @covers \Capco\UserBundle\Security\Core\User\OauthUserProvider::mapFranceConnectData
     *
     * @throws MockException
     */
    public function testMapsFranceconnectData(): void
    {
        /** @var UserResponseInterface&MockObject $responseMock */
        $responseMock = $this->createMock(UserResponseInterface::class);

        $user = new User();
        $data = [];
        $data['given_name'] = 'toto';
        $data['family_name'] = 'ala';
        $data['birthplace'] = false;
        $data['birthdate'] = '1992-12-12';
        $data['gender'] = 'male';
        $data['email'] = 'toto@alapla.ge';

        $responseMock->method('getData')->willReturn($data);
        $allowedData = [
            'given_name' => true,
            'family_name' => true,
            'birthdate' => true,
            'gender' => true,
            'birthplace' => false,
            'birthcountry' => false,
            'email' => true,
            'preferred_username' => false,
        ];
        $this->assertSame($user, $this->oauthUserProvider->mapFranceConnectData(
            $user,
            $responseMock,
            $allowedData
        ));

        $this->assertSame(ucfirst(strtolower($data['given_name'])), $user->getFirstname());
        $this->assertSame($data['family_name'], $user->getLastname());
        $this->assertSame('ala Toto', $user->getUsername());
        $this->assertSame('m', $user->getGender());
        $this->assertSame($data['email'], $user->getEmail());
        $this->assertSame('1992-12-12', $user->getDateOfBirth()->format('Y-m-d'));
    }

    /**
     * @covers \Capco\UserBundle\Security\Core\User\OauthUserProvider::mapFranceConnectData
     *
     * @throws MockException
     */
    public function testMapsFranceconnectDataWithUsername(): void
    {
        /** @var UserResponseInterface&MockObject $responseMock */
        $responseMock = $this->createMock(UserResponseInterface::class);

        $user = new User();
        $data = [];
        $data['given_name'] = 'toto';
        $data['family_name'] = 'ala';
        $data['birthplace'] = false;
        $data['birthdate'] = '1992-12-12';
        $data['gender'] = 'male';
        $data['email'] = 'toto@alapla.ge';
        $data['preferred_username'] = 'toto_fc_username';

        $responseMock->method('getData')->willReturn($data);
        $birthday = \DateTime::createFromFormat('Y-m-d', $data['birthdate']) ?: null;
        if ($birthday) {
            $birthday->setTime(0, 0);
        }
        $allowedData = [
            'given_name' => true,
            'family_name' => true,
            'birthdate' => true,
            'gender' => true,
            'birthplace' => false,
            'birthcountry' => false,
            'email' => true,
            'preferred_username' => true,
        ];
        $this->assertSame($user, $this->oauthUserProvider->mapFranceConnectData(
            $user,
            $responseMock,
            $allowedData
        ));

        $this->assertSame(ucfirst(strtolower($data['given_name'])), $user->getFirstname());
        $this->assertSame($data['family_name'], $user->getLastname());
        $this->assertSame('toto_fc_username', $user->getUsername());
        $this->assertSame('m', $user->getGender());
        $this->assertSame($data['email'], $user->getEmail());
        $this->assertSame('1992-12-12', $user->getDateOfBirth()->format('Y-m-d'));
    }

    /**
     * @covers \Capco\UserBundle\Security\Core\User\OauthUserProvider::mapFranceConnectData
     *
     * @throws MockException
     */
    public function testDoesntMapFranceconnectDataWhenUserExists(): void
    {
        /** @var UserResponseInterface&MockObject $responseMock */
        $responseMock = $this->createMock(UserResponseInterface::class);

        $data = [];
        $data['given_name'] = 'toto';
        $data['family_name'] = 'titi';
        $data['birthplace'] = false;
        $data['birthdate'] = '1992-12-12';
        $data['gender'] = 'male';
        $data['email'] = 'toto@alapla.ge';
        $data['preferred_username'] = 'toto_fc_username';
        $responseMock->method('getData')->willReturn($data);

        $user = new User();
        $user->setFirstname('TOTO_AVANT');
        $user->setLastname('ALA');
        $user->setUsername('initial_username');
        $user->setDateOfBirth(\DateTime::createFromFormat('Y-m-d', '1990-10-10'));
        $user->setGender('mal');
        $user->setEmail('totoala@ferme.com');

        $allowedData = [
            'given_name' => true,
            'family_name' => true,
            'birthdate' => false,
            'gender' => true,
            'birthplace' => false,
            'birthcountry' => false,
            'email' => true,
            'preferred_username' => true,
        ];
        $this->assertSame($user, $this->oauthUserProvider->mapFranceConnectData(
            $user,
            $responseMock,
            $allowedData
        ));

        $this->assertSame(ucfirst(strtolower($data['given_name'])), $user->getFirstname());
        $this->assertSame($data['family_name'], $user->getLastname());
        $this->assertSame('initial_username', $user->getUsername());
        $this->assertSame('m', $user->getGender());
        $this->assertSame('totoala@ferme.com', $user->getEmail());
        $this->assertSame('1990-10-10', $user->getDateOfBirth()->format('Y-m-d'));
    }

    /**
     * @covers \Capco\UserBundle\Security\Core\User\OauthUserProvider::verifyFranceConnectStateAndNonce
     *
     * @throws MockException
     * @throws InvalidArgumentException
     */
    public function testThrowsExceptionWhenBadStateNonceFranceconnect(): void
    {
        /** @var UserResponseInterface&MockObject $responseMock */
        $responseMock = $this->createMock(UserResponseInterface::class);
        /** @var FranceConnectResourceOwner&MockObject $resourceOwnerMock */
        $resourceOwnerMock = $this->createMock(FranceConnectResourceOwner::class);
        /** @var OAuthToken&MockObject $OAuthTokenMock */
        $OAuthTokenMock = $this->createMock(OAuthToken::class);

        $this->generateGenericFranceConnectResponse($responseMock, $resourceOwnerMock, $OAuthTokenMock);

        /** @var FlashBagInterface&MockObject $flashBagMock */
        $flashBagMock = $this->createMock(FlashBagInterface::class);
        $this->sessionMock->method('remove')->with($this->isType('string'));
        $this->sessionMock->method('getFlashBag')->willReturn($flashBagMock);

        /** @var ItemInterface&MockObject $cacheItemMock */
        $cacheItemMock = $this->createMock(ItemInterface::class);
        $cacheItemMock->method('isHit')->willReturn(true);
        $cacheItemMock->method('get')->willReturn(['nonce' => 'bad-nonce', 'state' => '12345']);
        $this->testVerifyFranceConnectStateAndNonce($cacheItemMock, $responseMock);
    }

    /**
     * @covers \Capco\UserBundle\Security\Core\User\OauthUserProvider::verifyFranceConnectStateAndNonce
     *
     * @throws MockException
     * @throws InvalidArgumentException
     */
    public function testThrowsExceptionWhenNoStateNonceInCacheFranceconnect(): void
    {
        $responseMock = $this->prepareMocksFranceConnectStateNonce();

        /** @var ItemInterface&MockObject $cacheItemMock */
        $cacheItemMock = $this->createMock(ItemInterface::class);
        $cacheItemMock->method('isHit')->willReturn(false);
        $this->testVerifyFranceConnectStateAndNonce($cacheItemMock, $responseMock);
    }

    /**
     * @covers \Capco\UserBundle\Security\Core\User\OauthUserProvider::verifyFranceConnectStateAndNonce
     *
     * @throws MockException
     */
    public function testThrowsExceptionWhenFranceconnectTokenHasExpired(): void
    {
        $responseMock = $this->prepareMocksFranceConnectStateNonce([
            'status' => 'fail',
            'message' => 'token_not_found_or_expired',
        ]);

        $this->expectException(FranceConnectAuthenticationException::class);
        $this->expectExceptionMessage('france-connect-connection-error');
        $this->oauthUserProvider->verifyFranceConnectResponse($responseMock);
    }

    private function generateGenericOpenIdResponse(
        UserResponseInterface & MockObject $response,
        OpenIDResourceOwner & MockObject $ressourceOwner
    ): void {
        $ressourceOwner->method('getName')->willReturn('openid');
        $response->method('getEmail')->willReturn('openid_user@test.com');
        $response->method('getNickname')->willReturn('openid_user');
        $response->method('getAccessToken')->willReturn('openid_access_token');
        $response->method('getUsername')->willReturn('openid_id');
        $response->method('getResourceOwner')->willReturn($ressourceOwner);
        $response->method('getLastName')->willReturn('Smith');
        $response->method('getFirstName')->willReturn('jean');
        $response->method('getData')->willReturn(['email' => 'test@test.com']);
    }

    private function generateGenericRedhatResponse(
        UserResponseInterface & MockObject $response,
        OpenIDResourceOwner & MockObject $ressourceOwner
    ): void {
        $this->generateGenericOpenIdResponse($response, $ressourceOwner);
        $response->method('getData')->willReturn(['mail' => 'redhatuser@test.com']);
    }

    private function generateGenericFacebookResponse(
        UserResponseInterface & MockObject $response,
        FacebookResourceOwner $ressourceOwner
    ): void {
        $response->method('getEmail')->willReturn(null);
        $response->method('getNickname')->willReturn('facebook_user');
        $response->method('getAccessToken')->willReturn('facebook_access_token');
        $response->method('getUsername')->willReturn('2081576388576162');
        $response->method('getResourceOwner')->willReturn($ressourceOwner);
        $response->method('getLastName')->willReturn('Smith');
        $response->method('getFirstName')->willReturn('jean');
        $response->method('getData')->willReturn([]);
    }

    /**
     * @param null|array<string, mixed> $data
     */
    private function generateGenericFranceConnectResponse(
        UserResponseInterface & MockObject $response,
        FranceConnectResourceOwner & MockObject $ressourceOwner,
        OAuthToken & MockObject $OAuthToken,
        ?array $data = null
    ): void {
        if (null === $data) {
            $data = [
                'given_name' => 'Jean Jacques',
                'family_name' => 'GoldMan',
                'birthdate' => null,
                'gender' => 'male',
                'birthplace' => null,
                'birthcountry' => null,
                'email' => 'jeanjacques@goldman.com',
                'preferred_username' => 'jj',
            ];
        }
        $response->method('getData')->willReturn($data);
        $ressourceOwner->method('getName')->willReturn('franceconnect');
        $response->method('getEmail')->willReturn('jeanjacques@goldman.com');
        $response->method('getNickname')->willReturn('JJ');
        $response->method('getAccessToken')->willReturn('franceconnect_access_token');
        $response->method('getUsername')->willReturn('jj');
        $response->method('getResourceOwner')->willReturn($ressourceOwner);
        $response->method('getLastName')->willReturn('GoldMan');
        $response->method('getFirstName')->willReturn('Jean Jacques');
        $response->method('getOAuthToken')->willReturn($OAuthToken);
        $response->method('getExpiresIn')->willReturn(60);
        $state = base64_encode((string) json_encode(['csrf_token' => '12345']));
        $nonce = base64_encode((string) json_encode(['nonce' => '54321']));
        $token = ['id_token' => $state . '.' . $nonce];
        $OAuthToken->method('getRawToken')->willReturn($token);

        $this->translatorMock->method('trans')->willReturnCallback(fn ($messageKey) => $messageKey);
    }

    /**
     * @param array<string, mixed> $data
     *
     * @throws MockException
     */
    private function prepareMocksFranceConnectStateNonce(?array $data = null): UserResponseInterface & MockObject
    {
        $responseMock = $this->createMock(UserResponseInterface::class);
        /** @var FranceConnectResourceOwner&MockObject $resourceOwnerMock */
        $resourceOwnerMock = $this->createMock(FranceConnectResourceOwner::class);
        /** @var OAuthToken&MockObject $OAuthTokenMock */
        $OAuthTokenMock = $this->createMock(OAuthToken::class);
        /** @var FlashBagInterface&MockObject $flashBagMock */
        $flashBagMock = $this->createMock(FlashBagInterface::class);

        $this->generateGenericFranceConnectResponse($responseMock, $resourceOwnerMock, $OAuthTokenMock, $data);
        $this->sessionMock->method('getFlashBag')->willReturn($flashBagMock);

        return $responseMock;
    }

    /**
     * @throws InvalidArgumentException
     * @throws MockException
     */
    private function testVerifyFranceConnectStateAndNonce(MockObject|ItemInterface $cacheItemMock, UserResponseInterface & MockObject $responseMock): void
    {
        $this->redisCacheMock = $this->createMock(RedisCache::class);
        $this->redisCacheMock->method('getItem')->willReturn($cacheItemMock);
        $this->oauthUserProvider = new OauthUserProvider(
            $this->userManagerMock,
            $this->userRepositoryMock,
            $this->extraMapperMock,
            $this->indexerMock,
            [],
            $this->groupMutationMock,
            $this->franceConnectSSOConfigurationRepositoryMock,
            $this->loggerMock,
            $this->userInvitationHandlerMock,
            $this->tokenStorageMock,
            $this->requestStackMock,
            $this->redisCacheMock,
            $this->translatorMock,
            $this->routerMock,
            'capco'
        );

        $this->expectException(FranceConnectAuthenticationException::class);
        $this->expectExceptionMessage('france-connect-connection-error');
        $this->oauthUserProvider->verifyFranceConnectStateAndNonce($responseMock);
    }
}
