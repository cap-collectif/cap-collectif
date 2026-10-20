<?php

namespace Capco\AppBundle\GraphQL\Mutation\Page;

use Capco\AppBundle\Entity\Page;
use Capco\AppBundle\Enum\PageErrorCode;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\PageRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class DeletePageMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly PageRepository $pageRepository
    ) {
    }

    /**
     * @return array{deletedPageId: string|null, errorCode: string|null}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        $id = (string) $input->offsetGet('id');
        $page = $this->pageRepository->find(GlobalIdResolver::getDecodedId($id, true));
        if (!$page instanceof Page) {
            return ['deletedPageId' => null, 'errorCode' => PageErrorCode::NOT_FOUND];
        }

        // Menu items linking to the page are removed with it (cascade "remove"), as they were with Sonata.
        $this->em->remove($page);
        $this->em->flush();

        return ['deletedPageId' => $id, 'errorCode' => null];
    }
}
