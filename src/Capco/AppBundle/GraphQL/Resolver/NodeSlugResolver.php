<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Interfaces\SluggableInterface;
use Doctrine\Persistence\ManagerRegistry;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;

class NodeSlugResolver implements QueryInterface
{
    public function __construct(private readonly ManagerRegistry $managerRegistry)
    {
    }

    public function __invoke(Argument $argument): ?SluggableInterface
    {
        $entity = $argument->offsetGet('entity');
        $slug = $argument->offsetGet('slug');
        $projectSlug = $argument->offsetGet('projectSlug');
        $fqcn = $this->resolveFqcn($entity);

        if (!class_exists($fqcn) || !is_subclass_of($fqcn, SluggableInterface::class)) {
            throw new UserError('Class not found or does not implement SluggableInterface.');
        }

        if ('STEP' === $entity) {
            $result = $this->managerRegistry->getRepository($fqcn)->getOneBySlugAndProjectSlug($slug, $projectSlug);
            if (null === $result) {
                throw new UserError('Entity not found.');
            }

            return $result;
        }

        $result = $this->managerRegistry->getRepository($fqcn)->getBySlug($slug);
        if (null === $result) {
            throw new UserError('Entity not found.');
        }

        return $result;
    }

    private function resolveFqcn(string $entity): string
    {
        $entityNamespace = 'Capco\AppBundle\Entity';

        $entityWords = explode('_', strtolower($entity));
        $className = implode('', array_map('ucfirst', $entityWords));
        if ('District' === $className) {
            $className = 'GlobalDistrict';
        }
        if ('Step' === $className) {
            $className = 'AbstractStep';
        }

        $subNamespaceMap = [
            'organization' => 'Organization',
            'district' => 'District',
            'proposal_district' => 'District',
            'step' => 'Steps',
        ];

        $entityWord = $entityWords[0] ?? null;
        $secondEntityWord = $entityWords[1] ?? null;

        $subNamespace = $subNamespaceMap[$entityWord] ?? $subNamespaceMap[$secondEntityWord] ?? null;

        return $subNamespace
            ? "{$entityNamespace}\\{$subNamespace}\\{$className}"
            : "{$entityNamespace}\\{$className}";
    }
}
