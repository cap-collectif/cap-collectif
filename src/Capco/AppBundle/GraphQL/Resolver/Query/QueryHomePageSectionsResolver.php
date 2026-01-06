<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Entity\Section\Section;
use Capco\AppBundle\Enum\HomePageSectionOrderField;
use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Repository\SectionRepository;
use Capco\AppBundle\Toggle\Manager;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class QueryHomePageSectionsResolver implements QueryInterface
{
    public function __construct(
        private readonly SectionRepository $sectionRepository,
        private readonly Manager $toggleManager,
    ) {
    }

    public function __invoke(Argument $args): ConnectionInterface|Promise
    {
        $enabled = $args->offsetExists('enabled') ? $args->offsetGet('enabled') : true;
        $orderBy = $args->offsetGet('orderBy') ?? [
            'field' => HomePageSectionOrderField::POSITION,
            'direction' => OrderDirection::ASC,
        ];

        $criteria = [];
        if (null !== $enabled) {
            $criteria['enabled'] = $enabled;
        }

        $orderField = $orderBy['field'] ?? HomePageSectionOrderField::POSITION;
        $orderDirection = $orderBy['direction'] ?? OrderDirection::ASC;
        $orderByClause = [
            $this->getOrderByField($orderField) => $orderDirection,
        ];

        /** @var array<Section> $allSections */
        $allSections = $this->sectionRepository->findBy($criteria, $orderByClause);

        $filteredSections = $this->filterByEnabledFeatureToggle($allSections);

        $total = \count($filteredSections);

        $paginator = new Paginator(fn (int $offset, int $limit) => \array_slice($filteredSections, $offset, $limit));

        return $paginator->auto($args, $total);
    }

    /**
     * @param array<Section> $sections
     *
     * @return array<Section>
     */
    private function filterByEnabledFeatureToggle(array $sections): array
    {
        return array_filter($sections, fn (Section $section) => $this->hasAllFeaturesEnabled($section));
    }

    private function hasAllFeaturesEnabled(Section $section): bool
    {
        $requiredFeatures = $section->getAssociatedFeatures();

        if (empty($requiredFeatures)) {
            return true;
        }

        foreach ($requiredFeatures as $feature) {
            if (!$this->toggleManager->isActive($feature)) {
                return false;
            }
        }

        return true;
    }

    private function getOrderByField(string $field): string
    {
        return match ($field) {
            HomePageSectionOrderField::POSITION => 'position',
            HomePageSectionOrderField::CREATED_AT => 'createdAt',
            HomePageSectionOrderField::UPDATED_AT => 'updatedAt',
            default => 'position',
        };
    }
}
