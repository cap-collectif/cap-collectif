<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Repository\QuestionnaireRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class AvailableQuestionnaireResolver implements QueryInterface
{
    public function __construct(
        private readonly QuestionnaireRepository $questionnaireRepository
    ) {
    }

    public function __invoke(Argument $args): array
    {
        return $this->questionnaireRepository->getAvailableQuestionnaires($args['term']);
    }
}
