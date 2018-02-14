<?php

namespace Capco\UserBundle\Manager;

use FOS\UserBundle\Model\UserInterface;

class MonCompteParisStrategy
{
    // protected $fosUserManager;
    //
    // public function __construct($fosUserManager)
    // {
    //     $this->fosUserManager = $fosUserManager;
    // }
    //
    // public function createUser(): UserInterface
    // {
    //     return $this->fosUserManager->createUser();
    // }
    //
    // public function confirmRegistration(UserInterface &$user, bool $isAdmin)
    // {
    //     $user->setEnabled(true);
    //     $this->createParisAccount($user);
    //     $this->fosUserManager->updateUser($user);
    // }

    // private function createParisAccount(UserInterface $user)
    // {
    //     $ch = curl_init();
    //     curl_setopt($ch, CURLOPT_URL, 'https://g98-gru-api-openam.rec.apps.paris.mdp/identity/rest/openam/api/1/accounts');
    //     curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    //     curl_setopt($ch, CURLOPT_POSTFIELDS, 'mail=' . $user->getEmail() . '&userPassword=' . $user->getPlainPassword());
    //     curl_setopt($ch, CURLOPT_POST, 1);
    //     curl_setopt($ch, CURLOPT_HTTPHEADER, [
    //     'Client-Id: test_dicom_manager',
    //     'Secret-Id: test_dicom_manager',
    //     'Content-Type: application/x-www-form-urlencoded; charset=UTF-8',
    //   ]);
    //
    //     $result = curl_exec($ch);
    //     if (curl_errno($ch)) {
    //         echo 'Error:' . curl_error($ch);
    //         throw new \Exception('Could not create MonCompteParis account.');
    //     }
    //     $json = json_decode($result, true);
    //     $user->setParisId($json['result']['uid']);
    //     curl_close($ch);
    // }
    //
    // private function authenticate(string $email, string $password)
    // {
    //     $ch = curl_init();
    //
    //     curl_setopt($ch, CURLOPT_URL, 'https://v69.rec.apps.paris.fr/v69/json/authenticate');
    //     curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    //     curl_setopt($ch, CURLOPT_POST, 1);
    //
    //     $headers = [];
    //     $headers[] = 'X-Openam-Username: ' . $email;
    //     $headers[] = 'X-Openam-Password: ' . $password;
    //     curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    //
    //     $result = curl_exec($ch);
    //     if (curl_errno($ch)) {
    //         echo 'Error:' . curl_error($ch);
    //     }
    //     $json = json_decode($result, true);
    //     $tokenId = $json['result']['uid'];
    //     curl_close($ch);
    // }
}
