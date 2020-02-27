<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalAssessment;
use Capco\AppBundle\Enum\ProposalAssessmentState;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Security\ProposalAssessmentVoter;
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

    public function __invoke(Argument $args, $viewer)
    {
        $this->preventNullableViewer($viewer);

        list($proposalId, $body, $estimation, $officialResponse) = [
            $args->offsetGet('proposalId'),
            $args->offsetGet('body'),
            $args->offsetGet('estimation'),
            $args->offsetGet('officialResponse')
        ];

        $proposalId = GlobalId::fromGlobalId($proposalId)['id'];
        $proposal = $this->proposalRepository->find($proposalId);

        if (!$proposal) {
            return $this->buildPayload(null, 'The proposal does not exist.');
        }

        /** @var Proposal $proposal */
        if (!$this->authorizationChecker->isGranted(ProposalAssessmentVoter::EVALUATE, $proposal)) {
            return $this->buildPayload(
                null,
                'You can\' make an assessment on a proposal you are not assigned to.'
            );
        }
        // If there is no proposalAssessment related to the given proposal, create it empty.
        if (!($proposalAssessment = $proposal->getAssessment())) {
            $proposalAssessment = (new ProposalAssessment($proposal))
                ->setState(ProposalAssessmentState::EMPTY)
                ->setUpdatedBy($viewer);

            try {
                $this->entityManager->persist($proposalAssessment);
                $this->entityManager->flush();
            } catch (\Exception $exception) {
                $this->logger->alert(
                    'An error occured when persisting ProposalAssessment with proposal id :' .
                        $proposalId .
                        '.' .
                        $exception->getMessage()
                );

                return $this->buildPayload(
                    null,
                    'An error occured when creating proposal assessment'
                );
            }

            return $this->buildPayload($proposalAssessment);
        }

        // TODO: When the decision-maker API is done, implements business rules related to the supervisor in line with those of the decision-maker
        // Whenever he wants, the supervisor can edit his assessment.
        $proposalAssessment
            ->setUpdatedBy($viewer)
            ->setState(ProposalAssessmentState::IN_PROGRESS)
            ->setBody($body)
            ->setOfficialResponse($officialResponse)
            ->setEstimation($estimation);

        try {
            $this->entityManager->flush();
        } catch (\Exception $exception) {
            $this->logger->alert(
                'An error occured when editing ProposalAssessment with proposal id :' .
                    $proposalId .
                    '.' .
                    $exception->getMessage()
            );

            return $this->buildPayload(null, 'An error occured when creating proposal assessment.');
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
