<?php

namespace Capco\UserBundle\Security\Core\User;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\GraphQL\Mutation\GroupMutation;
use Capco\UserBundle\FranceConnect\FranceConnectMapper;
use Capco\UserBundle\OpenID\OpenIDExtraMapper;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\Common\Util\ClassUtils;
use FOS\UserBundle\Model\UserManagerInterface;
use HWI\Bundle\OAuthBundle\OAuth\Response\UserResponseInterface;
use HWI\Bundle\OAuthBundle\Security\Core\User\FOSUBUserProvider;
use Symfony\Component\Security\Core\User\UserInterface;

class OauthUserProvider extends FOSUBUserProvider
{
    protected OpenIDExtraMapper $extraMapper;
    private Indexer $indexer;
    private UserRepository $userRepository;
    private GroupMutation $groupMutation;

    public function __construct(
        UserManagerInterface $userManager,
        UserRepository $userRepository,
        OpenIDExtraMapper $extraMapper,
        Indexer $indexer,
        array $properties,
        GroupMutation $groupMutation
    ) {
        $this->userRepository = $userRepository;
        $this->extraMapper = $extraMapper;
        $this->indexer = $indexer;
        $this->groupMutation = $groupMutation;

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
            ($previousUser = $this->userRepository->findByEmailOrAccessToken(
                $email,
                $response->getAccessToken()
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

    public function loadUserByOAuthUserResponse(UserResponseInterface $response): UserInterface
    {
        $email = $response->getEmail() ?: 'twitter_' . $response->getUsername();
        $username =
            $response->getNickname() ?: $response->getFirstName() . ' ' . $response->getLastName();
        // because, accounts created with FranceConnect can change their email
        $user = $this->userRepository->findByEmailOrAccessToken(
            $email,
            $response->getAccessToken()
        );
        $isNewUser = false;
        if (null === $user) {
            $isNewUser = true;
            $user = $this->userManager->createUser();
            $user->setUsername($username);
            $user->setEmail($email);
            $user->setEnabled(true);
        }

        $service = $response->getResourceOwner()->getName();
        $setter = 'set' . ucfirst($service);
        $setterId = 'openid' === $service ? $setter : $setter . 'Id';
        $setterToken = $setter . 'AccessToken';

        if ('openid' === $service && $isNewUser) {
            $this->extraMapper->map($user, $response);
        } elseif ('franceconnect' === $service && ($isNewUser || !$user->getFranceConnectId())) {
            // in next time, we can associate franceConnect after manually create account, so we have to dissociate if it's a new account or not
            FranceConnectMapper::map($user, $response);
        }

        $user->{$setterId}($response->getUsername());
        $user->{$setterToken}($response->getAccessToken());
        $this->userManager->updateUser($user);
        if ($isNewUser) {
            $this->indexer->index(ClassUtils::getClass($user), $user->getId());
            $this->indexer->finishBulk();
        }
        $this->groupMutation->createAndAddUserInGroup($user, 'SSO');

        return $user;
    }

    protected function randomString(int $length): string
    {
        $key = '';
        $keys = array_merge(range(0, 9), range('a', 'Z'));

        for ($i = 0; $i < $length; ++$i) {
            $key .= $keys[array_rand($keys)];
        }

        return $key;
    }
}
