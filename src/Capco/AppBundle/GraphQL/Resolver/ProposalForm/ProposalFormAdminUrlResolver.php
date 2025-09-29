<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class ProposalFormAdminUrlResolver implements QueryInterface
{
    public function __construct(
        private readonly RouterInterface $router
    ) {
    }

    public function __invoke(ProposalForm $proposalForm): string
    {
        return $this->router->generate(
            'admin_capco_app_proposalform_edit',
            [
                'id' => $proposalForm->getId(),
            ],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
