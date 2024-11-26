<?php

namespace Capco\AppBundle\Client;

class DeployerClient
{
    private readonly ?string $deployerBaseUrl;
    private readonly string $instanceName;
    private readonly string $token;

    public function __construct(?string $deployerBaseUrl, string $instanceName, string $token)
    {
        $this->deployerBaseUrl = $deployerBaseUrl;
        $this->instanceName = $instanceName;
        $this->token = $token;
    }

    public function updateCurrentDomain(string $customDomain): int
    {
        if (!$this->deployerBaseUrl) {
            throw new \RuntimeException('You need to set deployer URL to use this.', 1);
        }

        $endpoint = "{$this->deployerBaseUrl}/instances/{$this->instanceName}/urls/token";

        $curl = curl_init();
        curl_setopt_array($curl, [
            \CURLOPT_URL => $endpoint,
            \CURLOPT_RETURNTRANSFER => true,
            \CURLOPT_CUSTOMREQUEST => 'POST',
            \CURLOPT_POSTFIELDS => "{\"name\":\"{$customDomain}\"}",
            \CURLOPT_HTTPHEADER => [
                'content-type: application/json',
                "auth-token: {$this->token}",
            ],
        ]);

        curl_exec($curl);
        $statusCode = curl_getinfo($curl, \CURLINFO_HTTP_CODE);
        $err = curl_error($curl);
        curl_close($curl);

        if ($err) {
            throw new \RuntimeException("cURL Error #: {$err}");
        }

        return $statusCode;
    }
}
