<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalAssessment;
use Capco\AppBundle\Entity\ProposalDecision;
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

class ChangeProposalAssessmentMutation implements MutationInterface
{
    use MutationTrait;
    use ResolverTrait;

    private ProposalRepository $proposalRepository;
    private EntityManagerInterface $entityManager;
    private AuthorizationCheckerInterface $authorizationChecker;
    private LoggerInterface $logger;
    private Publisher $publisher;

    public function __construct(
        ProposalRepository $proposalRepository,
        EntityManagerInterface $entityManager,
        AuthorizationCheckerInterface $authorizationChecker,
        LoggerInterface $logger,
        Publisher $publisher
    ) {
        $this->proposalRepository = $proposalRepository;
        $this->entityManager = $entityManager;
        $this->authorizationChecker = $authorizationChecker;
        $this->logger = $logger;
        $this->publisher = $publisher;
    }

    public function __invoke(Argument $args, $viewer): array
    {
        $this->formatInput($args);
        $this->preventNullableViewer($viewer);

        list($proposalId, $body, $estimatedCost, $officialResponse) = [
            $args->offsetGet('proposalId'),
            $args->offsetGet('body'),
            $args->offsetGet('estimatedCost'),
            $args->offsetGet('officialResponse'),
        ];

        $proposalId = GlobalId::fromGlobalId($proposalId)['id'];
        $proposal = $this->proposalRepository->find($proposalId);

        if (!$proposal) {
            return [
                'assessment' => null,
                'errorCode' => ProposalStatementErrorCode::NON_EXISTING_PROPOSAL,
            ];
        }

        /** @var Proposal $proposal */
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

        /** @var ProposalDecision $proposalDecision */
        if (
            ($proposalDecision = $proposal->getDecision())
            && ProposalStatementState::DONE === $proposalDecision->getState()
        ) {
            return [
                'assessment' => null,
                'errorCode' => ProposalStatementErrorCode::DECISION_ALREADY_GIVEN,
            ];
        }

        $proposalAssessment = $proposal->getAssessment();
        if (null === $proposalAssessment) {
            $proposalAssessment = new ProposalAssessment($proposal);
        }

        $oldState = $proposalAssessment->getState();

        $proposalAssessment
            ->setState(ProposalStatementState::IN_PROGRESS)
            ->setUpdatedBy($viewer)
            ->setBody($body)
            ->setOfficialResponse($officialResponse)
            ->setEstimatedCost($estimatedCost)
        ;

        try {
            $this->entityManager->persist($proposalAssessment);
            $this->entityManager->flush();
        } catch (\Exception $exception) {
            $this->logger->alert(
                'An error occurred when editing ProposalAssessment with proposal id :' .
                    $proposalId .
                    '.' .
                    $exception->getMessage()
            );

            return [
                'assessment' => null,
                'errorCode' => ProposalStatementErrorCode::INTERNAL_ERROR,
            ];
        }

        $this->notifyIfDecision($oldState, $proposalAssessment);

        return [
            'assessment' => $proposalAssessment,
            'errorCode' => null,
        ];
    }

    private function notifyIfDecision(
        string $oldState,
        ProposalAssessment $proposalAssessment
    ): void {
        $message = [
            'type' => 'assessment',
            'proposalId' => $proposalAssessment->getProposal()->getId(),
            'date' => $proposalAssessment->getUpdatedAt()->format('Y-m-d H:i:s'),
        ];
        if (
            $proposalAssessment->getState() !== $oldState
            && \in_array($proposalAssessment->getState(), ProposalStatementState::getDecisionalTypes())
        ) {
            $this->publisher->publish(
                CapcoAppBundleMessagesTypes::PROPOSAL_ANALYSE,
                new Message(json_encode($message))
            );
        }
    }
}
