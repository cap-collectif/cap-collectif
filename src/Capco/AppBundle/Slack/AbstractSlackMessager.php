<?php

namespace Capco\AppBundle\Slack;

abstract class AbstractSlackMessager
{
    public function send(string $message)
    {
        $ch = curl_init($this->getHook());
        curl_setopt($ch, \CURLOPT_CUSTOMREQUEST, 'POST');
        curl_setopt($ch, \CURLOPT_HTTPHEADER, ['Content-Type:application/json']);
        curl_setopt($ch, \CURLOPT_POSTFIELDS, json_encode(['text' => $message]));

        curl_setopt($ch, \CURLOPT_RETURNTRANSFER, true);
        $result = curl_exec($ch);
        curl_close($ch);

        return $result;
    }

    abstract protected function getHook(): string;
}
