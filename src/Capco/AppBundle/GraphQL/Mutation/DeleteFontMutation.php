<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Font\FontManager;
use Capco\AppBundle\Repository\FontRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;

class DeleteFontMutation implements MutationInterface
{
    private $repository;
    private $logger;
    private $manager;

    public function __construct(
        FontManager $manager,
        FontRepository $repository,
        LoggerInterface $logger
    ) {
        $this->repository = $repository;
        $this->logger = $logger;
        $this->manager = $manager;
    }

    public function __invoke(Arg $input): array
    {
        $fontGlobalId = $input->offsetGet('id');
        $fontId = GlobalId::fromGlobalId($fontGlobalId)['id'];
        $font = $this->repository->find($fontId);

        if (!$font) {
            $this->logger->error('Unknown font with id: ' . $fontId);

            return [
                'userErrors' => [
                    [
                        'message' => 'Font not found.'
                    ]
                ]
            ];
        }

        try {
            $this->manager->deleteFont($font);
        } catch (\InvalidArgumentException $exception) {
            return [
                'userErrors' => [
                    [
                        'message' => 'Tried to remove a non-custom font.'
                    ]
                ]
            ];
        }

        $bodyFont = $this->repository->getCurrentBodyFont();
        $headingFont = $this->repository->getCurrentHeadingFont();

        return [
            'deletedFontId' => $fontGlobalId,
            'userErrors' => [],
            'bodyFont' => $bodyFont,
            'headingFont' => $headingFont
        ];
    }
}
