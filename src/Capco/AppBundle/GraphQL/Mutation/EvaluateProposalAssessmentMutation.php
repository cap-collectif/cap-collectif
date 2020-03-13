<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalAssessment;
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

        list($proposalId, $decision) = [
            $args->offsetGet('proposalId'),
            $args->offsetGet('decision')
        ];

        $proposalId = GlobalId::fromGlobalId($proposalId)['id'];
        /** @var Proposal $proposal */
        $proposal = $this->proposalRepository->find($proposalId);
        if (!$proposal) {
            return $this->buildPayload(null, 'The proposal does not exist.');
        }

        if (
            !$this->authorizationChecker->isGranted(
                ProposalAnalysisRelatedVoter::EVALUATE,
                $proposal
            )
        ) {
            return $this->buildPayload(
                null,
                'You don\'t have the permission to evaluate this proposal.'
            );
        }

        if (!($proposalAssessment = $proposal->getAssessment())) {
            return $this->buildPayload(null, 'There is no assessment attached to this proposal.');
        }

        if (empty($proposalAssessment->getOfficialResponse())) {
            return $this->buildPayload(null, 'The official response must not be empty.');
        }

        try {
            $proposalAssessment->setState($decision)->setUpdatedBy($viewer);
            $this->entityManager->flush();
        } catch (\Exception $exception) {
            $this->logger->alert(
                'An error occurred when evaluating ProposalAssessment with proposal id :' .
                    $proposalId .
                    '.' .
                    $exception->getMessage()
            );

            return $this->buildPayload(
                null,
                'An error occurred when evaluating proposal assessment.'
            );
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
