<?php
namespace Capco\AppBundle\GraphQL\Resolver\Draftable;

use GraphQL\Type\Definition\Type;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Proposal;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Resolver\TypeResolver;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class DraftableTypeResolver implements ResolverInterface
{
    private $typeResolver;

    public function __construct(TypeResolver $typeResolver)
    {
        $this->typeResolver = $typeResolver;
    }

    public function __invoke($node): Type
    {
        if ($node instanceof Proposal) {
            return $this->typeResolver->resolve('Proposal');
        }
        if ($node instanceof Reply) {
            return $this->typeResolver->resolve('Reply');
        }

        throw new UserError('Could not resolve type of Draftable.');
    }
}
