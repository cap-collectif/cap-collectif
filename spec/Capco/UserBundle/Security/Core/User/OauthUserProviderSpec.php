<?php

namespace spec\Capco\UserBundle\Security\Core\User;

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
use HWI\Bundle\OAuthBundle\OAuth\ResourceOwnerInterface;
use HWI\Bundle\OAuthBundle\OAuth\Response\UserResponseInterface;
use HWI\Bundle\OAuthBundle\Security\Core\Authentication\Token\OAuthToken;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Prophecy\Argument as Arguments;
use Psr\Log\LoggerInterface;
use Symfony\Component\Cache\CacheItem;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Session\Flash\FlashBagInterface;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class OauthUserProviderSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(OauthUserProvider::class);
    }

    public function let(
        UserManagerInterface $userManager,
        UserRepository $userRepository,
        OpenIDExtraMapper $extraMapper,
        Indexer $indexer,
        GroupMutation $groupMutation,
        FranceConnectSSOConfigurationRepository $franceConnectSSOConfigurationRepository,
        LoggerInterface $logger,
        UserInvitationHandler $userInvitationHandler,
        TokenStorageInterface $tokenStorage,
        RequestStack $requestStack,
        RedisCache $redisCache,
        FlashBagInterface $flashBag,
        TranslatorInterface $translator,
        SessionInterface $session
    ) {
        $state = urlencode(base64_encode(json_encode(['csrf_token' => '12345'])));
        $request = new Request();
        $request->query->set('state', $state);

        $requestStack->getCurrentRequest()->willReturn($request);
        $cacheItem = new CacheItem();
        $cacheItem->set(['nonce' => '54321', 'state' => '12345']);
        $redisCache->getItem(Arguments::any())->willReturn($cacheItem);

        $this->beConstructedWith(
            $userManager,
            $userRepository,
            $extraMapper,
            $indexer,
            [],
            $groupMutation,
            $franceConnectSSOConfigurationRepository,
            $logger,
            $userInvitationHandler,
            $tokenStorage,
            $requestStack,
            $redisCache,
            $flashBag,
            $translator,
            $session,
            'instanceName',
        );
    }

    public function it_loads_new_openid_user(
        UserResponseInterface $response,
        UserRepository $userRepository,
        OpenIDResourceOwner $ressourceOwner,
        UserManagerInterface $userManager,
        User $user,
        OpenIDExtraMapper $extraMapper,
        TokenStorageInterface $tokenStorage,
        TokenInterface $token
    ) {
        $this->generateGenericOpenIdResponse($response, $ressourceOwner);
        $tokenStorage->getToken()->willReturn($token);
        $token->getUser()->willReturn(null);
        // We try to find a user that match the criterias, but could not find one.
        $userRepository
            ->findByAccessTokenOrUsername('openid_access_token', 'openid_id')
            ->willReturn(null)
        ;
        $userRepository->findOneByEmail('openid_user@test.com')->willReturn(null);

        $userManager
            ->createUser()
            ->shouldBeCalled()
            ->willReturn($user)
        ;
        $user->getId()->willReturn('<some uuid>');

        // Here we assert right values are set for the user.
        $user
            ->setOpenId('openid_id')
            ->shouldBeCalled()
            ->willReturn($user)
        ;
        $user
            ->setOpenIdAccessToken('openid_access_token')
            ->shouldBeCalled()
            ->willReturn($user)
        ;
        $user
            ->setUsername('openid_user')
            ->shouldBeCalled()
            ->willReturn($user)
        ;
        $user
            ->setEmail('openid_user@test.com')
            ->shouldBeCalled()
            ->willReturn($user)
        ;
        $user
            ->setEnabled(true)
            ->shouldBeCalled()
            ->willReturn($user)
        ;
        $extraMapper->map($user, $response)->shouldBeCalled();

        // We flush the new values.
        $userManager->updateUser($user)->shouldBeCalled();

        $this->loadUserByOAuthUserResponse($response)->shouldReturn($user);
    }

    public function it_loads_new_openid_redhat_user(
        UserResponseInterface $response,
        UserRepository $userRepository,
        OpenIDResourceOwner $ressourceOwner,
        UserManagerInterface $userManager,
        User $user,
        OpenIDExtraMapper $extraMapper,
        TokenStorageInterface $tokenStorage,
        TokenInterface $token
    ) {
        $this->generateGenericRedhatResponse($response, $ressourceOwner);
        $tokenStorage->getToken()->willReturn($token);
        $token->getUser()->willReturn(null);
        // We try to find a user that match the criterias, but could not find one.
        $userRepository
            ->findByAccessTokenOrUsername('openid_access_token', 'openid_id')
            ->willReturn(null)
        ;
        $userRepository->findOneByEmail('openid_user@test.com')->willReturn(null);

        $userManager
            ->createUser()
            ->shouldBeCalled()
            ->willReturn($user)
        ;
        $user->getId()->willReturn('<some uuid>');

        // Here we assert right values are set for the user.
        $user
            ->setOpenId('openid_id')
            ->shouldBeCalled()
            ->willReturn($user)
        ;
        $user
            ->setOpenIdAccessToken('openid_access_token')
            ->shouldBeCalled()
            ->willReturn($user)
        ;
        $user
            ->setUsername('openid_user')
            ->shouldBeCalled()
            ->willReturn($user)
        ;
        $user
            ->setEmail('openid_user@test.com')
            ->shouldBeCalled()
            ->willReturn($user)
        ;
        $user
            ->setEnabled(true)
            ->shouldBeCalled()
            ->willReturn($user)
        ;
        $extraMapper->map($user, $response)->shouldBeCalled();

        // We flush the new values.
        $userManager->updateUser($user)->shouldBeCalled();

        $this->loadUserByOAuthUserResponse($response)->shouldReturn($user);
    }

    public function it_loads_new_facebook_user(
        UserResponseInterface $response,
        UserRepository $userRepository,
        ResourceOwnerInterface $ressourceOwner,
        UserManagerInterface $userManager,
        User $user,
        TokenStorageInterface $tokenStorage,
        TokenInterface $token
    ) {
        $this->generateGenericFacebookResponse($response, $ressourceOwner);
        $tokenStorage->getToken()->willReturn($token);
        $token->getUser()->willReturn(null); // We try to find a user that match the criterias, but could not find one.
        $userRepository
            ->findByAccessTokenOrUsername('facebook_access_token', '2081576388576162')
            ->willReturn(null)
        ;
        $userRepository->findOneByEmail('facebook_2081576388576162')->willReturn(null);

        $userManager
            ->createUser()
            ->shouldBeCalled()
            ->willReturn($user)
        ;
        $user->getId()->willReturn('<some uuid>');

        // Here we assert right values are set for the user.
        $user->setFacebookId('2081576388576162')->shouldBeCalled();
        $user->setFacebookAccessToken('facebook_access_token')->shouldBeCalled();
        $user
            ->setUsername('facebook_user')
            ->shouldBeCalled()
            ->willReturn($user)
        ;
        $user
            ->setEmail(null)
            ->shouldBeCalled()
            ->willReturn($user)
        ;
        $user
            ->setEnabled(true)
            ->shouldBeCalled()
            ->willReturn($user)
        ;

        // We flush the new values.
        $userManager->updateUser($user)->shouldBeCalled();

        $this->loadUserByOAuthUserResponse($response)->shouldReturn($user);
    }

    public function it_loads_existing_openid_user(
        UserResponseInterface $response,
        UserRepository $userRepository,
        OpenIDResourceOwner $ressourceOwner,
        UserManagerInterface $userManager,
        User $user,
        TokenStorageInterface $tokenStorage,
        TokenInterface $token
    ) {
        $this->generateGenericOpenIdResponse($response, $ressourceOwner);
        $tokenStorage->getToken()->willReturn($token);
        $token->getUser()->willReturn(null);
        // We disable refresh user informations at every login
        $ressourceOwner->isRefreshingUserInformationsAtEveryLogin()->willReturn(false);

        // We try to find a user that match the criterias, and find one.
        $userRepository
            ->findByAccessTokenOrUsername('openid_access_token', 'openid_id')
            ->willReturn($user)
        ;
        $user->getId()->willReturn('<some uuid>');
        $user->getUsername()->willReturn('existing_username');

        // Here we assert right values are set for the user.
        $user
            ->setOpenId('openid_id')
            ->shouldBeCalled()
            ->willReturn($user)
        ;
        $user
            ->setOpenIdAccessToken('openid_access_token')
            ->shouldBeCalled()
            ->willReturn($user)
        ;

        // We flush the new values.
        $userManager->updateUser($user)->shouldBeCalled();

        $this->loadUserByOAuthUserResponse($response)->shouldReturn($user);
    }

    public function it_associates_a_user_to_franceconnect(
        UserResponseInterface $response,
        FranceConnectResourceOwner $ressourceOwner,
        UserManagerInterface $userManager,
        TokenStorageInterface $tokenStorage,
        TokenInterface $token,
        FranceConnectSSOConfigurationRepository $franceConnectSSOConfigurationRepository,
        FranceConnectSSOConfiguration $fcConfig,
        OAuthToken $OAuthToken,
        RedisCache $redisCache,
        ItemInterface $cacheItem,
        TranslatorInterface $translator
    ) {
        $this->generateGenericFranceConnectResponse($response, $ressourceOwner, $OAuthToken, $redisCache, $cacheItem, $translator);
        $user = new User();
        $user
            ->setId('<some uuid>')
            ->setFirstname('toto')
            ->setLastname('ala')
            ->setDateOfBirth(new \DateTime('1992-12-12'))
            ->setGender('m')
            ->setEmail('viewer@email.com')
            ->setUsername('toto')
        ;

        $tokenStorage->getToken()->willReturn($token);
        $token->getUser()->willReturn($user);
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
        // We try to find a user that match the criterias, and find one.
        $franceConnectSSOConfigurationRepository->find('franceConnect')->shouldBeCalled()->willReturn($fcConfig);
        $fcConfig->getAllowedData()->willReturn($allowedData);
        // We flush the new values.
        $userManager->updateUser($user)->shouldBeCalled();

        $this->loadUserByOAuthUserResponse($response)->shouldReturn($user);
    }

    public function it_loads_existing_openid_user_and_updates_values(
        UserResponseInterface $response,
        UserRepository $userRepository,
        OpenIDResourceOwner $ressourceOwner,
        UserManagerInterface $userManager,
        User $user,
        OpenIDExtraMapper $extraMapper,
        TokenStorageInterface $tokenStorage,
        TokenInterface $token
    ) {
        $this->generateGenericOpenIdResponse($response, $ressourceOwner);
        $tokenStorage->getToken()->willReturn($token);
        $token->getUser()->willReturn(null);
        $ressourceOwner->isRefreshingUserInformationsAtEveryLogin()->willReturn(true);
        $userRepository->findByAccessTokenOrUsername('openid_access_token', 'openid_id')->willReturn($user);
        $user->getId()->willReturn('<some uuid>');
        $user->getUsername()->willReturn(null);
        $user->setOpenId('openid_id')->shouldBeCalled()->willReturn($user);
        $user->setOpenIdAccessToken('openid_access_token')->shouldBeCalled()->willReturn($user);
        $user->setUsername('openid_user')->shouldBeCalled()->willReturn($user);
        $user->setEmail('openid_user@test.com')->shouldBeCalled()->willReturn($user);
        $extraMapper->map($user, $response)->shouldBeCalled();
        $userManager->updateUser($user)->shouldBeCalled();

        $this->loadUserByOAuthUserResponse($response)->shouldReturn($user);
    }

    public function it_maps_franceconnect_data(
        UserResponseInterface $response,
        User $user
    ) {
        $data = [];
        $data['given_name'] = 'toto';
        $data['family_name'] = 'ala';
        $data['birthplace'] = false;
        $data['birthdate'] = '1992-12-12';
        $data['gender'] = 'male';
        $data['email'] = 'toto@alapla.ge';
        $user->getFirstname()->willReturn(null);
        $user->getLastname()->willReturn(null);
        $user->getDateOfBirth()->willReturn(null);
        $user->getGender()->willReturn(null);
        $user->getUsername()->willReturn(null);
        $user->getEmail()->willReturn(null);

        $response->getData()->willReturn($data);
        $user->setFirstname(ucfirst(strtolower($data['given_name'])))->shouldBeCalled();
        $user->setUsername('ala Toto')->shouldBeCalled();
        $user->setLastname($data['family_name'])->shouldBeCalled();
        $user->setGender('m')->shouldBeCalled();
        $user->setEmail($data['email'])->shouldBeCalled();
        $birthday = \DateTime::createFromFormat('Y-m-d', $data['birthdate']) ?: null;
        if ($birthday) {
            $birthday->setTime(0, 0);
        }
        $user->setDateOfBirth($birthday)->shouldBeCalled();
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

        $this->mapFranceConnectData(
            $user->getWrappedObject(),
            $response->getWrappedObject(),
            $allowedData
        )->shouldReturn($user);
    }

    public function it_maps_franceconnect_data_with_username(UserResponseInterface $response, User $user)
    {
        $data = [];
        $data['given_name'] = 'toto';
        $data['family_name'] = 'ala';
        $data['birthplace'] = false;
        $data['birthdate'] = '1992-12-12';
        $data['gender'] = 'male';
        $data['preferred_username'] = 'toto_fc_username';
        $data['email'] = 'toto@alapla.ge';
        $user->getFirstname()->willReturn(null);
        $user->getLastname()->willReturn(null);
        $user->getDateOfBirth()->willReturn(null);
        $user->getGender()->willReturn(null);
        $user->getUsername()->willReturn(null);
        $user->getEmail()->willReturn(null);

        $response->getData()->willReturn($data);
        $user->setFirstname(ucfirst(strtolower($data['given_name'])))->shouldBeCalled();
        $user->setUsername('toto_fc_username')->shouldBeCalled();
        $user->setLastname($data['family_name'])->shouldBeCalled();
        $user->setGender('m')->shouldBeCalled();
        $user->setEmail($data['email'])->shouldBeCalled();
        $birthday = \DateTime::createFromFormat('Y-m-d', $data['birthdate']) ?: null;
        if ($birthday) {
            $birthday->setTime(0, 0);
        }

        $user->setDateOfBirth($birthday)->shouldBeCalled();
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

        $this->mapFranceConnectData(
            $user->getWrappedObject(),
            $response->getWrappedObject(),
            $allowedData
        )->shouldReturn($user);
    }

    public function it_doesnt_map_franceconnect_data_when_user_exists(UserResponseInterface $response, User $user)
    {
        $data = [];
        $data['given_name'] = 'toto';
        $data['family_name'] = 'titi';
        $data['birthplace'] = false;
        $data['birthdate'] = '1992-12-12';
        $data['gender'] = 'male';
        $data['preferred_username'] = 'toto_fc_username';
        $data['email'] = 'toto@alapla.ge';
        $user->getFirstname()->willReturn('TOTO_AVANT');
        $user->getLastname()->willReturn('ALA');
        $user->getDateOfBirth()->willReturn(\DateTime::createFromFormat('Y-m-d', '1990-10-10'));
        $user->getGender()->willReturn('mal');
        $user->getUsername()->willReturn('username');
        $user->getEmail()->willReturn('totoala@ferme.com');

        $response->getData()->willReturn($data);
        $user->setFirstname('Toto')->shouldBeCalled();
        $user->setUsername('toto_fc_username')->shouldNotBeCalled();
        $user->setLastname('titi')->shouldBeCalled();
        $user->setGender('m')->shouldBeCalled();
        $user->setEmail($data['email'])->shouldNotBeCalled();
        $user->setDateOfBirth()->shouldNotBeCalled();
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

        $this->mapFranceConnectData(
            $user->getWrappedObject(),
            $response->getWrappedObject(),
            $allowedData
        )->shouldReturn($user);
    }

    public function it_throws_exception_when_bad_state_nonce_franceconnect(
        UserResponseInterface $response,
        FranceConnectResourceOwner $ressourceOwner,
        TranslatorInterface $translator,
        OAuthToken $OAuthToken,
        RedisCache $redisCache,
        ItemInterface $cacheItem
    ) {
        $this->generateGenericFranceConnectResponse($response, $ressourceOwner, $OAuthToken, $redisCache, $cacheItem, $translator);

        $cacheItem->get()->willReturn(['state' => '12345', 'nonce' => '6664321']);

        $this->shouldThrow(new FranceConnectAuthenticationException('Erreur lors de la connexion à FranceConnect'))->during('verifyFranceConnectStateAndNonce', [$response]);
    }

    public function it_throws_exception_when_no_state_nonce_in_cache_franceconnect(
        UserResponseInterface $response,
        FranceConnectResourceOwner $ressourceOwner,
        TranslatorInterface $translator,
        OAuthToken $OAuthToken,
        RedisCache $redisCache,
        ItemInterface $cacheItem
    ) {
        $this->generateGenericFranceConnectResponse($response, $ressourceOwner, $OAuthToken, $redisCache, $cacheItem, $translator);

        $cacheItem->isHit()->willReturn(false);

        $this->shouldThrow(new FranceConnectAuthenticationException('Erreur lors de la connexion à FranceConnect'))->during('verifyFranceConnectStateAndNonce', [$response]);
    }

    public function it_throws_exception_when_franceconnect_token_has_expired(
        UserResponseInterface $response,
        FranceConnectResourceOwner $ressourceOwner,
        TranslatorInterface $translator,
        OAuthToken $OAuthToken,
        RedisCache $redisCache,
        ItemInterface $cacheItem
    ) {
        $this->generateGenericFranceConnectResponse($response, $ressourceOwner, $OAuthToken, $redisCache, $cacheItem, $translator);

        $data = [
            'status' => 'fail',
            'message' => 'token_not_found_or_expired',
        ];
        $response->getData()->willReturn($data);

        $translator->trans('france-connect-expired-token', Argument::type('array'), 'CapcoAppBundle')->willReturn('Erreur lors de la connexion à FranceConnect. Attention, vous disposez de seulement 60 secondes pour valider l\'association à FranceConnect');

        $this->shouldThrow(new FranceConnectAuthenticationException('Erreur lors de la connexion à FranceConnect'))->during('verifyFranceConnectResponse', [$response]);
    }

    private function generateGenericOpenIdResponse(
        UserResponseInterface $response,
        OpenIDResourceOwner $ressourceOwner
    ) {
        $ressourceOwner->getName()->willReturn('openid');
        $response->getEmail()->willReturn('openid_user@test.com');
        $response->getNickname()->willReturn('openid_user');
        $response->getAccessToken()->willReturn('openid_access_token');
        $response->getUsername()->willReturn('openid_id');
        $response->getResourceOwner()->willReturn($ressourceOwner);
        $response->getLastName()->willReturn('Smith');
        $response->getFirstName()->willReturn('jean');
        $response->getData()->willReturn(['email' => 'test@test.com']);
    }

    private function generateGenericRedhatResponse(
        UserResponseInterface $response,
        OpenIDResourceOwner $ressourceOwner
    ) {
        $this->generateGenericOpenIdResponse($response, $ressourceOwner);
        $response->getData()->willReturn(['mail' => 'redhatuser@test.com']);
    }

    private function generateGenericFacebookResponse(
        UserResponseInterface $response,
        ResourceOwnerInterface $ressourceOwner
    ) {
        $ressourceOwner->getName()->willReturn('facebook');
        $response->getEmail()->willReturn(null);
        $response->getNickname()->willReturn('facebook_user');
        $response->getAccessToken()->willReturn('facebook_access_token');
        $response->getUsername()->willReturn('2081576388576162');
        $response->getResourceOwner()->willReturn($ressourceOwner);
        $response->getLastName()->willReturn('Smith');
        $response->getFirstName()->willReturn('jean');
        $response->getData()->willReturn([]);
    }

    private function generateGenericFranceConnectResponse(
        UserResponseInterface $response,
        FranceConnectResourceOwner $ressourceOwner,
        OAuthToken $OAuthToken,
        RedisCache $redisCache,
        ItemInterface $cacheItem,
        TranslatorInterface $translator
    ) {
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
        $response->getData()->willReturn($data);
        $ressourceOwner->getName()->willReturn('franceconnect');
        $response->getEmail()->willReturn('jeanjacques@goldman.com');
        $response->getNickname()->willReturn('JJ');
        $response->getAccessToken()->willReturn('franceconnect_access_token');
        $response->getUsername()->willReturn('jj');
        $response->getResourceOwner()->willReturn($ressourceOwner);
        $response->getLastName()->willReturn('GoldMan');
        $response->getFirstName()->willReturn('Jean Jacques');
        $response->getOAuthToken()->willReturn($OAuthToken);
        $response->getExpiresIn()->willReturn(60);
        $state = base64_encode(json_encode((['csrf_token' => '12345'])));
        $nonce = base64_encode(json_encode(['nonce' => '54321']));
        $token = ['id_token' => $state . '.' . $nonce];
        $OAuthToken->getRawToken()->willReturn($token);

        $translator->trans('france-connect-connection-error', [], 'CapcoAppBundle')->willReturn('Erreur lors de la connexion à FranceConnect');
        $translator->trans('france-connect-connection-timeout', Argument::type('array'), 'CapcoAppBundle')->willReturn('Erreur lors de la connexion à FranceConnect. Attention, vous disposez de seulement 5 minutes pour vous connecter avec FranceConnect');

        $cacheItem->isHit()->willReturn(true);
        $cacheItem->get()->willReturn(['state' => '12345', 'nonce' => '54321']);
        $redisCache->getItem(Argument::type('string'))->willReturn($cacheItem);
    }
}
