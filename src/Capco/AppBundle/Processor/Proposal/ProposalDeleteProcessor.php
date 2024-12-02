<?php

namespace Capco\AppBundle\Processor\Proposal;

use Capco\AppBundle\Notifier\ProposalNotifier;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class ProposalDeleteProcessor implements ProcessorInterface
{
    public function __construct(private readonly EntityManagerInterface $em, private readonly ProposalRepository $proposalRepository, private readonly UserRepository $userRepository, private readonly ProposalNotifier $notifier, private readonly LoggerInterface $logger)
    {
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode((string) $message->getBody(), true);

        // Disable the built-in softdelete
        $filters = $this->em->getFilters();
        if ($filters->isEnabled('softdeleted')) {
            $filters->disable('softdeleted');
        }

        $proposal = $this->proposalRepository->find($json['proposalId']);
        $supervisor =
            isset($json['supervisorId']) && $json['supervisorId']
                ? $this->userRepository->find($json['supervisorId'])
                : null;
        $decisionMaker =
            isset($json['decisionMakerId']) && $json['decisionMakerId']
                ? $this->userRepository->find($json['decisionMakerId'])
                : null;

        if (!$filters->isEnabled('softdeleted')) {
            $filters->enable('softdeleted');
        }

        if (!$proposal) {
            $this->logger->error(
                __CLASS__ . ' - Unable to find proposal with id: ' . $json['proposalId']
            );

            return false;
        }

        $this->notifier->onDelete($proposal, $supervisor, $decisionMaker);

        return true;
    }
}
