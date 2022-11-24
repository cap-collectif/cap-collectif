<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
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
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class AssignDecisionMakerToProposalsMutation implements MutationInterface
{
    use ResolverTrait;

    private GlobalIdResolver $globalIdResolver;
    private EntityManagerInterface $em;
    private ConnectionBuilder $builder;
    private ProposalDecisionMakerRepository $proposalDecisionMakerRepository;
    private AuthorizationCheckerInterface $authorizationChecker;
    private Publisher $publisher;

    public function __construct(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        ConnectionBuilder $builder,
        AuthorizationCheckerInterface $authorizationChecker,
        ProposalDecisionMakerRepository $proposalDecisionMakerRepository,
        Publisher $publisher
    ) {
        $this->globalIdResolver = $globalIdResolver;
        $this->em = $em;
        $this->builder = $builder;
        $this->proposalDecisionMakerRepository = $proposalDecisionMakerRepository;
        $this->authorizationChecker = $authorizationChecker;
        $this->publisher = $publisher;
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
            $connection = $this->buildErrorConnection($proposals, $input);
            if ($connection instanceof ConnectionInterface) {
                return $this->buildPayload(
                    $connection,
                    ProposalAssignmentErrorCode::ACCESS_DENIED_TO_REVOKE_DECISION_MAKER
                );
            }

            return $this->revokeDecisionMakerToProposals($proposals, $input);
        }

        $connection = $this->buildErrorConnection($proposals, $input);
        if ($connection instanceof ConnectionInterface) {
            return $this->buildPayload(
                $connection,
                ProposalAssignmentErrorCode::ACCESS_DENIED_TO_ASSIGN_DECISION_MAKER
            );
        }

        $assignationChanges = self::getAssignationChanges($proposals, $decisionMaker);
        $payload = $this->assignDecisionMakerToProposals($proposals, $decisionMaker, $input);
        $this->notify($assignationChanges, $decisionMaker);

        return $payload;
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
            if ($proposal->getDecisionMaker() && $proposal->getDecisionMaker() !== $decisionMaker) {
                $proposal->changeDecisionMaker($decisionMaker);
                $proposal->removeDecision();

                continue;
            }
            // assign decision maker
            $proposalDecisionMaker = new ProposalDecisionMaker($proposal, $decisionMaker);
            $proposal->setProposalDecisionMaker($proposalDecisionMaker);
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

    private function notify(array $assignationsChanges, User $decisionMaker): void
    {
        $message = [
            'assigned' => $decisionMaker->getId(),
            'role' => 'tag.filter.decision',
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
                'assigned' => $revokation['decisionMaker']->getId(),
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

    private static function getAssignationChanges(array $proposals, User $newDecisionMaker): array
    {
        $newAssignations = [];
        $revokations = [];
        foreach ($proposals as $proposal) {
            $proposal = \is_array($proposal) ? $proposal[0] : $proposal;
            if ($proposal->getDecisionMaker() === $newDecisionMaker) {
                continue;
            }
            $newAssignations[] = $proposal;
            $supervisor = $proposal->getSupervisor();
            if (!$supervisor) {
                continue;
            }
            if (!isset($revokations[$supervisor->getUsername()])) {
                $revokations[$supervisor->getUsername()] = [
                    'decisionMaker' => $supervisor,
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

    private function isGranted($proposal): bool
    {
        return $this->authorizationChecker->isGranted(
            ProposalAnalysisRelatedVoter::ASSIGN_DECISION_MAKER,
            $proposal
        );
    }

    private function buildErrorConnection(array $proposals, Arg $input): ?ConnectionInterface
    {
        /** @var Proposal $proposal */
        foreach ($proposals as $proposal) {
            $proposal = \is_array($proposal) ? $proposal[0] : $proposal;
            if ($this->isGranted($proposal)) {
                return null;
            }

            $connection = $this->builder->connectionFromArray($proposals, $input);
            $connection->setTotalCount(\count($proposals));

            return $connection;
        }

        return null;
    }
}
