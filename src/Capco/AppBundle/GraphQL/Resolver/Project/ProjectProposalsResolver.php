<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\GraphQL\DataLoader\Project\ProjectProposalsDataLoader;
use Capco\UserBundle\Entity\User;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\PromiseAdapter\PromiseAdapterInterface;

class ProjectProposalsResolver implements QueryInterface
{
    public function __construct(protected ProjectProposalsDataLoader $dataLoader, protected PromiseAdapterInterface $promiseAdapter)
    {
    }

    public function __invoke(Project $project, ?Arg $args = null, $viewer = null): Promise
    {
        if (!$args) {
            $args = new Arg([
                'first' => 0,
                'orderBy' => ['field' => 'PUBLISHED_AT', 'direction' => 'ASC'],
            ]);
        }

        // We need viewer in key for correct results
        if ($viewer && $viewer instanceof User && $viewer->isAdmin()) {
            return $this->dataLoader->load(compact('args', 'project', 'viewer'));
        }

        // We need viewer in key for correct results
        if (!$project->isPublic()) {
            return $this->dataLoader->load(compact('args', 'project', 'viewer'));
        }

        // We need viewer in key for correct results
        if ($project->getFirstCollectStep() && $project->getFirstCollectStep()->isPrivate()) {
            return $this->dataLoader->load(compact('args', 'project', 'viewer'));
        }

        // We can consider nullable viewer for a reusable cache key.
        $viewer = null;
        // Null visibility will avoid private proposals
        return $this->dataLoader->load(compact('args', 'project', 'viewer'));
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
