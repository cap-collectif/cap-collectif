<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalAssessment;
use Capco\AppBundle\Entity\ProposalDecision;
use Capco\AppBundle\Enum\ProposalStatementErrorCode;
use Capco\AppBundle\Enum\ProposalStatementState;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Security\ProposalAnalysisRelatedVoter;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationChecker;

class ChangeProposalAssessmentMutation implements MutationInterface
{
    use ResolverTrait;

    private $proposalRepository;
    private $entityManager;
    private $authorizationChecker;
    private $logger;
    private $proposalDecisionRepository;

    public function __construct(
        ProposalRepository $proposalRepository,
        EntityManagerInterface $entityManager,
        AuthorizationChecker $authorizationChecker,
        LoggerInterface $logger
    ) {
        $this->proposalRepository = $proposalRepository;
        $this->entityManager = $entityManager;
        $this->authorizationChecker = $authorizationChecker;
        $this->logger = $logger;
    }

    public function __invoke(Argument $args, $viewer): array
    {
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

        /** @var $proposalDecision ProposalDecision */
        if (
            ($proposalDecision = $proposal->getDecision()) &&
            ProposalStatementState::DONE === $proposalDecision->getState()
        ) {
            return [
                'assessment' => null,
                'errorCode' => ProposalStatementErrorCode::DECISION_ALREADY_GIVEN,
            ];
        }

        $proposalAssessment = ($proposal->getAssessment() ?? new ProposalAssessment($proposal))
            ->setState(ProposalStatementState::IN_PROGRESS)
            ->setUpdatedBy($viewer)
            ->setBody($body)
            ->setOfficialResponse($officialResponse)
            ->setEstimatedCost($estimatedCost);

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

        return [
            'assessment' => $proposalAssessment,
            'errorCode' => null,
        ];
    }
}
