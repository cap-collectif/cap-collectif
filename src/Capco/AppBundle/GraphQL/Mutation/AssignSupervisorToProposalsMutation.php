<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
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
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class AssignSupervisorToProposalsMutation implements MutationInterface
{
    use ResolverTrait;

    private GlobalIdResolver $globalIdResolver;
    private EntityManagerInterface $em;
    private ConnectionBuilder $builder;
    private ProposalSupervisorRepository $proposalSupervisorRepository;
    private AuthorizationCheckerInterface $authorizationChecker;
    private Publisher $publisher;

    public function __construct(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        ConnectionBuilder $builder,
        ProposalSupervisorRepository $proposalSupervisorRepository,
        AuthorizationCheckerInterface $authorizationChecker,
        Publisher $publisher
    ) {
        $this->globalIdResolver = $globalIdResolver;
        $this->em = $em;
        $this->builder = $builder;
        $this->proposalSupervisorRepository = $proposalSupervisorRepository;
        $this->authorizationChecker = $authorizationChecker;
        $this->publisher = $publisher;
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
            return $this->unassignedSupervisor($proposals, $input);
        }

        /** @var Proposal $proposal */
        foreach ($proposals as $proposal) {
            $connection = $this->buildErrorConnection($proposal, $proposals, $input);
            if (null === $connection) {
                continue;
            }

            return $this->buildPayload(
                $connection,
                ProposalAssignmentErrorCode::ACCESS_DENIED_TO_ASSIGN_SUPERVISOR
            );
        }

        $assignationChanges = self::getAssignationChanges($proposals, $supervisor);
        $payload = $this->assignSupervisorToProposals($proposals, $supervisor, $viewer, $input);
        $this->notify($assignationChanges, $supervisor);

        return $payload;
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
        /** @var Proposal $proposal */
        foreach ($proposals as $proposal) {
            // change supervisor
            if ($proposal->getSupervisor() && $supervisor !== $proposal->getSupervisor()) {
                $proposal->changeSupervisor($supervisor, $viewer);
                $proposal->removeAssessment();

                continue;
            }
            // assign supervisor
            $proposalSupervisor = (new ProposalSupervisor($proposal, $supervisor))->setAssignedBy(
                $viewer
            );
            $proposal->setSupervisor($proposalSupervisor);
            $supervisor->addSupervisedProposal($proposalSupervisor);
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

    private function notify(array $assignationsChanges, User $supervisor): void
    {
        $message = [
            'assigned' => $supervisor->getId(),
            'role' => 'tag.filter.opinion',
            'proposals' => [],
        ];
        foreach ($assignationsChanges['newAssignations'] as $proposal) {
            $message['proposals'][] = $proposal->getId();
        }
        $this->publisher->publish(
            CapcoAppBundleMessagesTypes::PROPOSAL_ASSIGNATION,
            new Message(json_encode($message))
        );
        foreach ($assignationsChanges['revokations'] as $revokation) {
            $message = [
                'assigned' => $revokation['supervisor']->getId(),
                'proposals' => [],
            ];
            foreach ($revokation['unassignations'] as $proposal) {
                $message['proposals'][] = $proposal->getId();
            }
            $this->publisher->publish(
                CapcoAppBundleMessagesTypes::PROPOSAL_REVOKE,
                new Message(json_encode($message))
            );
        }
    }

    private static function getAssignationChanges(array $proposals, User $newSupervisor): array
    {
        $newAssignations = [];
        $revokations = [];
        foreach ($proposals as $proposal) {
            $proposal = \is_array($proposal) ? $proposal[0] : $proposal;
            $supervisor = $proposal->getSupervisor();
            if ($supervisor instanceof User && $supervisor === $newSupervisor) {
                continue;
            }
            $newAssignations[] = $proposal;
            if (!$supervisor instanceof User) {
                continue;
            }
            if (!isset($revokations[$supervisor->getUsername()])) {
                $revokations[$supervisor->getUsername()] = [
                    'supervisor' => $supervisor,
                    'unassignations' => [],
                ];
            }
            $revokations[$supervisor->getUsername()]['unassignations'][] = $proposal;
        }

        return [
            'newAssignations' => $newAssignations,
            'revokations' => $revokations,
        ];
    }

    private function unassignedSupervisor(array $proposals, Arg $input): array
    {
        /** @var Proposal $proposal */
        foreach ($proposals as $proposal) {
            $connection = $this->buildErrorConnection($proposal, $proposals, $input);
            if (!$connection) {
                continue;
            }

            return $this->buildPayload(
                $connection,
                ProposalAssignmentErrorCode::ACCESS_DENIED_TO_REVOKE_SUPERVISOR
            );
        }

        return $this->revokeSupervisorToProposals($proposals, $input);
    }

    private function buildErrorConnection(
        $proposal,
        array $proposals,
        Arg $input
    ): ?ConnectionInterface {
        $proposal = \is_array($proposal) ? $proposal[0] : $proposal;
        if ($this->isGranted($proposal)) {
            return null;
        }

        $connection = $this->builder->connectionFromArray($proposals, $input);
        $connection->setTotalCount(\count($proposals));

        return $connection;
    }

    private function isGranted($proposal): bool
    {
        return $this->authorizationChecker->isGranted(
            ProposalAnalysisRelatedVoter::ASSIGN_SUPERVISOR,
            $proposal
        );
    }
}
