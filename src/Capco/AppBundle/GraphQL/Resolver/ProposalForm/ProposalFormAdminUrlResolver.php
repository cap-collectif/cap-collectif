<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Routing\RouterInterface;

class ProposalFormAdminUrlResolver implements ResolverInterface
{
    private $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    public function __invoke(ProposalForm $proposalForm): string
    {
        return $this->router->generate(
            'admin_capco_app_proposalform_edit',
            [
                'id' => $proposalForm->getId(),
            ],
            true
        );
    }
}
