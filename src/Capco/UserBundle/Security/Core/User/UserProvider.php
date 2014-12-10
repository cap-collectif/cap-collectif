<?php

namespace Capco\UserBundle\Security\Core\User;

use HWI\Bundle\OAuthBundle\OAuth\Response\UserResponseInterface;
use HWI\Bundle\OAuthBundle\Security\Core\User\FOSUBUserProvider;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * Class UserProvider
 * @package Capco\UserBundle\Security\Core\User
 */
class UserProvider extends FOSUBUserProvider
{
    /**
     * {@inheritDoc}
     */
    public function connect(UserInterface $user, UserResponseInterface $response)
    {
        $property = $this->getProperty($response);
        $username = $response->getUsername();

        //on connect - get the access token and the user ID
        $service = $response->getResourceOwner()->getName();
        $setter = 'set' . ucfirst($service);
        $setter_id = $setter . 'Id';
        $setter_token = $setter . 'AccessToken';

        //we "disconnect" previously connected users
        if (null !== $previousUser = $this->userManager->findUserBy(array($property => $username))) {
            $previousUser->$setter_id(null);
            $previousUser->$setter_token(null);
            $this->userManager->updateUser($previousUser);
        }

        //we connect current user
        $user->$setter_id($username);
        $user->$setter_token($response->getAccessToken());
        $this->userManager->updateUser($user);
    }

    /**
     * {@inheritdoc}
     *
     */
    public function loadUserByOAuthUserResponse(UserResponseInterface $response)
    {
        $username = $response->getUsername();
        $user = $this->userManager->findUserBy(array($this->getProperty($response) => $username));

        if (null === $user) {
            $user = $this->userManager->findUserByEmail($response->getEmail());
        }
        if (null === $user) {

            $user = $this->userManager->createUser();
            $user->setUsername($response->getNickname());
            $user->setEmail($response->getEmail());
            $user->setPlainPassword(self::random_string(20));
            $user->setEnabled(true);
            $user->setIsTermsAccepted(true);
        }

        $service = $response->getResourceOwner()->getName();
        $setter = 'set' . ucfirst($service);
        $setter_id = $setter . 'Id';
        $setter_token = $setter . 'AccessToken';
        $user->$setter_id($username);
        $user->$setter_token($response->getAccessToken());

        $this->userManager->updateUser($user);

        return $user;
    }

    /**
     * @param $length
     * @return string
     */
    protected function random_string($length) {
        $key = '';
        $keys = array_merge(range(0, 9), range('a', 'Z'));

        for ($i = 0; $i < $length; $i++) {
            $key .= $keys[array_rand($keys)];
        }

        return $key;
    }

}