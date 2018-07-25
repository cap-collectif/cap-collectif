<?php
namespace Capco\AppBundle\GraphQL\Resolver\Sourceable;

use Capco\AppBundle\Repository\CategoryRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class SourceableAvailableCategoriesResolver implements ResolverInterface
{
    protected $sourceCategoryRepository;

    public function __construct(CategoryRepository $sourceCategoryRepository)
    {
        $this->sourceCategoryRepository = $sourceCategoryRepository;
    }

    public function __invoke(): array
    {
        $categories = $this->sourceCategoryRepository->findBy(['isEnabled' => true]);

        return $categories;
    }
}
