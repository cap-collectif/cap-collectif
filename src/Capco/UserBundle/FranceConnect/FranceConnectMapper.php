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

        $user->setGender(mb_strtolower($userInfoData['gender']));
    }
}
