<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Repository\LogicJumpRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class DestinationJumpsResolver implements QueryInterface
{
    private readonly LogicJumpRepository $logicJumpRepository;

    public function __construct(LogicJumpRepository $logicJumpRepository)
    {
        $this->logicJumpRepository = $logicJumpRepository;
    }

    public function __invoke(AbstractQuestion $question, Arg $args)
    {
        return $this->logicJumpRepository->findDestinationJumps($question);
    }
}
