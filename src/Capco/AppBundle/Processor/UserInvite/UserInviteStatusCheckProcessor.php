<?php

namespace Capco\AppBundle\Processor\UserInvite;

use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\Exception\UserInviteMessageQueuedException;
use Capco\AppBundle\Mailer\SenderEmailDomains\MailjetClient;
use Capco\AppBundle\Mailer\SenderEmailDomains\MandrillClient;
use Capco\AppBundle\Mailer\Transport\MailjetTransport;
use Capco\AppBundle\Mailer\Transport\MandrillTransport;
use Capco\AppBundle\Repository\UserInviteRepository;
use Doctrine\ORM\EntityManagerInterface;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class UserInviteStatusCheckProcessor implements ProcessorInterface
{
    private EntityManagerInterface $entityManager;
    private UserInviteRepository $repository;
    private MailjetClient $mailjetClient;
    private MandrillClient $mandrillClient;

    public function __construct(
        EntityManagerInterface $entityManager,
        UserInviteRepository $repository,
        MailjetClient $mailjetClient,
        MandrillClient $mandrillClient
    ) {
        $this->entityManager = $entityManager;
        $this->repository = $repository;
        $this->mailjetClient = $mailjetClient;
        $this->mandrillClient = $mandrillClient;
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode($message->getBody(), true);
        list($inviteId, $providerClass) = [$json['id'], $json['provider']];

        if (!($invite = $this->repository->find($inviteId))) {
            throw new \RuntimeException('Unable to find userInvite with id : ' . $inviteId);
        }

        if (
            MailjetTransport::class === $providerClass &&
            ($inviteMailjetId = $invite->getMailjetId())
        ) {
            $response = $this->mailjetClient->get('message/' . $inviteMailjetId);
            $responseBody = json_decode($response->getBody()->getContents(), true);
            $messageStatus = $responseBody['Data'][0]['Status'];
            if ('queued' === $messageStatus) {
                throw new UserInviteMessageQueuedException(
                    UserInviteMessageQueuedException::MESSAGE_DEFAULT_QUEUED
                );
            }

            $invite->setInternalStatus(
                \in_array($messageStatus, ['sent', 'opened', 'clicked'])
                    ? UserInvite::SENT
                    : UserInvite::SEND_FAILURE
            );
        }

        if (
            MandrillTransport::class === $providerClass &&
            ($inviteMandrillId = $invite->getMandrillId())
        ) {
            $response = $this->mandrillClient->post('messages/info', ['id' => $inviteMandrillId]);
            $messageStatus = json_decode($response->getBody()->getContents(), true)['state'];
            if ('queued' === $messageStatus) {
                throw new UserInviteMessageQueuedException(
                    UserInviteMessageQueuedException::MESSAGE_DEFAULT_QUEUED
                );
            }

            $invite->setInternalStatus(
                'sent' === $messageStatus ? UserInvite::SENT : UserInvite::SEND_FAILURE
            );
        }

        $this->entityManager->flush();

        return true;
    }
}
