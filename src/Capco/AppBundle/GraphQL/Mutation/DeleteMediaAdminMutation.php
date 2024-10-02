<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Manager\MediaManager;
use Capco\MediaBundle\Entity\Media;
use Capco\MediaBundle\Repository\MediaRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;

class DeleteMediaAdminMutation implements MutationInterface
{
    use MutationTrait;
    protected LoggerInterface $logger;
    protected EntityManagerInterface $em;
    protected FormFactoryInterface $formFactory;
    protected MediaRepository $mediaRepository;
    protected MediaManager $mediaManager;

    public function __construct(
        LoggerInterface $logger,
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        MediaRepository $mediaRepository,
        MediaManager $mediaManager
    ) {
        $this->logger = $logger;
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->mediaRepository = $mediaRepository;
        $this->mediaManager = $mediaManager;
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        /**
         * @var array
         */
        $mediaIds = $input->offsetGet('ids');
        $all = $input->offsetGet('all');

        if ($all) {
            $medias = $this->mediaRepository->getWithoutCategory();
            foreach ($medias as $media) {
                $this->em->remove($media);
            }
            $this->em->flush();

            return ['deletedMediaIds' => [], 'userErrors' => []];
        }

        $deleteMediaIds = [];

        foreach ($mediaIds as $mediaId) {
            $deleteMediaId = $this->findAndDeleteMedia($mediaId);
            if (null == $deleteMediaId) {
                return [
                    'deletedMediaIds' => [],
                    'userErrors' => ['Media with id ' . $mediaId . ' not found!'],
                ];
            }
            $deleteMediaIds[] = $deleteMediaId;
        }
        $this->em->flush();

        return ['deletedMediaIds' => $deleteMediaIds, 'userErrors' => []];
    }

    public function findAndDeleteMedia(string $mediaId): ?string
    {
        /**
         * @var Media
         */
        $media = $this->mediaRepository->find($mediaId);

        if (!$media) {
            return null;
        }

        $this->em->remove($media);

        return $mediaId;
    }
}
