<?php

namespace Capco\UserBundle\Security\Core\User;

use Doctrine\Common\Util\ClassUtils;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\UserBundle\OpenID\OpenIDExtraMapper;
use FOS\UserBundle\Model\UserManagerInterface;
use Capco\UserBundle\Repository\UserRepository;
use Capco\AppBundle\GraphQL\Mutation\GroupMutation;
use Symfony\Component\Security\Core\User\UserInterface;
use HWI\Bundle\OAuthBundle\OAuth\Response\UserResponseInterface;
use HWI\Bundle\OAuthBundle\Security\Core\User\FOSUBUserProvider;
use Capco\AppBundle\Repository\FranceConnectSSOConfigurationRepository;

class OauthUserProvider extends FOSUBUserProvider
{
    protected OpenIDExtraMapper $extraMapper;
    private Indexer $indexer;
    private UserRepository $userRepository;
    private GroupMutation $groupMutation;
    private FranceConnectSSOConfigurationRepository $franceConnectSSOConfigurationRepository;

    public function __construct(
        UserManagerInterface $userManager,
        UserRepository $userRepository,
        OpenIDExtraMapper $extraMapper,
        Indexer $indexer,
        array $properties,
        GroupMutation $groupMutation,
        FranceConnectSSOConfigurationRepository $franceConnectSSOConfigurationRepository
    ) {
        $this->userRepository = $userRepository;
        $this->extraMapper = $extraMapper;
        $this->indexer = $indexer;
        $this->groupMutation = $groupMutation;
        $this->franceConnectSSOConfigurationRepository = $franceConnectSSOConfigurationRepository;

        parent::__construct($userManager, $properties);
    }

    public function connect(UserInterface $user, UserResponseInterface $response): void
    {
        $email = $response->getEmail() ?: $response->getUsername();

        //on connect - get the access token and the user ID
        $service = $response->getResourceOwner()->getName();
        $setter = 'set' . ucfirst($service);
        $setterId = 'openid' === $service ? $setter : $setter . 'Id';
        $setterToken = $setter . 'AccessToken';

        //we "disconnect" previously connected users
        if (
            null !==
            ($previousUser = $this->userRepository->findByEmailOrAccessTokenOrUsername(
                $email,
                $response->getAccessToken(),
                $response->getUsername()
            ))
        ) {
            $previousUser->{$setterId}(null);
            $previousUser->{$setterToken}(null);
            $this->userManager->updateUser($previousUser);
        }

        //we connect current user
        $user->{$setterId}($response->getUsername());
        $user->{$setterToken}($response->getAccessToken());
        $this->userManager->updateUser($user);
    }

    // TODO we need a unit test on France Connect behavior
    public function loadUserByOAuthUserResponse(UserResponseInterface $response): UserInterface
    {
        $email = $response->getEmail() ?: 'twitter_' . $response->getUsername();
        $username =
            $response->getNickname() ?: $response->getFirstName() . ' ' . $response->getLastName();
        // because, accounts created with FranceConnect can change their email
        $user = $this->userRepository->findByEmailOrAccessTokenOrUsername(
            $email,
            $response->getAccessToken(),
            $response->getUsername()
        );
        $isNewUser = false;
        if (null === $user) {
            $isNewUser = true;
            $user = $this->userManager->createUser();
            $user->setUsername($username);
            $user->setEmail($email);
            $user->setEnabled(true);
        }

        $ressourceOwner = $response->getResourceOwner();

        $serviceName = $ressourceOwner->getName();
        $setter = 'set' . ucfirst($serviceName);
        $setterId = 'openid' === $serviceName ? $setter : $setter . 'Id';
        $setterToken = $setter . 'AccessToken';

        if ('openid' === $serviceName) {
            $needMapping =
                $isNewUser || $ressourceOwner->isRefreshingUserInformationsAtEveryLogin();
            if ($needMapping) {
                $user->setUsername($username);
                $user->setEmail($email);
                $this->extraMapper->map($user, $response);
            }
        }
        if ('franceconnect' === $serviceName && ($isNewUser || !$user->getFranceConnectId())) {
            $fcConfig = $this->franceConnectSSOConfigurationRepository->find('franceConnect');

            // in next time, we can associate franceConnect after manually create account, so we have to dissociate if it's a new account or not
            $user = $this->map($user, $response, $fcConfig->getAllowedData());
        }

        $user->{$setterId}($response->getUsername());
        $user->{$setterToken}($response->getAccessToken());
        $this->userManager->updateUser($user);
        if ($isNewUser) {
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
    public function map(
        UserInterface $user,
        UserResponseInterface $userResponse,
        array $allowedData
    ): UserInterface {
        $userInfoData = $userResponse->getData();
        $firstName = ucfirst(strtolower($userInfoData['given_name']));
        if ($allowedData['given_name']) {
            $user->setFirstName($firstName);
        }
        if ($allowedData['family_name']) {
            $user->setLastName($userInfoData['family_name']);
        }

        if ($allowedData['birthdate']) {
            $birthday = \DateTime::createFromFormat('Y-m-d', $userInfoData['birthdate']) ?: null;
            if ($birthday) {
                $birthday->setTime(0, 0);
            }
            $user->setDateOfBirth($birthday);
        }
        if ($allowedData['birthplace']) {
            if (isset($userInfoData['birthplace'])) {
                $user->setBirthPlace($userInfoData['birthplace']);
            }
        }
        if ($allowedData['gender']) {
            $gender = 'o';

            if ('female' === $userInfoData['gender']) {
                $gender = 'f';
            }
            if ('male' === $userInfoData['gender']) {
                $gender = 'm';
            }
            $user->setGender($gender);
        }
        if ($allowedData['email']) {
            $user->setEmail($userInfoData['email']);
        }

        if ($allowedData['preferred_username'] && !empty($userInfoData['preferred_username'])) {
            $user->setUsername($userInfoData['preferred_username']);
        } else {
            $user->setUsername($userInfoData['family_name'] . ' ' . $firstName);
        }

        return $user;
    }
}
