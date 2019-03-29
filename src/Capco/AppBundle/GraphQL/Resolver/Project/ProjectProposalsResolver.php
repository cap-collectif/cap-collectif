<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\DataLoader\Project\ProjectProposalsDataLoader;
use Overblog\PromiseAdapter\PromiseAdapterInterface;

class ProjectProposalsResolver implements ResolverInterface
{
    protected $dataLoader;
    protected $promiseAdapter;

    public function __construct(
        ProjectProposalsDataLoader $dataLoader,
        PromiseAdapterInterface $promiseAdapter
    ) {
        $this->dataLoader = $dataLoader;
        $this->promiseAdapter = $promiseAdapter;
    }

    public function __invoke(Project $project, ?Arg $args = null): Promise
    {
        if (!$args) {
            $args = new Arg([
                'first' => 0,
                'orderBy' => ['field' => 'PUBLISHED_AT', 'direction' => 'ASC'],
            ]);
        }

        return $this->dataLoader->load(compact('args', 'project'));
    }

    public function resolveSync(Project $project, ?Arg $args = null): Connection
    {
        $conn = null;

        $this->promiseAdapter->await(
            $this->__invoke($project, $args)->then(function (Connection $value) use (&$conn) {
                $conn = $value;
            })
        );

        return $conn;
    }
}
