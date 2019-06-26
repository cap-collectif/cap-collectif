<?php

namespace Capco\UserBundle\OpenID\ExtraMapper;

use Capco\UserBundle\Entity\User;
use HWI\Bundle\OAuthBundle\OAuth\Response\UserResponseInterface;

class OccitanieExtraMapper
{
    /**
     * @var User
     */
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

        if (isset($this->userInfoData['birthday'])) {
            $birthday =
                \DateTime::createFromFormat('d/m/Y', $this->userInfoData['birthday']) ?: null;

            if ($birthday) {
                $birthday->setTime(0, 0);
            }
        }

        $this->user->setDateOfBirth($birthday);
    }

    /**
     * Data example from response:
     * "{"name":"Toulouse","code":"31555","departement":"31","coordinates":{"long":1.4383100000000002,"lat":43.60790065616799}}".
     */
    private function setCity(): void
    {
        $city = null;
        $zipCode = null;

        if (isset($this->userInfoData['city'])) {
            $cityFromResponse = \GuzzleHttp\json_decode($this->userInfoData['city'], true);
            $city = $cityFromResponse['name'] ?? null;
            $zipCode = $cityFromResponse['code'] ?? null;
        }

        $this->user->setZipCode($zipCode);
        $this->user->setCity($city);
    }
}
