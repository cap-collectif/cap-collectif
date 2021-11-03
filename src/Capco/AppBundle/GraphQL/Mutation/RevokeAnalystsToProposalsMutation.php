<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalAnalysis;
use Capco\AppBundle\Enum\ProposalAssignmentErrorCode;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ProposalAnalysisRepository;
use Capco\AppBundle\Repository\ProposalAnalystRepository;
use Capco\AppBundle\Security\ProposalAnalysisRelatedVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class RevokeAnalystsToProposalsMutation implements MutationInterface
{
    use ResolverTrait;

    private GlobalIdResolver $globalIdResolver;
    private EntityManagerInterface $em;
    private ConnectionBuilder $builder;
    private ProposalAnalystRepository $proposalAnalystRepository;
    private AuthorizationCheckerInterface $authorizationChecker;
    private ProposalAnalysisRepository $proposalAnalysisRepository;
    private LoggerInterface $logger;
    private Publisher $publisher;

    public function __construct(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        ConnectionBuilder $builder,
        AuthorizationCheckerInterface $authorizationChecker,
        ProposalAnalystRepository $proposalAnalystRepository,
        ProposalAnalysisRepository $proposalAnalysisRepository,
        LoggerInterface $logger,
        Publisher $publisher
    ) {
        $this->globalIdResolver = $globalIdResolver;
        $this->em = $em;
        $this->builder = $builder;
        $this->proposalAnalystRepository = $proposalAnalystRepository;
        $this->authorizationChecker = $authorizationChecker;
        $this->proposalAnalysisRepository = $proposalAnalysisRepository;
        $this->logger = $logger;
        $this->publisher = $publisher;
    }

    public function __invoke(Arg $input, $viewer): array
    {
        $this->preventNullableViewer($viewer);

        $proposalIds = $input->offsetGet('proposalIds');
        $analystIds = $input->offsetGet('analystIds');
        $proposals = $this->globalIdResolver->resolveTypeByIds($proposalIds, $viewer, 'Proposal');
        $connection = $this->builder->connectionFromArray($proposals, $input);
        $connection->setTotalCount(\count($proposals));

        $analysts =
            $analystIds && \count($analystIds) > 0
                ? $this->globalIdResolver->resolveTypeByIds($analystIds, $viewer, 'User')
                : [];

        foreach ($proposals as $proposal) {
            if (
                !$this->authorizationChecker->isGranted(
                    ProposalAnalysisRelatedVoter::ASSIGN_ANALYST,
                    $proposal
                )
            ) {
                return $this->buildPayload(
                    $connection,
                    $viewer,
                    ProposalAssignmentErrorCode::ACCESS_DENIED_TO_ASSIGN_ANALYST
                );
            }
        }

        // Check if viewer is not analyst in proposal list
        if (
            $this->isViewerAnalystOfProposals($proposals, $viewer) &&
            !($viewer->isAdmin() || $viewer->isSuperAdmin()) &&
            \in_array(GlobalId::toGlobalId('User', $viewer->getId()), $analystIds, true)
        ) {
            return $this->buildPayload(
                $connection,
                $viewer,
                ProposalAssignmentErrorCode::CANT_REVOKE_YOURSELF
            );
        }

        if ($this->someProposalsGotProposalAnalysis($proposals, $analysts) && !$viewer->isAdmin()) {
            $connection = $this->builder->connectionFromArray($proposals, $input);
            $connection->setTotalCount(\count($proposals));

            return $this->buildPayload(
                $connection,
                $viewer,
                ProposalAssignmentErrorCode::IN_PROGRESS_ANALYSIS_REVOKE_ANALYST_DENIED
            );
        }

        if (empty($analysts)) {
            try {
                $this->revokeAllAnalystsFromProposals($proposals, $viewer);
                $connection = $this->builder->connectionFromArray($proposals, $input);
                $connection->setTotalCount(\count($proposals));

                return $this->buildPayload($connection, $viewer);
            } catch (\Exception $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
            }
        } else {
            $this->revokeAnalystsFromProposalsAndAnalysts($proposals, $analysts, $viewer);
        }

        foreach ($analysts as $analyst) {
            $message = [
                'assigned' => $analyst->getId(),
                'proposals' => [],
            ];
            foreach ($proposals as $proposal) {
                $message['proposals'][] = $proposal->getId();
            }
            $this->publisher->publish(
                CapcoAppBundleMessagesTypes::PROPOSAL_REVOKE,
                new Message(json_encode($message))
            );
        }

        $connection = $this->builder->connectionFromArray($proposals, $input);
        $connection->setTotalCount(\count($proposals));

        return $this->buildPayload($connection, $viewer);
    }

    private function isViewerAnalystOfProposals(array $proposals, User $viewer): bool
    {
        return \count(
            $this->proposalAnalystRepository->findBy([
                'proposal' => $proposals,
                'analyst' => $viewer,
            ])
        ) > 0;
    }

    private function someProposalsGotProposalAnalysis(array $proposals, array $analyzers): bool
    {
        $params = ['proposal' => $proposals];
        if (!empty($analyzers)) {
            $params['updatedBy'] = $analyzers;
        }

        return \count($this->proposalAnalysisRepository->findBy($params)) > 0;
    }

    private function revokeAllAnalystsFromProposals(array $proposals, User $viewer): void
    {
        /** @var Proposal $proposal */
        foreach ($proposals as $proposal) {
            if ($viewer->isAdmin()) {
                $proposal->clearProposalAnalyses();
            }

            $proposal->clearProposalAnalysts();
        }

        $this->em->flush();
    }

    private function revokeAnalystsFromProposalsAndAnalysts(
        array $proposals,
        array $analysts,
        User $viewer
    ): void {
        /** @var Proposal $proposal */
        foreach ($proposals as $proposal) {
            foreach ($analysts as $analyst) {
                $proposal->removeAnalyst($analyst);
                if ($viewer->isAdmin() && $proposal->getAnalyses()->count() > 0) {
                    /** @var ProposalAnalysis $proposalAnalysis */
                    foreach ($proposal->getAnalyses() as $proposalAnalysis) {
                        if ($analyst === $proposalAnalysis->getUpdatedBy()) {
                            $proposal->removeProposalAnalysis($proposalAnalysis);
                        }
                    }
                }
            }
        }

        $this->em->flush();
    }

    private function buildPayload(
        ConnectionInterface $proposalConnexion,
        User $viewer,
        ?string $errorMessage = null
    ): array {
        return [
            'proposals' => $proposalConnexion,
            'errorCode' => $errorMessage,
            'viewer' => $viewer,
        ];
    }
}
