<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Enum\ProposalAssignmentErrorCode;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ProposalAnalysisRepository;
use Capco\AppBundle\Security\ProposalAnalysisRelatedVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class AssignAnalystsToProposalsMutation implements MutationInterface
{
    use ResolverTrait;

    private const NB_MAX_ANALYSTS_ASSIGNED = 10;
    private GlobalIdResolver $globalIdResolver;
    private EntityManagerInterface $em;
    private ConnectionBuilder $builder;
    private ProposalAnalysisRepository $proposalAnalysisRepository;
    private AuthorizationCheckerInterface $authorizationChecker;
    private Publisher $publisher;

    public function __construct(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        ConnectionBuilder $builder,
        AuthorizationCheckerInterface $authorizationChecker,
        ProposalAnalysisRepository $proposalAnalysisRepository,
        Publisher $publisher
    ) {
        $this->globalIdResolver = $globalIdResolver;
        $this->em = $em;
        $this->builder = $builder;
        $this->proposalAnalysisRepository = $proposalAnalysisRepository;
        $this->authorizationChecker = $authorizationChecker;
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

        foreach ($proposals as $proposal) {
            if (
                !$this->authorizationChecker->isGranted(
                    ProposalAnalysisRelatedVoter::ASSIGN_ANALYST,
                    $proposal
                )
            ) {
                return $this->buildPayload(
                    $connection,
                    ProposalAssignmentErrorCode::ACCESS_DENIED_TO_ASSIGN_ANALYST
                );
            }
        }
        $nbAnalysts = \count($analystIds);
        if ($nbAnalysts > self::NB_MAX_ANALYSTS_ASSIGNED) {
            return $this->buildPayload(
                $connection,
                ProposalAssignmentErrorCode::MAX_ANALYSTS_REACHED
            );
        }

        $analysts = $analystIds
            ? $this->globalIdResolver->resolveTypeByIds($analystIds, $viewer, 'User')
            : null;

        $newAssignations = self::getNewAssignations($proposals, $analysts);

        /** @var Proposal $proposal */
        foreach ($proposals as $proposal) {
            if ($nbAnalysts + $proposal->getAnalysts()->count() > self::NB_MAX_ANALYSTS_ASSIGNED) {
                return $this->buildPayload(
                    $connection,
                    ProposalAssignmentErrorCode::MAX_ANALYSTS_REACHED
                );
            }

            $proposal->addAnalysts($analysts);
        }
        $this->em->flush();

        $this->notifyNewAnalysts($newAssignations);

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

    private static function getNewAssignations(array $proposals, array $analysts): array
    {
        $newAssignations = [];
        foreach ($analysts as $analyst) {
            $proposals = self::getNewAssignationsForAnalyst($proposals, $analyst);
            if (!empty($proposals)) {
                $newAssignations[] = [
                    'analyst' => $analyst,
                    'proposals' => $proposals,
                ];
            }
        }

        return $newAssignations;
    }

    private static function getNewAssignationsForAnalyst(array $proposals, User $analyst): array
    {
        $newAssignations = [];
        foreach ($proposals as $proposal) {
            if (!$proposal->getAnalysts()->contains($analyst)) {
                $newAssignations[] = $proposal;
            }
        }

        return $newAssignations;
    }

    private function notifyNewAnalysts(array $newAssignations): void
    {
        foreach ($newAssignations as $newAnalyst) {
            $message = [
                'assigned' => $newAnalyst['analyst']->getId(),
                'role' => 'admin.global.evaluers',
                'proposals' => [],
            ];
            foreach ($newAnalyst['proposals'] as $proposal) {
                $message['proposals'][] = $proposal->getId();
            }
            $this->publisher->publish(
                CapcoAppBundleMessagesTypes::PROPOSAL_ASSIGNATION,
                new Message(json_encode($message))
            );
        }
    }
}
