<?php

namespace Capco\AppBundle\GraphQL\Mutation\Font;

use Capco\AppBundle\Font\FontManager;
use Capco\AppBundle\Repository\FontRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class ChangeFontMutation implements MutationInterface
{
    private $repository;
    private $manager;

    public function __construct(FontManager $manager, FontRepository $repository)
    {
        $this->repository = $repository;
        $this->manager = $manager;
    }

    public function __invoke(Argument $args): iterable
    {
        list($headingFontId, $bodyFontId) = [
            GlobalId::fromGlobalId($args->offsetGet('heading'))['id'],
            GlobalId::fromGlobalId($args->offsetGet('body'))['id'],
        ];

        if (!$headingFontId) {
            throw new UserError(sprintf('Unknown heading font id "%d"', $headingFontId));
        }

        if (!$bodyFontId) {
            throw new UserError(sprintf('Unknown body font id "%d"', $bodyFontId));
        }

        list($headingFont, $bodyFont) = [
            $this->repository->find($headingFontId),
            $this->repository->find($bodyFontId),
        ];

        if (!$headingFont) {
            throw new UserError('Could not find heading font');
        }

        if (!$bodyFont) {
            throw new UserError('Could not find body font');
        }

        $this->manager->changeHeadingFont($headingFont);
        $this->manager->changeBodyFont($bodyFont);

        return [
            'fonts' => $this->repository->findAllGroupedByName(),
            'headingFont' => $headingFont,
            'bodyFont' => $bodyFont,
        ];
    }
}
