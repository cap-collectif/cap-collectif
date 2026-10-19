<?php

namespace Capco\AppBundle\GraphQL\Mutation\Theme;

use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Enum\ThemeErrorCode;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\ThemeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class DeleteThemeMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ThemeRepository $themeRepository
    ) {
    }

    /**
     * The Elasticsearch document is removed by ElasticsearchDoctrineListener on preRemove.
     *
     * @return array{deletedThemeId?: string|null, errorCode?: string|null}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        $id = $input->offsetGet('id');
        $theme = $this->themeRepository->find($id);
        if (!$theme instanceof Theme) {
            return ['deletedThemeId' => null, 'errorCode' => ThemeErrorCode::NOT_FOUND];
        }

        $this->em->remove($theme);
        $this->em->flush();

        return ['deletedThemeId' => $id, 'errorCode' => null];
    }
}
