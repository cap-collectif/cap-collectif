<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Doctrine\Common\Collections\ArrayCollection;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QuestionQuestionChoicesResolver implements ResolverInterface
{
    public function __invoke(AbstractQuestion $question, Arg $args): iterable
    {
        if (!$question instanceof MultipleChoiceQuestion) {
            return [];
        }

        if (true === $args['allowRandomize'] && $question->isRandomQuestionChoices()) {
            $choices = $question->getChoices()->toArray();
            shuffle($choices);

            return new ArrayCollection($choices);
        }

        return $question->getChoices();
    }
}
