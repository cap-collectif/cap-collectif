<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalDecisionMaker;
use Capco\AppBundle\Enum\ProposalAssignmentErrorCode;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ProposalDecisionMakerRepository;
use Capco\AppBundle\Security\ProposalAnalysisRelatedVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class AssignDecisionMakerToProposalsMutation implements MutationInterface
{
    use ResolverTrait;
    private $globalIdResolver;
    private $em;
    private $builder;
    /** @var ProposalDecisionMakerRepository $proposalDecisionMakerRepository */
    private $proposalDecisionMakerRepository;
    private $authorizationChecker;

    public function __construct(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        ConnectionBuilder $builder,
        AuthorizationCheckerInterface $authorizationChecker,
        ProposalDecisionMakerRepository $proposalDecisionMakerRepository
    ) {
        $this->globalIdResolver = $globalIdResolver;
        $this->em = $em;
        $this->builder = $builder;
        $this->proposalDecisionMakerRepository = $proposalDecisionMakerRepository;
        $this->authorizationChecker = $authorizationChecker;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $proposalIds = $input->offsetGet('proposalIds');
        $decisionMakerId = $input->offsetGet('decisionMakerId');

        $decisionMaker = $decisionMakerId
            ? $this->globalIdResolver->resolve($decisionMakerId, $viewer)
            : null;
        $proposals = $this->globalIdResolver->resolveTypeByIds($proposalIds, $viewer, 'Proposal');

        // revoke decisionMaker to proposals
        if (!$decisionMaker && !empty($proposalIds)) {
            /** @var Proposal $proposal */
            foreach ($proposals as $proposal) {
                $proposal = \is_array($proposal) ? $proposal[0] : $proposal;
                if (
                    !$this->authorizationChecker->isGranted(
                        ProposalAnalysisRelatedVoter::ASSIGN_DECISION_MAKER,
                        $proposal
                    )
                ) {
                    $connection = $this->builder->connectionFromArray($proposals, $input);
                    $connection->setTotalCount(\count($proposals));

                    return $this->buildPayload(
                        $connection,
                        ProposalAssignmentErrorCode::ACCESS_DENIED_TO_REVOKE_DECISION_MAKER
                    );
                }
            }

            return $this->revokeDecisionMakerToProposals($proposals, $input);
        }

        foreach ($proposals as $proposal) {
            $proposal = \is_array($proposal) ? $proposal[0] : $proposal;
            if (
                !$this->authorizationChecker->isGranted(
                    ProposalAnalysisRelatedVoter::ASSIGN_DECISION_MAKER,
                    $proposal
                )
            ) {
                $connection = $this->builder->connectionFromArray($proposals, $input);
                $connection->setTotalCount(\count($proposals));

                return $this->buildPayload(
                    $connection,
                    ProposalAssignmentErrorCode::ACCESS_DENIED_TO_ASSIGN_DECISION_MAKER
                );
            }
        }

        return $this->assignDecisionMakerToProposals($proposals, $decisionMaker, $input);
    }

    private function revokeDecisionMakerToProposals(array $proposals, Arg $input): array
    {
        $this->proposalDecisionMakerRepository->deleteByProposals($proposals);
        /** @var Proposal $proposal */
        foreach ($proposals as $proposal) {
            $proposal->removeDecisionMaker();
        }
        $this->em->flush();
        $connection = $this->builder->connectionFromArray($proposals, $input);
        $connection->setTotalCount(\count($proposals));

        return $this->buildPayload($connection);
    }

    private function assignDecisionMakerToProposals(
        array $proposals,
        User $decisionMaker,
        Arg $input
    ): array {
        foreach ($proposals as $proposal) {
            /** @var Proposal $proposal */
            // change decision maker
            if ($proposal->getDecisionMaker()) {
                if ($proposal->getDecisionMaker() !== $decisionMaker) {
                    $proposal->changeDecisionMaker($decisionMaker);
                }
                // assign decision maker
            } else {
                $proposalDecisionMaker = new ProposalDecisionMaker($proposal, $decisionMaker);
                $proposal->setProposalDecisionMaker($proposalDecisionMaker);
            }
        }
        $this->em->flush();
        $connection = $this->builder->connectionFromArray($proposals, $input);
        $connection->setTotalCount(\count($proposals));

        return $this->buildPayload($connection);
    }

    private function buildPayload(
        ?ConnectionInterface $proposalConnexion = null,
        ?string $errorMessage = null
    ): array {
        return [
            'proposals' => $proposalConnexion,
            'errorCode' => $errorMessage,
        ];
    }
}
