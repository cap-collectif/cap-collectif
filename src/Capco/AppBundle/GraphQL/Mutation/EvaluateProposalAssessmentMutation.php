<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalAnalysis;
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

class EvaluateProposalAssessmentMutation implements MutationInterface
{
    use ResolverTrait;

    private $proposalRepository;
    private $authorizationChecker;
    private $entityManager;
    private $logger;

    public function __construct(
        ProposalRepository $proposalRepository,
        AuthorizationChecker $authorizationChecker,
        EntityManagerInterface $entityManager,
        LoggerInterface $logger
    ) {
        $this->proposalRepository = $proposalRepository;
        $this->authorizationChecker = $authorizationChecker;
        $this->entityManager = $entityManager;
        $this->logger = $logger;
    }

    public function __invoke(Argument $args, $viewer): array
    {
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
                'errorCode' => ProposalStatementErrorCode::UNASSIGNED_PROPOSAL,
            ];
        }

        if (!($proposalAssessment = $proposal->getAssessment())) {
            return [
                'assessment' => null,
                'errorCode' => ProposalStatementErrorCode::NON_EXISTING_ASSESSMENT,
            ];
        }
    
        $proposalAssessment
            ->setEstimatedCost($cost)
            ->setBody($body)
            ->setOfficialResponse($officialResponse)
            ->setState($decision)
            ->setUpdatedBy($viewer);
    
        if (
            $proposal->getAnalyses() !== null &&
            \in_array($proposalAssessment->getState(), ProposalStatementState::getDecisionalTypes(), true)
        ) {
            /** @var ProposalAnalysis $analysis */
            foreach ($proposal->getAnalyses() as $analysis) {
                if ($analysis->getState() === ProposalStatementState::IN_PROGRESS) {
                    $analysis->setState(ProposalStatementState::TOO_LATE);
                }
            }
        }

        try {
            $this->entityManager->flush();
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
}
