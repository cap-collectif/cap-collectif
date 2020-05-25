<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Enum\ProposalAssignmentErrorCode;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ProposalAnalysisRepository;
use Capco\AppBundle\Security\ProposalAnalysisRelatedVoter;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class AssignAnalystsToProposalsMutation implements MutationInterface
{
    use ResolverTrait;

    private const NB_MAX_ANALYSTS_ASSIGNED = 10;
    private $globalIdResolver;
    private $em;
    private $builder;
    /** @var ProposalAnalysisRepository $proposalAnalysisRepository */
    private $proposalAnalysisRepository;
    private $authorizationChecker;

    public function __construct(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        ConnectionBuilder $builder,
        AuthorizationCheckerInterface $authorizationChecker,
        ProposalAnalysisRepository $proposalAnalysisRepository
    ) {
        $this->globalIdResolver = $globalIdResolver;
        $this->em = $em;
        $this->builder = $builder;
        $this->proposalAnalysisRepository = $proposalAnalysisRepository;
        $this->authorizationChecker = $authorizationChecker;
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
