<?php

namespace Capco\UserBundle\Security\Core\User;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Exception\FranceConnectAuthenticationException;
use Capco\AppBundle\GraphQL\Mutation\GroupMutation;
use Capco\AppBundle\Repository\FranceConnectSSOConfigurationRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\FranceConnect\FranceConnectOptionsModifier;
use Capco\UserBundle\FranceConnect\FranceConnectResourceOwner;
use Capco\UserBundle\Handler\UserInvitationHandler;
use Capco\UserBundle\OpenID\OpenIDExtraMapper;
use Capco\UserBundle\OpenID\OpenIDResourceOwner;
use Capco\UserBundle\Repository\UserRepository;
use Capco\UserBundle\Security\Http\Logout\Handler\FranceConnectLogoutHandler;
use Doctrine\Common\Util\ClassUtils;
use FOS\UserBundle\Model\UserManagerInterface;
use HWI\Bundle\OAuthBundle\OAuth\Response\UserResponseInterface;
use HWI\Bundle\OAuthBundle\OAuth\State\State;
use HWI\Bundle\OAuthBundle\Security\Core\User\OAuthAwareUserProviderInterface;
use Psr\Cache\InvalidArgumentException;
use Psr\Log\LoggerInterface;
use Symfony\Component\Cache\CacheItem;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class OauthUserProvider implements OAuthAwareUserProviderInterface
{
    private bool $isNewUser = false;
    /**
     * @var array<string, string>
     */
    private array $properties = ['identifier' => 'id'];

    public function __construct(
        private readonly UserManagerInterface $userManager,
        private readonly UserRepository $userRepository,
        protected OpenIDExtraMapper $extraMapper,
        private readonly Indexer $indexer,
        array $properties,
        private readonly GroupMutation $groupMutation,
        private readonly FranceConnectSSOConfigurationRepository $franceConnectSSOConfigurationRepository,
        private readonly LoggerInterface $logger,
        private readonly UserInvitationHandler $userInvitationHandler,
        private readonly TokenStorageInterface $tokenStorage,
        private readonly RequestStack $requestStack,
        private readonly RedisCache $redisCache,
        private readonly TranslatorInterface $translator,
        private readonly RouterInterface $router,
        private readonly string $instanceName
    ) {
        $this->properties = array_merge($this->properties, $properties);
    }

    public function connect(UserInterface $user, UserResponseInterface $response): void
    {
        if ($response->getResourceOwner() instanceof FranceConnectResourceOwner) {
            try {
                $this->verifyFranceConnectResponse($response);
            } catch (FranceConnectAuthenticationException) {
                return;
            }
        }

        $email = $this->isCatpInstance()
            ? ($this->getCatpEmailFromResponse($response) ?: $response->getUsername())
            : ($response->getEmail() ?: $response->getUsername());
        //on connect - get the access token and the user ID
        $service = $response->getResourceOwner()->getName();
        $setter = 'set' . ucfirst($service);
        $setterId = 'openid' === $service ? $setter : $setter . 'Id';
        $setterToken = $setter . 'AccessToken';

        if ('franceconnect' === $service && $user instanceof User) {
            $userInfoData = $response->getData();
            $emailFromFranceConnect = $userInfoData['email'] ?? null;
            $idToken = $response->getOAuthToken()->getRawToken()['id_token'] ?? null;
            $request = $this->requestStack->getCurrentRequest();

            if (
                null !== $user->getEmail()
                && null !== $emailFromFranceConnect
                && $emailFromFranceConnect !== $user->getEmail()
            ) {
                if ($request) {
                    $homepageUrl = $this->router->generate('app_homepage', [], RouterInterface::ABSOLUTE_URL);
                    $profileUrl = $this->router->generate('capco_profile_edit', [], RouterInterface::ABSOLUTE_URL) . '#account';
                    FranceConnectLogoutHandler::storeImmediateFranceConnectSession(
                        $request,
                        \is_string($idToken) ? $idToken : '',
                        $homepageUrl
                    );
                    FranceConnectLogoutHandler::storeAfterLogoutRedirectUrl($request, $profileUrl);
                }
                $this->requestStack
                    ->getSession()
                    ->getFlashBag()
                    ->add('danger', $this->translator->trans('france-connect-error-retrieving-user-info'))
                ;

                return;
            }
        }

        //we "disconnect" previously connected users
        if (null !== ($previousUser = $this->findUser($response, $email))) {
            $previousUser->{$setterId}(null);
            $previousUser->{$setterToken}(null);
            $this->userManager->updateUser($previousUser);
        }

        //we connect current user
        $user->{$setterId}($response->getUsername());
        $user->{$setterToken}($response->getAccessToken());
        if ('franceconnect' === $service && $user instanceof User) {
            $idToken = $response->getOAuthToken()->getRawToken()['id_token'] ?? null;
            $user->setFranceConnectIdToken($idToken);
            $request = $this->requestStack->getCurrentRequest();
            if ($request && \is_string($idToken) && '' !== $idToken) {
                FranceConnectLogoutHandler::storeFranceConnectSession(
                    $request,
                    $idToken
                );
            }
        }
        $this->userManager->updateUser($user);
    }

    public function loadUserByOAuthUserResponse(UserResponseInterface $response): UserInterface
    {
        $ressourceOwner = $response->getResourceOwner();

        if ($ressourceOwner instanceof FranceConnectResourceOwner) {
            $this->verifyFranceConnectStateAndNonce($response);
        }

        $serviceName = $ressourceOwner->getName();
        $viewer = $this->tokenStorage->getToken()
            ? $this->tokenStorage->getToken()->getUser()
            : null;

        $user = $this->getUser($response, $viewer);
        $this->userManager->updateUser($user);
        if ($this->isNewUser) {
            $this->indexer->index(ClassUtils::getClass($user), $user->getId());
            $this->indexer->finishBulk();
        }
        $this->groupMutation->createAndAddUserInGroup($user, 'SSO');
        $this->groupMutation->createAndAddUserInGroup($user, 'SSO ' . $serviceName);

        return $user;
    }

    /**
     * https://partenaires.franceconnect.gouv.fr/fcp/fournisseur-service#identite-pivot.
     */
    public function mapFranceConnectData(
        User $user,
        UserResponseInterface $userResponse,
        array $allowedData
    ): User {
        $userInfoData = $userResponse->getData();
        $firstName = ucfirst(strtolower((string) $userInfoData['given_name']));
        if (!empty($allowedData['given_name'])) {
            $user->setFirstName($firstName);
        }
        if (!empty($allowedData['family_name'])) {
            $user->setLastName($userInfoData['family_name']);
        }

        if (!empty($allowedData['birthdate'])) {
            $birthday = (null !== $userInfoData['birthdate'])
                ? \DateTime::createFromFormat('Y-m-d', $userInfoData['birthdate'])
                : null;
            if ($birthday) {
                $birthday->setTime(0, 0);
            }
            $user->setDateOfBirth($birthday);
        }
        if (!empty($allowedData['birthplace'])) {
            if (!empty($userInfoData['birthplace'])) {
                $user->setBirthPlace($userInfoData['birthplace']);
            }
        }
        if (!empty($allowedData['gender'])) {
            $gender = 'o';

            if ('female' === $userInfoData['gender']) {
                $gender = 'f';
            }
            if ('male' === $userInfoData['gender']) {
                $gender = 'm';
            }
            $user->setGender($gender);
        }
        if (!empty($allowedData['email']) && !$user->getEmail()) {
            $user->setEmail($userInfoData['email']);
        }

        if (!$user->getUsername()) {
            if (!empty($allowedData['preferred_username']) && !empty($userInfoData['preferred_username'])) {
                $user->setUsername($userInfoData['preferred_username']);
            } else {
                $user->setUsername($userInfoData['family_name'] . ' ' . $firstName);
            }
        }

        return $user;
    }

    /**
     * @throws FranceConnectAuthenticationException
     */
    public function verifyFranceConnectResponse(UserResponseInterface $response): void
    {
        $responseData = $response->getData();
        $service = $response->getResourceOwner()->getName();

        if ($responseData && isset($responseData['status']) && 'fail' === $responseData['status']) {
            $errorMessage = $responseData['message'];

            switch ($errorMessage) {
                case 'token_not_found_or_expired':
                    $message = $this->translator->trans(
                        'france-connect-expired-token',
                        ['n' => ($response->getExpiresIn())],
                        'CapcoAppBundle'
                    );

                    break;

                default:
                    $this->logger->error(sprintf('Unexpected error while logging with "%service": "%s"', $service, $errorMessage));

                    $message = $this->translator->trans('france-connect-connection-error');
            }

            $this->requestStack->getSession()->getFlashBag()->add('danger', $message);

            throw new FranceConnectAuthenticationException($this->translator->trans('france-connect-connection-error'));
        }
    }

    /**
     * @throws FranceConnectAuthenticationException|InvalidArgumentException
     */
    public function verifyFranceConnectStateAndNonce(UserResponseInterface $response): void
    {
        $request = $this->requestStack->getCurrentRequest();
        $csrf = (new State($request->query->get('state')))->getCsrfToken();
        $rawToken = $response->getOAuthToken()->getRawToken();
        $franceConnectJwtToken = $rawToken['id_token'];
        $tokenParts = explode('.', (string) $franceConnectJwtToken);
        $tokenPayload = json_decode(base64_decode($tokenParts[1]), true) ?? null;
        $nonce = $tokenPayload['nonce'] ?? null;
        $this->requestStack->getSession()->remove(FranceConnectOptionsModifier::SESSION_FRANCE_CONNECT_STATE_KEY);

        /** * @var CacheItem $fcTokens  */
        $fcTokens = $this->redisCache
            ->getItem(FranceConnectOptionsModifier::REDIS_FRANCE_CONNECT_TOKENS_CACHE_KEY . '-' . $this->requestStack->getSession()->getId())
        ;

        if (!$fcTokens->isHit()) {
            // Redis token has expired or does not exist.
            $this->requestStack->getSession()->getFlashBag()->add(
                'danger',
                $this->translator->trans(
                    'france-connect-connection-timeout',
                    ['n' => FranceConnectOptionsModifier::FRANCE_CONNECT_CONNECTION_MAX_TIME],
                    'CapcoAppBundle'
                )
            );

            throw new FranceConnectAuthenticationException($this->translator->trans('france-connect-connection-error'));
        }

        $tokenData = $fcTokens->get();

        if ($tokenData['nonce'] !== $nonce || $tokenData['state'] !== $csrf) {
            // State or nonce are wrong: it might be a fraudulent attempt.
            $this->requestStack->getSession()->getFlashBag()->add(
                'danger',
                $this->translator->trans('france-connect-connection-error')
            );
            $this->logger->error('state or nonce token does not match the one given by the server');

            throw new FranceConnectAuthenticationException($this->translator->trans('france-connect-connection-error'));
        }
    }

    private function findUser(UserResponseInterface $response, ?string $email = null): ?User
    {
        $user = $this->userRepository->findByAccessTokenOrUsername(
            $response->getAccessToken(),
            $response->getUsername()
        );

        return !$user && $email ? $this->userRepository->findOneByEmail($email) : $user;
    }

    private function getUser(UserResponseInterface $response, ?User $viewer = null): User
    {
        $resourceOwner = $response->getResourceOwner();
        $serviceName = $resourceOwner->getName();

        $email = $this->isCatpInstance()
            ? $this->getCatpEmailFromResponse($response)
            : ($response->getEmail() ?? ($response->getData()['mail'] ?? ($response->getData()['email'] ?? null)));
        $ssoIsFacebookOrOpenId = \in_array($serviceName, ['facebook', 'openid']);

        if (!$email && !$ssoIsFacebookOrOpenId) {
            $email = $serviceName . '_' . $response->getUsername();
        }
        $user = $viewer instanceof User ? $viewer : $this->findUser($response, $email);

        $username = $user?->getUsername() ?? $this->getUsername($response);

        if (null === $user) {
            $this->isNewUser = true;
            $user = $this->userManager->createUser();
            $user->setUsername($username);
            $user->setEmail($email);
            $user->setEnabled(true);
            $this->userInvitationHandler->handleUserInvite($user);
            $this->userInvitationHandler->handleUserOrganizationInvite($user);
            $this->userManager->updateUser($user);
        }

        $setter = 'set' . ucfirst($serviceName);
        $setterId = 'openid' === $serviceName ? $setter : $setter . 'Id';
        $setterToken = $setter . 'AccessToken';

        if ('openid' === $serviceName && $resourceOwner instanceof OpenIDResourceOwner) {
            $needMapping =
                $this->isNewUser || $resourceOwner->isRefreshingUserInformationsAtEveryLogin();
            if ($needMapping) {
                $user->setUsername($username);
                $user->setEmail($email);
                $this->extraMapper->map($user, $response);
            }
        }
        if (
            'franceconnect' === $serviceName
            && $user instanceof User
        ) {
            if ($this->isNewUser || !$user->getFranceConnectId()) {
                $fcConfig = $this->franceConnectSSOConfigurationRepository->find('franceConnect');

                // in next time, we can associate franceConnect after manually create account, so we have to dissociate if it's a new account or not
                $user = $this->mapFranceConnectData($user, $response, $fcConfig->getAllowedData());
            }
            $idToken = $response->getOAuthToken()->getRawToken()['id_token'] ?? null;
            $user->setFranceConnectIdToken($idToken);
            $request = $this->requestStack->getCurrentRequest();
            if ($request && \is_string($idToken) && '' !== $idToken) {
                FranceConnectLogoutHandler::storeFranceConnectSession(
                    $request,
                    $idToken
                );
            }
        }

        $user->{$setterId}($response->getUsername());
        $user->{$setterToken}($response->getAccessToken());

        return $user;
    }

    private function getUsername(UserResponseInterface $response): string
    {
        $nickname = $response->getNickname();

        if ($nickname) {
            return trim($nickname);
        }

        $firstName = $response->getFirstName();
        $lastName = $response->getLastName();

        if (!$firstName || !$lastName) {
            return '';
        }

        if (str_contains($this->instanceName, 'occitanie')) {
            return sprintf('%s%s%s', strtoupper(substr($firstName, 0, 1)), strtoupper(substr($lastName, 0, 1)), substr(bin2hex(random_bytes(2)), 0, 4));
        }

        return trim("{$firstName} {$lastName}");
    }

    private function isCatpInstance(): bool
    {
        return 'catp' === $this->instanceName;
    }

    private function getCatpEmailFromResponse(UserResponseInterface $response): ?string
    {
        $data = $response->getData();
        $data = \is_array($data) ? $data : [];

        $candidateEmails = [
            $response->getEmail(),
            $data['mail'] ?? null,
            $data['email'] ?? null,
            $data['other email'] ?? null,
            $data['other_email'] ?? null,
        ];

        foreach ($candidateEmails as $candidateEmail) {
            if (\is_string($candidateEmail) && '' !== trim($candidateEmail)) {
                return trim($candidateEmail);
            }
        }

        return null;
    }
}
