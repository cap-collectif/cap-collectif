<?php

namespace Capco\AppBundle\Processor\Argument;

use Capco\AppBundle\Notifier\ArgumentNotifier;
use Capco\AppBundle\Repository\ArgumentRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class ArgumentUpdateProcessor implements ProcessorInterface
{
    private $argumentRepository;
    private $argumentNotifier;

    public function __construct(
        ArgumentRepository $argumentRepository,
        ArgumentNotifier $argumentNotifier
    ) {
        $this->argumentRepository = $argumentRepository;
        $this->argumentNotifier = $argumentNotifier;
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode((string) $message->getBody(), true);
        $argument = $this->argumentRepository->find($json['argumentId']);
        if (!$argument) {
            throw new \RuntimeException('Unable to find argument with id : ' . $json['argumentId']);
        }
        $this->argumentNotifier->onUpdate($argument);

        return true;
    }
}
