<?php

namespace Capco\AppBundle\MessageHandler;

use Capco\AppBundle\Entity\AppLog;
use Capco\AppBundle\Message\AppLogMessage;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler(fromTransport: 'async', handles: AppLogMessage::class)]
class AppLogMessageHandler
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserRepository $userRepository
    ) {
    }

    public function __invoke(AppLogMessage $message): void
    {
        $userId = $message->getUserId();

        $user = $this->userRepository->findOneBy(['id' => $userId]);

        if (null === $user) {
            throw new \RuntimeException(sprintf('User %s not found', $userId));
        }

        $logAction = new AppLog();
        $logAction->setActionType($message->getActionType());
        $logAction->setDescription($message->getDescription());
        $logAction->setEntityType($message->getEntityType());
        $logAction->setEntityId($message->getEntityId());
        $logAction->setUser($user);
        $logAction->setCreatedAt(new \DateTime());
        $logAction->setIp($message->getIp());

        $this->entityManager->persist($logAction);
        $this->entityManager->flush();
    }
}
