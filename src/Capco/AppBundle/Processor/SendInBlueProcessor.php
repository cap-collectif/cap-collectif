<?php

namespace Capco\AppBundle\Processor;

use Capco\AppBundle\Mailer\SendInBlue\SendInBlueManager;
use Capco\AppBundle\Toggle\Manager;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class SendInBlueProcessor implements ProcessorInterface
{
    public function __construct(private readonly SendInBlueManager $sendInBlueManager, private readonly Manager $toggle)
    {
    }

    public function process(Message $message, array $options): bool
    {
        if (!$this->toggle->isActive(Manager::api_sendinblue)) {
            return false;
        }
        $data = json_decode((string) $message->getBody(), true);
        $method = $data['method'];
        if (\is_array($data['args'])) {
            // in PHP8, we can use assoc array, but in 7 we need array_values
            $this->sendInBlueManager->{$method}(...array_values($data['args']));
        }

        return true;
    }
}
