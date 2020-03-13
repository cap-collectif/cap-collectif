<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalAssessment;
use Capco\AppBundle\Entity\ProposalDecision;
use Capco\AppBundle\Enum\ProposalAssessmentState;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ProposalDecisionRepository;
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
        ProposalDecisionRepository $proposalDecisionRepository,
        EntityManagerInterface $entityManager,
        AuthorizationChecker $authorizationChecker,
        LoggerInterface $logger
    ) {
        $this->proposalRepository = $proposalRepository;
        $this->entityManager = $entityManager;
        $this->authorizationChecker = $authorizationChecker;
        $this->logger = $logger;
        $this->proposalDecisionRepository = $proposalDecisionRepository;
    }

    public function __invoke(Argument $args, $viewer): array
    {
        $this->preventNullableViewer($viewer);

        list($proposalId, $body, $estimatedCost, $officialResponse) = [
            $args->offsetGet('proposalId'),
            $args->offsetGet('body'),
            $args->offsetGet('estimatedCost'),
            $args->offsetGet('officialResponse')
        ];

        $proposalId = GlobalId::fromGlobalId($proposalId)['id'];
        $proposal = $this->proposalRepository->find($proposalId);

        if (!$proposal) {
            return $this->buildPayload(null, 'The proposal does not exist.');
        }

        /** @var Proposal $proposal */
        if (
            !$this->authorizationChecker->isGranted(
                ProposalAnalysisRelatedVoter::EVALUATE,
                $proposal
            )
        ) {
            return $this->buildPayload(
                null,
                'You can\'t make an assessment on a proposal you are not assigned to.'
            );
        }

        /** @var $proposalDecision ProposalDecision */
        $proposalDecision = $this->proposalDecisionRepository->findOneBy(['proposal' => $proposal]);
        if ($proposalDecision && $proposalDecision->getIsDone()) {
            return $this->buildPayload(
                null,
                'The decision-maker has already gave his decision about this proposal.'
            );
        }

        $proposalAssessment = ($proposal->getAssessment() ?? new ProposalAssessment($proposal))
            ->setState(ProposalAssessmentState::IN_PROGRESS)
            ->setUpdatedBy($viewer)
            ->setBody($body)
            ->setProposal($proposal)
            ->setOfficialResponse($officialResponse)
            ->setEstimatedCost($estimatedCost);

        try {
            if (!$proposal->getAssessment()) {
                $this->entityManager->persist($proposalAssessment);
            }
            $this->entityManager->flush();
        } catch (\Exception $exception) {
            $this->logger->alert(
                'An error occurred when editing ProposalAssessment with proposal id :' .
                    $proposalId .
                    '.' .
                    $exception->getMessage()
            );

            return $this->buildPayload(null, 'An error occurred when editing proposal assessment.');
        }

        return $this->buildPayload($proposalAssessment);
    }

    private function buildPayload(
        ?ProposalAssessment $assessment = null,
        ?string $errorMessage = null
    ): array {
        return [
            'assessment' => $assessment,
            'userErrors' => [['message' => $errorMessage]]
        ];
    }
}
