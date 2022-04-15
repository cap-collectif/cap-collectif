<?php

namespace Capco\AppBundle\Mailer\SendInBlue;

use GuzzleHttp\Client;
use SendinBlue\Client\Api\TransactionalEmailsApi;
use SendinBlue\Client\Configuration;
use SendinBlue\Client\Api\ContactsApi as SendInBlueApi;

class ContactsApi
{
    private Configuration $credentials;
    private static ?SendInBlueApi $apiInstance = null;
    private static ?TransactionalEmailsApi $transactionalEmailsApi = null;

    public function __construct(string $sendinblueApiKey)
    {
        $this->credentials = Configuration::getDefaultConfiguration()->setApiKey(
            'api-key',
            $sendinblueApiKey
        );
    }

    public function getCredentials(): Configuration
    {
        return $this->credentials;
    }

    public function getSendInBlueApi(): SendInBlueApi
    {
        if (null === self::$apiInstance) {
            self::$apiInstance = new SendInBlueApi(new Client(), $this->credentials);
        }

        return self::$apiInstance;
    }

    public function getTransactionalEmailApi(): TransactionalEmailsApi
    {
        if (null == self::$transactionalEmailsApi) {
            self::$transactionalEmailsApi = new TransactionalEmailsApi(
                new Client(),
                $this->credentials
            );
        }

        return self::$transactionalEmailsApi;
    }
}
