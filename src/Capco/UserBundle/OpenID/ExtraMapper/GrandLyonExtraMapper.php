<?php

namespace Capco\UserBundle\OpenID\ExtraMapper;

use Capco\UserBundle\Entity\User;
use HWI\Bundle\OAuthBundle\OAuth\Response\UserResponseInterface;

class GrandLyonExtraMapper
{
    protected $user;
    protected $userInfoData;

    public function __invoke(User $user, UserResponseInterface $response): void
    {
        $this->user = $user;
        $this->userInfoData = $response->getData();

        $this->setBirthday();
        $this->setCity();
    }

    private function setBirthday(): void
    {
        $birthday = null;

        if (isset($this->userInfoData['birthdate'])) {
            $birthday =
                \DateTime::createFromFormat('Y-m-d', $this->userInfoData['birthdate']) ?: null;

            if ($birthday) {
                $birthday->setTime(0, 0);
            }
        }

        $this->user->setDateOfBirth($birthday);
    }

    private function setCity(): void
    {
        $city = $this->userInfoData['birthplace'] ?? null;
        $this->user->setCity($city);
    }
}
