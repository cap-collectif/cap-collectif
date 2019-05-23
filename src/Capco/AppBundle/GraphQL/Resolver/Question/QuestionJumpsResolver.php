<?php
namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Entity\LogicJump;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Doctrine\Common\Collections\Collection;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QuestionJumpsResolver implements ResolverInterface
{

    public function __invoke(AbstractQuestion $question, Arg $args): Collection
    {
        $always = $args->offsetGet('always');

        return $question->getJumps()->filter(static function (LogicJump $jump) use ($always) {
            return $jump->isAlways() === $always;
        });
    }
}
