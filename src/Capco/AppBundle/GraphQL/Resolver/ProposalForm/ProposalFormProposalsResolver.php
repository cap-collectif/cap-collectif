<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use GraphQL\Executor\Promise\Promise;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Enum\OrderDirection;
use Symfony\Component\HttpFoundation\RequestStack;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\DataLoader\ProposalForm\ProposalFormProposalsDataLoader;

class ProposalFormProposalsResolver implements ResolverInterface
{
    private $dataLoader;

    public function __construct(ProposalFormProposalsDataLoader $dataLoader)
    {
        $this->dataLoader = $dataLoader;
    }

    public function __invoke(ProposalForm $form, Arg $args, $viewer, RequestStack $request): Promise
    {
        return $this->dataLoader->load(compact('form', 'args', 'viewer', 'request'));
    }

    public static function findOrderFromFieldAndDirection(string $field, string $direction): string
    {
        $order = 'random';

        switch ($field) {
            case 'VOTES':
                if (OrderDirection::ASC === $direction) {
                    $order = 'least-votes';
                } else {
                    $order = 'votes';
                }

                break;
            case 'PUBLISHED_AT':
                if (OrderDirection::ASC === $direction) {
                    $order = 'old';
                } else {
                    $order = 'last';
                }

                break;
            case 'COMMENTS':
                $order = 'comments';

                break;
            case 'COST':
                if (OrderDirection::ASC === $direction) {
                    $order = 'cheap';
                } else {
                    $order = 'expensive';
                }

                break;
        }

        return $order;
    }
}
