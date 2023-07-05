<?php

namespace Capco\UserBundle\OpenID\ExtraMapper;

use Capco\UserBundle\Entity\User;
use HWI\Bundle\OAuthBundle\OAuth\Response\UserResponseInterface;
use Psr\Log\LoggerInterface;

class GrandLyonExtraMapper
{
    protected User $user;
    protected array $userInfoData;
    protected LoggerInterface $logger;

    public function __invoke(
        User $user,
        UserResponseInterface $response,
        LoggerInterface $logger
    ): void {
        $this->user = $user;
        $this->logger = $logger;
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
