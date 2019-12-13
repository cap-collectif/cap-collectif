<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Doctrine\Common\Collections\Criteria;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class StepStatusesResolver implements ResolverInterface
{
    public function __invoke(AbstractStep $step): iterable
    {
        return $step->getStatuses()->matching(
            AbstractStepRepository::createOrderedByCritera([
                'position' => Criteria::ASC
            ])
        );
    }
}
