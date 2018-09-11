<?php
namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class QuestionQuestionChoicesResolver implements ResolverInterface
{
    public function __invoke(AbstractQuestion $question, Arg $args): iterable
    {
        if (!$question instanceof MultipleChoiceQuestion) {
            return [];
        }

        if ($args['randomize'] && $question->isRandomQuestionChoices()) {
            $choices = $question->getQuestionChoices()->toArray();
            shuffle($choices);
            return new ArrayCollection($choices);
        }

        return $question->getQuestionChoices();
    }
}
