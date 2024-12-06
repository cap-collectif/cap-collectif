<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\CategoryImage;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\CategoryImageRepository;
use Capco\AppBundle\Repository\MediaRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class HandleProposalFormCategoryImageMutation implements MutationInterface
{
    use MutationTrait;

    public const ADD = 'ADD';
    public const DELETE = 'DELETE';

    public function __construct(private EntityManagerInterface $em, private MediaRepository $mediaRepository, private CategoryImageRepository $categoryImageRepository)
    {
    }

    /**
     * @throws \Exception
     *
     * @return array{'categoryImage': CategoryImage | null, 'deletedCategoryImageId': string | null}
     */
    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);

        $mediaId = $input->offsetGet('mediaId');
        $action = $input->offsetGet('action');

        $media = $this->mediaRepository->find($mediaId);

        if (self::ADD === $action) {
            $categoryImage = (new CategoryImage())->setImage($media)->setIsDefault(false);
            $this->em->persist($categoryImage);
            $this->em->flush();

            return ['categoryImage' => $categoryImage, 'deletedCategoryImageId' => null];
        }
        if (self::DELETE === $action) {
            $categoryImage = $this->categoryImageRepository->findOneBy(['image' => $media]);
            $id = $categoryImage->getId();
            $this->em->remove($categoryImage);
            $this->em->flush();

            return ['categoryImage' => null, 'deletedCategoryImageId' => $id];
        }

        throw new \Exception('Action not supported');
    }
}
