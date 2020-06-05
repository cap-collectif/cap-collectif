<?php

namespace Capco\AppBundle\GraphQL\Resolver\Questionnaire;

use Capco\AppBundle\Entity\Questionnaire;
use Symfony\Component\Routing\RouterInterface;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QuestionnaireAdminUrlResolver implements ResolverInterface
{
    private $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
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
