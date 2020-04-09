<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalSupervisor;
use Capco\AppBundle\Enum\ProposalAssignmentErrorCode;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ProposalSupervisorRepository;
use Capco\AppBundle\Security\ProposalAnalysisRelatedVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class AssignSupervisorToProposalsMutation implements MutationInterface
{
    use ResolverTrait;
    private $globalIdResolver;
    private $em;
    private $builder;
    private $proposalSupervisorRepository;
    private $authorizationChecker;

    public function __construct(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        ConnectionBuilder $builder,
        ProposalSupervisorRepository $proposalSupervisorRepository,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $this->globalIdResolver = $globalIdResolver;
        $this->em = $em;
        $this->builder = $builder;
        $this->proposalSupervisorRepository = $proposalSupervisorRepository;
        $this->authorizationChecker = $authorizationChecker;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $proposalIds = $input->offsetGet('proposalIds');
        $supervisorId = $input->offsetGet('supervisorId');

        $supervisor = $supervisorId
            ? $this->globalIdResolver->resolve($supervisorId, $viewer)
            : null;

        $proposals = $this->globalIdResolver->resolveTypeByIds($proposalIds, $viewer, 'Proposal');

        // unassigned supervisor to proposals
        if (!$supervisor && !empty($proposalIds)) {
            /** @var Proposal $proposal */
            foreach ($proposals as $proposal) {
                $proposal = \is_array($proposal) ? $proposal[0] : $proposal;
                if (
                    !$this->authorizationChecker->isGranted(
                        ProposalAnalysisRelatedVoter::ASSIGN_SUPERVISOR,
                        $proposal
                    )
                ) {
                    $connection = $this->builder->connectionFromArray($proposals, $input);
                    $connection->setTotalCount(\count($proposals));

                    return $this->buildPayload(
                        $connection,
                        ProposalAssignmentErrorCode::ACCESS_DENIED_TO_REVOKE_SUPERVISOR
                    );
                }
            }

            return $this->revokeSupervisorToProposals($proposals, $input);
        }

        foreach ($proposals as $proposal) {
            $proposal = \is_array($proposal) ? $proposal[0] : $proposal;
            if (
                !$this->authorizationChecker->isGranted(
                    ProposalAnalysisRelatedVoter::ASSIGN_SUPERVISOR,
                    $proposal
                )
            ) {
                $connection = $this->builder->connectionFromArray($proposals, $input);
                $connection->setTotalCount(\count($proposals));

                return $this->buildPayload(
                    $connection,
                    ProposalAssignmentErrorCode::ACCESS_DENIED_TO_ASSIGN_SUPERVISOR
                );
            }
        }

        return $this->assignSupervisorToProposals($proposals, $supervisor, $viewer, $input);
    }

    private function revokeSupervisorToProposals(array $proposals, Arg $input): array
    {
        $this->proposalSupervisorRepository->deleteByProposalIds($proposals);
        /** @var Proposal $proposal */
        foreach ($proposals as $proposal) {
            $proposal->removeSupervisor();
        }
        $this->em->flush();

        $connection = $this->builder->connectionFromArray($proposals, $input);
        $connection->setTotalCount(\count($proposals));

        return $this->buildPayload($connection);
    }

    private function assignSupervisorToProposals(
        array $proposals,
        User $supervisor,
        User $viewer,
        Arg $input
    ): array {
        foreach ($proposals as $proposal) {
            /** @var Proposal $proposal */
            // change supervisor
            if ($proposal->getSupervisor()) {
                if ($proposal->getSupervisor() !== $supervisor) {
                    $proposal->changeSupervisor($supervisor, $viewer);
                    $proposal->removeAssessment();
                }
                // assign supervisor
            } else {
                $proposalSupervisor = (new ProposalSupervisor(
                    $proposal,
                    $supervisor
                ))->setAssignedBy($viewer);
                $proposal->setSupervisor($proposalSupervisor);
                $supervisor->addSupervisedProposal($proposalSupervisor);
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
