<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Doctrine\Common\Collections\ArrayCollection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalFormQuestionsResolver implements ResolverInterface
{
    public function __invoke(ProposalForm $form): iterable
    {
        // We always return question sorted by position to avoid flickering issues in bo after a user has moved a question.
        // The weird thing here is that it should be normally handled by the @OrderBy clause in the entity but it does
        // not seem to works
        $realQuestions = $form->getRealQuestions();
        $iterator = $realQuestions->getIterator();
        $iterator->uasort(static function (AbstractQuestion $a, AbstractQuestion $b) {
            return $a->getPosition() <=> $b->getPosition();
        });

        return new ArrayCollection(iterator_to_array($iterator));
    }
}
