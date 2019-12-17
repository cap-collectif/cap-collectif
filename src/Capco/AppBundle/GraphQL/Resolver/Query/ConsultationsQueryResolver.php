<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Repository\ConsultationRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class ConsultationsQueryResolver implements ResolverInterface
{
    private $consultationRepository;

    public function __construct(ConsultationRepository $consultationRepository)
    {
        $this->consultationRepository = $consultationRepository;
    }

    public function __invoke(Arg $args)
    {
        if ($args->offsetExists('id')) {
            $consultationId = GlobalId::fromGlobalId($args->offsetGet('id'))['id'];
            $consultation = $this->consultationRepository->find($consultationId);

            return [$consultation];
        }

        return $this->consultationRepository->findAll();
    }
}
