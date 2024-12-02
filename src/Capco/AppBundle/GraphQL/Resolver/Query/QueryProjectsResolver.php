<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Enum\ProjectArchiveFilter;
use Capco\AppBundle\Enum\ProjectOrderField;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\QueryAnalyzer;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Search\ProjectSearch;
use Capco\UserBundle\Entity\User;
use GraphQL\Type\Definition\ResolveInfo;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class QueryProjectsResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(private readonly ProjectSearch $projectSearch, private readonly LoggerInterface $logger, private readonly QueryAnalyzer $queryAnalyzer, private readonly LocaleRepository $localeRepository)
    {
    }

    public function __invoke(
        Argument $args,
        ?User $viewer,
        RequestStack $request,
        ResolveInfo $resolveInfo
    ): ConnectionInterface {
        $this->protectArguments($args);
        $this->queryAnalyzer->analyseQuery($resolveInfo);

        return $this->resolve($args, $request, $viewer);
    }

    public function resolve(
        Argument $args,
        ?RequestStack $request = null,
        ?User $viewer = null
    ): ConnectionInterface {
        try {
            $totalCount = 0;
            $paginator = new Paginator(function (int $offset, int $limit) use (
                $args,
                $request,
                $viewer,
                &$totalCount
            ) {
                $this->setLocaleId($args, $request);
                $term = $args->offsetExists('term') ? $args->offsetGet('term') : null;
                $orderBy = $args->offsetExists('orderBy')
                    ? $args->offsetGet('orderBy')
                    : [
                        'field' => ProjectOrderField::PUBLISHED_AT,
                        'direction' => OrderDirection::DESC,
                    ];
                $onlyPublic = $args->offsetExists('onlyPublic')
                    ? $args->offsetGet('onlyPublic')
                    : false;

                $results = $this->projectSearch->searchProjects(
                    0,
                    1000,
                    $orderBy,
                    $term,
                    $this->getFilters($args)
                );
                // @TODO: this logic should be done in Elasticsearch not PHP
                // https://github.com/cap-collectif/platform/issues/8616
                $allResults = [];
                // @var Project $project
                if (!$onlyPublic) {
                    foreach ($results['projects'] as $project) {
                        if ($project instanceof Project && $project->canDisplay($viewer)) {
                            $allResults[] = $project;
                        }
                    }
                } else {
                    foreach ($results['projects'] as $project) {
                        if ($project instanceof Project && $project->isPublic()) {
                            $allResults[] = $project;
                        }
                    }
                }
                $totalCount = \count($allResults);

                return \array_slice($allResults, $offset, $limit);
            });
            $connection = $paginator->auto($args, $totalCount);
            $connection->setTotalCount($totalCount);

            return $connection;
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' ' . $exception->getMessage(), [
                'exception' => $exception,
            ]);
        }

        return ConnectionBuilder::empty();
    }

    private function getFilters(Argument $args): array
    {
        $filters = [];
        if ($args->offsetExists('status') && '' !== $args['status']) {
            $filters['projectStatus'] = $args->offsetGet('status');
        }
        if ($args->offsetExists('theme') && '' !== $args['theme']) {
            $filters['themes.id'] = $args->offsetGet('theme');
        }
        if ($args->offsetExists('type') && '' !== $args['type']) {
            $filters['projectType.id'] = $args->offsetGet('type');
        }
        if ($args->offsetExists('author') && '' !== $args['author']) {
            $filters['authors.id'] = GlobalId::fromGlobalId($args->offsetGet('author'))['id'];
        }
        if ($args->offsetExists('district') && '' !== $args['district']) {
            $filters['districts.district.id'] = GlobalId::fromGlobalId($args->offsetGet('district'))['id'];
        }
        if ($args->offsetExists('withEventOnly') && false !== $args['withEventOnly']) {
            $filters['withEventOnly'] = $args['withEventOnly'];
        }
        if ($args->offsetExists('locale') && '' != $args['locale']) {
            $filters['locale'] = $args['locale'];
        }
        if ($args->offsetExists('archived') && !empty($args->offsetGet('archived'))) {
            $filters['archived'] = ProjectArchiveFilter::ARCHIVED === $args->offsetGet('archived');
        }

        return $filters;
    }

    private function setLocaleId(Argument $argument, ?RequestStack $request): void
    {
        $localeCode =
            $argument->offsetGet('locale') ?? $request && $request->getCurrentRequest()
                ? $request->getCurrentRequest()->getLocale()
                : null;
        if ($localeCode) {
            $locale = $this->localeRepository->findOneBy(['code' => $localeCode]);
            if ($locale && $locale->isEnabled()) {
                $argument->offsetSet('locale', $locale->getId());
            } else {
                throw new UserError("the locale {$locale} is not enabled");
            }
        }
    }
}
