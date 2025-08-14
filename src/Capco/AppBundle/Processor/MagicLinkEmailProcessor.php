<?php

namespace Capco\AppBundle\Processor;

use Capco\AppBundle\Notifier\MagicLinkNotifier;
use Capco\UserBundle\Repository\UserRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class MagicLinkEmailProcessor implements ProcessorInterface
{
    public function __construct(private readonly UserRepository $userRepository, private readonly MagicLinkNotifier $notifier)
    {
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode((string) $message->getBody(), true);
        $email = $json['email'];
        $user = $this->userRepository->findOneBy(['email' => $email]);
        $variant = $json['variant'];

        if (!$user) {
            throw new \RuntimeException('Unable to find user with email : ' . $email);
        }

        $magicLinkUrl = $json['magicLinkUrl'];

        $this->notifier->sendEmail($user, $magicLinkUrl, $variant);

        return true;
    }
}
