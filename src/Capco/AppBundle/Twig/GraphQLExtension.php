<?php

namespace Capco\AppBundle\Twig;

use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Capco\AppBundle\Repository\CollectStepRepository;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;

class GraphQLExtension extends \Twig_Extension
{
    private $collectStepRepo;

    public function __construct(CollectStepRepository $collectStepRepo)
    {
        $this->collectStepRepo = $collectStepRepo;
    }

    public function getFunctions(): array
    {
        return [
            new \Twig_SimpleFunction('graphql_offset_to_cursor', [$this, 'getOffsetToCursor']),
            new \Twig_SimpleFunction('graphql_list_collect_steps', [$this, 'getCollectSteps']),
        ];
    }

    public function getOffsetToCursor(int $key): string
    {
        return ConnectionBuilder::offsetToCursor($key);
    }

    public function getCollectSteps(): array
    {
        $steps = $this->collectStepRepo->findAll();

        return array_map(function ($step) {
            return [
                'id' => GlobalId::toGlobalId('CollectStep', $step->getId()),
                'label' => $step->__toString(),
            ];
        }, $steps);
    }
}
