<?php
namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Search\ProposalSearch;
use Capco\AppBundle\Repository\ProposalRepository;
use Symfony\Component\HttpFoundation\RequestStack;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;

class ProposalFormViewerProposalsUnpublishedResolver implements ResolverInterface
{
    private $proposalRepo;

    public function __construct(ProposalRepository $proposalRepo)
    {
        $this->proposalRepo = $proposalRepo;
    }

    public function __invoke(ProposalForm $form, Arg $args, User $viewer): Connection
    {
        $proposals = $this->proposalRepo->getUnpublishedByFormAndAuthor($form, $viewer);

        $connection = ConnectionBuilder::connectionFromArray($proposals, $args);
        $connection->totalCount = \count($proposals);

        return $connection;
    }
}
