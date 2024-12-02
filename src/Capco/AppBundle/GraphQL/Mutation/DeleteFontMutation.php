<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Font\FontManager;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\FontRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;

class DeleteFontMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private FontManager $manager, private FontRepository $repository, private LoggerInterface $logger)
    {
    }

    public function __invoke(Arg $input): array
    {
        $this->formatInput($input);
        $fontGlobalId = $input->offsetGet('id');
        $fontId = GlobalId::fromGlobalId($fontGlobalId)['id'];
        $font = $this->repository->find($fontId);

        if (!$font) {
            $this->logger->error('Unknown font with id: ' . $fontId);

            return [
                'userErrors' => [
                    [
                        'message' => 'Font not found.',
                    ],
                ],
            ];
        }

        try {
            $this->manager->deleteFont($font);
        } catch (\InvalidArgumentException) {
            return [
                'userErrors' => [
                    [
                        'message' => 'Tried to remove a non-custom font.',
                    ],
                ],
            ];
        }

        $bodyFont = $this->repository->getCurrentBodyFont();
        $headingFont = $this->repository->getCurrentHeadingFont();

        return [
            'deletedFontId' => $fontGlobalId,
            'userErrors' => [],
            'bodyFont' => $bodyFont,
            'headingFont' => $headingFont,
        ];
    }
}
