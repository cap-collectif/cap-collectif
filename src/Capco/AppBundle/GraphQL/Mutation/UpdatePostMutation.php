<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Factory\PostAuthorFactory;
use Capco\AppBundle\Form\PostType;
use Capco\AppBundle\GraphQL\Mutation\Locale\LocaleUtils;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Security\PostVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationChecker;

class UpdatePostMutation implements MutationInterface
{
    public const INVALID_FORM = 'INVALID_FORM';

    private EntityManagerInterface $em;
    private FormFactoryInterface $formFactory;
    private GlobalIdResolver $globalIdResolver;
    private AuthorizationChecker $authorizationChecker;
    private PostAuthorFactory $postAuthorFactory;
    private LoggerInterface $logger;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        GlobalIdResolver $globalIdResolver,
        AuthorizationChecker $authorizationChecker,
        PostAuthorFactory $postAuthorFactory,
        LoggerInterface $logger
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->globalIdResolver = $globalIdResolver;
        $this->authorizationChecker = $authorizationChecker;
        $this->postAuthorFactory = $postAuthorFactory;
        $this->logger = $logger;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $id = $input->offsetGet('id');
        $post = $this->globalIdResolver->resolve($id, $viewer);
        $data = $input->getArrayCopy();
        unset($data['authors'], $data['id']);
        $authorsId = $input->offsetGet('authors');

        LocaleUtils::indexTranslations($data);

        $authors = $this->postAuthorFactory->findOrCreatePostAuthors($post, $authorsId, $viewer);
        $data['authors'] = $authors;

        $form = $this->formFactory->create(PostType::class, $post);
        $form->submit($data, false);

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . $form->getErrors(true, false));
            return ['post' => null, 'errorCode' => self::INVALID_FORM];
        }

        $this->em->flush();

        return ['post' => $post];
    }

    public function isGranted(string $postId, User $viewer): bool
    {
        $post = $this->globalIdResolver->resolve($postId, $viewer);

        if ($post) {
            return $this->authorizationChecker->isGranted(PostVoter::EDIT, $post);
        }

        return false;
    }
}
