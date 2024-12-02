<?php

namespace Capco\AppBundle\Processor\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalAnalysis;
use Capco\AppBundle\Notifier\ProposalNotifier;
use Capco\AppBundle\Repository\ProposalAnalysisRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class ProposalAnalyseProcessor implements ProcessorInterface
{
    final public const TYPE_ANALYSIS = 'analysis';
    final public const TYPE_ASSESSMENT = 'assessment';
    final public const TYPE_DECISION = 'decision';
    final public const VALID_TYPES = [self::TYPE_ANALYSIS, self::TYPE_ASSESSMENT, self::TYPE_DECISION];

    public function __construct(private readonly ProposalRepository $proposalRepository, private readonly ProposalAnalysisRepository $analysisRepository, private readonly ProposalNotifier $notifier, private readonly LoggerInterface $logger)
    {
    }

    public function process(Message $message, array $options): bool
    {
        $jsonDecoded = json_decode((string) $message->getBody(), true);

        if (!$this->isValid($jsonDecoded)) {
            return false;
        }

        $proposal = $this->getProposal($jsonDecoded);
        if (null === $proposal) {
            return false;
        }

        $date = $this->getDate($jsonDecoded);
        if (null === $date) {
            return false;
        }

        return $this->notify($proposal, $date, $jsonDecoded);
    }

    private function notify(Proposal $proposal, \DateTime $date, array $jsonDecoded): bool
    {
        return match ($jsonDecoded['type']) {
            self::TYPE_ANALYSIS => $this->notifyAnalysis($proposal, $date, $jsonDecoded),
            self::TYPE_ASSESSMENT => $this->notifyAssessment($proposal, $date),
            self::TYPE_DECISION => $this->notifyDecision($proposal, $date),
            default => true,
        };
    }

    private function notifyAnalysis(Proposal $proposal, \DateTime $date, array $jsonDecoded): bool
    {
        if (
            $proposal->getAnalyses()->count() >= $proposal->getAnalysts()->count()
            && $proposal->getAnalyses()->count() >= 2
        ) {
            $this->notifier->onLastAnalysisPublication($proposal);
        } else {
            $analysis = $this->getAnalysis($jsonDecoded);
            if (null === $analysis) {
                return false;
            }
            $this->notifier->onAnalysisPublication($proposal, $date, $analysis);
        }

        return true;
    }

    private function notifyAssessment(Proposal $proposal, \DateTime $date): bool
    {
        $this->notifier->onAssessmentPublication($proposal, $date);

        return true;
    }

    private function notifyDecision(Proposal $proposal, \DateTime $date): bool
    {
        $this->notifier->onDecisionPublication($proposal, $date);

        return true;
    }

    private function isValid(array $jsonDecoded): bool
    {
        if (!isset($jsonDecoded['type'])) {
            $this->logger->error(__CLASS__ . ' no type defined in message');

            return false;
        }
        if (!\in_array($jsonDecoded['type'], self::VALID_TYPES)) {
            $this->logger->error(__CLASS__ . ' unknown type of message : ' . $jsonDecoded['type']);

            return false;
        }
        if (!isset($jsonDecoded['proposalId'])) {
            $this->logger->error(__CLASS__ . ' - no proposalId defined in message');

            return false;
        }
        if (!isset($jsonDecoded['date'])) {
            $this->logger->error(__CLASS__ . ' - no date defined in message');

            return false;
        }
        if (!isset($jsonDecoded['analysisId']) && self::TYPE_ANALYSIS === $jsonDecoded['type']) {
            $this->logger->error(__CLASS__ . ' - no analysisId defined in message');

            return false;
        }

        return true;
    }

    private function getProposal(array $jsonDecoded): ?Proposal
    {
        $proposal = null;
        $proposal = $this->proposalRepository->find($jsonDecoded['proposalId']);
        if (null === $proposal) {
            $this->logger->error(
                __CLASS__ . ' - Unable to find proposal with id: ' . $jsonDecoded['proposalId']
            );
        }

        return $proposal;
    }

    private function getAnalysis(array $jsonDecoded): ?ProposalAnalysis
    {
        $analysis = null;
        $analysis = $this->analysisRepository->find($jsonDecoded['analysisId']);
        if (null === $analysis) {
            $this->logger->error(
                __CLASS__ . ' - Unable to find analysis with id: ' . $jsonDecoded['analysisId']
            );
        }

        return $analysis;
    }

    private function getDate(array $jsonDecoded): ?\DateTime
    {
        $date = null;

        try {
            $date = new \DateTime($jsonDecoded['date']);
        } catch (\Exception) {
            $this->logger->error(__CLASS__ . ' - invalid date : ' . $jsonDecoded['date']);
        }

        return $date;
    }
}
