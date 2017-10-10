<?php

namespace Capco\AppBundle\Utils;

use GuzzleHttp\Client;

final class Map
{
    private $apiServerKey;

    public function __construct(string $apiSeverKey)
    {
        $this->apiServerKey = $apiSeverKey;
    }

    public function getFormattedAddress($address)
    {
        $updatedAddress = null;

        $endpoint = "https://maps.googleapis.com/maps/api/geocode/json?address=$address&key=$this->apiServerKey";

        $client = new Client();
        $res = $client->request('GET', $endpoint);

        $content = json_decode($res->getBody()->getContents(), true);

        if ($content['status'] === 'OK') {
            $updatedAddress = json_encode([$content['results'][0]]);
        }

        return $updatedAddress;
    }
}
