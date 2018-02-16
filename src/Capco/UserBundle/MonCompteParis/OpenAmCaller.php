<?php

namespace Capco\UserBundle\MonCompteParis;

class OpenAmCaller
{
    protected $baseApiUrl = 'https://moncompte.paris.fr/v69/json/';
    protected $cookie = null;

    public function setCookie(string $cookie)
    {
        $this->cookie = $cookie;
    }

    public function getUid(): string
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->baseApiUrl . 'sessions/' . $this->cookie . '?_action=validate');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);

        $headers = [];
        $headers[] = 'Content-Type: application/json';
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $result = curl_exec($ch);
        if (curl_errno($ch)) {
            echo 'Error:' . curl_error($ch);
        }
        curl_close($ch);

        $json = json_decode($result, true);

        return $json['uid'];
    }

    // OR http://fr.lutece.paris.fr/fr/wiki/gru-appeldirect-identitystore.html
    public function getUserInformations(string $uid)
    {
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $this->baseApiUrl . 'users/' . $uid);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');

        $headers = [];
        $headers[] = 'mcpAuth: ' . $this->cookie;
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $result = curl_exec($ch);
        if (curl_errno($ch)) {
            echo 'Error:' . curl_error($ch);
        }
        curl_close($ch);
        $json = json_decode($result, true);

        return [
          'username' => $json['username'],
          'mail' => $json['mail'][0],
        ];
    }
}
