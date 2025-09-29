<?php

namespace Capco\AppBundle\GraphQL\Resolver\Questionnaire;

use Capco\AppBundle\Entity\Questionnaire;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Routing\RouterInterface;

class QuestionnaireAdminUrlResolver implements QueryInterface
{
    public function __construct(
        private readonly RouterInterface $router
    ) {
    }

    public function __invoke(Questionnaire $questionnaire): string
    {
        return $this->router->generate(
            'admin_capco_app_questionnaire_edit',
            ['id' => $questionnaire->getId()],
            RouterInterface::ABSOLUTE_URL
        );
    }
}
