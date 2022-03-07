<?php

namespace Capco\AppBundle\Client;

class DeployerClient
{
    private string $baseUrl = "***REMOVED***";
    private string $instanceName;
    private string $token;

    public function __construct(string $instanceName, string $token)
    {
        $this->instanceName = $instanceName;
        $this->token = $token;
    }

    public function updateCurrentDomain(string $customDomain): int
    {
        $endpoint = "{$this->baseUrl}/instances/{$this->instanceName}/urls/token";

        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => $endpoint,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => "POST",
            CURLOPT_POSTFIELDS => "{\"name\":\"{$customDomain}\"}",
            CURLOPT_HTTPHEADER => [
                "content-type: application/json",
                "auth-token: {$this->token}"
            ],
        ]);

        curl_exec($curl);
        $statusCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $err = curl_error($curl);
        curl_close($curl);

        if ($err) {
            throw new \Exception("cURL Error #: {$err}");
        }

        return $statusCode;
    }
}