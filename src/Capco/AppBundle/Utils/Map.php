<?php

namespace Capco\AppBundle\Utils;

use GuzzleHttp\Client;

final class Map
{
    private string $apiServerKey;

    public function __construct(string $apiSeverKey)
    {
        $this->apiServerKey = $apiSeverKey;
    }

    public function getFormattedAddress(string $address)
    {
        $updatedAddress = null;

        $endpoint = "https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key={$this->apiServerKey}";

        $client = new Client();
        $res = $client->request('GET', $endpoint);

        $content = json_decode($res->getBody()->getContents(), true);

        if ('OK' === $content['status']) {
            $updatedAddress = json_encode([$content['results'][0]]);
        }

        return $updatedAddress;
    }

    public static function decodeAddressFromJson(string $address)
    {
        if (!\is_array($address)) {
            if (null !== json_decode($address, true)) {
                return json_decode($address, true)[0]['formatted_address'];
            }

            return '';
        }

        return $address[0]['formatted_address'];
    }

    public function reverserGeocodingAddress(float $lat, float $lng)
    {
        $updatedAddress = null;

        $endpoint = "https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key={$this->apiServerKey}";

        $client = new Client();
        $res = $client->request('GET', $endpoint);

        $content = json_decode($res->getBody()->getContents(), true);

        if ('OK' === $content['status']) {
            $updatedAddress = json_encode([$content['results'][0]]);
        }

        return $updatedAddress;
    }
}
