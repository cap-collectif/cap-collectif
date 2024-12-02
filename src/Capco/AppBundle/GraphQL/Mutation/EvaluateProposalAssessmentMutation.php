<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalAnalysis;
use Capco\AppBundle\Entity\ProposalAssessment;
use Capco\AppBundle\Enum\ProposalStatementErrorCode;
use Capco\AppBundle\Enum\ProposalStatementState;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Security\ProposalAnalysisRelatedVoter;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class EvaluateProposalAssessmentMutation implements MutationInterface
{
    use MutationTrait;
    use ResolverTrait;

    public function __construct(private readonly ProposalRepository $proposalRepository, private readonly AuthorizationCheckerInterface $authorizationChecker, private readonly EntityManagerInterface $entityManager, private readonly LoggerInterface $logger, private readonly Publisher $publisher)
    {
    }

    public function __invoke(Argument $args, $viewer): array
    {
        $this->formatInput($args);
        $this->preventNullableViewer($viewer);

        list($proposalId, $decision, $body, $cost, $officialResponse) = [
            $args->offsetGet('proposalId'),
            $args->offsetGet('decision'),
            $args->offsetGet('body'),
            $args->offsetGet('estimatedCost'),
            $args->offsetGet('officialResponse'),
        ];

        $proposalId = GlobalId::fromGlobalId($proposalId)['id'];
        /** @var Proposal $proposal */
        $proposal = $this->proposalRepository->find($proposalId);
        if (!$proposal) {
            return [
                'assessment' => null,
                'errorCode' => ProposalStatementErrorCode::NON_EXISTING_PROPOSAL,
            ];
        }

        if (
            !$this->authorizationChecker->isGranted(
                ProposalAnalysisRelatedVoter::EVALUATE,
                $proposal
            )
        ) {
            return [
                'assessment' => null,
                'errorCode' => ProposalStatementErrorCode::NOT_ASSIGNED_PROPOSAL,
            ];
        }

        if (!($proposalAssessment = $proposal->getAssessment())) {
            $proposalAssessment = new ProposalAssessment($proposal);
        }
        $oldState = $proposalAssessment->getState();

        $proposalAssessment
            ->setEstimatedCost($cost)
            ->setBody($body)
            ->setOfficialResponse($officialResponse)
            ->setState($decision)
            ->setUpdatedBy($viewer)
        ;

        if (
            null !== $proposal->getAnalyses()
            && \in_array(
                $proposalAssessment->getState(),
                ProposalStatementState::getDecisionalTypes(),
                true
            )
        ) {
            /** @var ProposalAnalysis $analysis */
            foreach ($proposal->getAnalyses() as $analysis) {
                if (ProposalStatementState::IN_PROGRESS === $analysis->getState()) {
                    $analysis->setState(ProposalStatementState::TOO_LATE);
                }
            }
        }

        try {
            $this->entityManager->persist($proposalAssessment);
            $this->entityManager->flush();
            $this->notifyIfDecision($oldState, $proposalAssessment);
        } catch (\Exception $exception) {
            $this->logger->alert(
                'An error occurred when evaluating ProposalAssessment with proposal id :' .
                    $proposalId .
                    '.' .
                    $exception->getMessage()
            );

            return [
                'assessment' => null,
                'errorCode' => ProposalStatementErrorCode::INTERNAL_ERROR,
            ];
        }

        return [
            'assessment' => $proposalAssessment,
            'errorCode' => null,
        ];
    }

    private function notifyIfDecision(
        string $oldState,
        ProposalAssessment $proposalAssessment
    ): void {
        $updateDate = $proposalAssessment->getUpdatedAt();
        if (null === $updateDate) {
            $updateDate = new \DateTime();
        }

        $message = [
            'type' => 'assessment',
            'proposalId' => $proposalAssessment->getProposal()->getId(),
            'date' => $updateDate->format('Y-m-d H:i:s'),
        ];
        if (
            $proposalAssessment->getState() != $oldState
            && \in_array($proposalAssessment->getState(), ProposalStatementState::getDecisionalTypes())
        ) {
            $this->publisher->publish(
                CapcoAppBundleMessagesTypes::PROPOSAL_ANALYSE,
                new Message(json_encode($message))
            );
        }
    }
}
