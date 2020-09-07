<?php

namespace Capco\UserBundle\FranceConnect;

use FOS\UserBundle\Model\UserInterface;
use HWI\Bundle\OAuthBundle\OAuth\Response\UserResponseInterface;

class FranceConnectMapper
{
    /**
     * https://partenaires.franceconnect.gouv.fr/fcp/fournisseur-service#identite-pivot.
     */
    public static function map(UserInterface $user, UserResponseInterface $userResponse): void
    {
        $userInfoData = $userResponse->getData();

        $birthday = \DateTime::createFromFormat('Y-m-d', $userInfoData['birthdate']) ?: null;
        if ($birthday) {
            $birthday->setTime(0, 0);
        }
        $user->setDateOfBirth($birthday);
        $firstName = ucfirst(strtolower($userInfoData['given_name']));
        $user->setFirstName($firstName);
        $user->setLastName($userInfoData['family_name']);
        $user->setUsername($userInfoData['family_name'] . ' ' . $firstName);
        if (isset($userInfoData['birthplace'])) {
            $user->setBirthPlace($userInfoData['birthplace']);
        }
        $gender = 'o';
        if ('female' === $userInfoData['gender']) {
            $gender = 'f';
        }
        if ('male' === $userInfoData['gender']) {
            $gender = 'm';
        }
        $user->setGender($gender);
    }
}
