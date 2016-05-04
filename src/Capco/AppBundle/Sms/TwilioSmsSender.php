<?php

namespace Capco\AppBundle\Sms;

class TwilioSmsSender implements SmsSender
{
    protected $client;

    public function __construct($sid, $token)
    {
        $http = new \Services_Twilio_TinyHttp('https://api.twilio.com', [
        'curlopts' => [
          CURLOPT_SSL_VERIFYPEER => false,
          CURLOPT_SSL_VERIFYHOST => 0,
        ],
      ]);
        $this->client = new \Services_Twilio(
        $sid,
        $token,
        '2010-04-01', // api version
        $http, // custom http client
        3 // retry attempts
      );
    }

    public function send($from, $to, $message)
    {
        $this->client->account->messages->sendMessage(
          $from,
          $to,
          $message
      );
    }
}
