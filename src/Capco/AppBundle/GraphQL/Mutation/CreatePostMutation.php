<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Interfaces\Owner;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Factory\PostAuthorFactory;
use Capco\AppBundle\Form\PostType;
use Capco\AppBundle\GraphQL\Mutation\Locale\LocaleUtils;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Resolver\SettableOwnerResolver;
use Capco\AppBundle\Security\PostVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Util\ClassUtils;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class CreatePostMutation implements MutationInterface
{
    use MutationTrait;

    public const INVALID_FORM = 'INVALID_FORM';
    public const INVALID_OWNER = 'INVALID_OWNER';

    private EntityManagerInterface $em;
    private FormFactoryInterface $formFactory;
    private AuthorizationCheckerInterface $authorizationChecker;
    private SettableOwnerResolver $settableOwnerResolver;
    private PostAuthorFactory $postAuthorFactory;
    private Indexer $indexer;
    private LoggerInterface $logger;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        AuthorizationCheckerInterface $authorizationChecker,
        SettableOwnerResolver $settableOwnerResolver,
        PostAuthorFactory $postAuthorFactory,
        Indexer $indexer,
        LoggerInterface $logger
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->authorizationChecker = $authorizationChecker;
        $this->settableOwnerResolver = $settableOwnerResolver;
        $this->postAuthorFactory = $postAuthorFactory;
        $this->indexer = $indexer;
        $this->logger = $logger;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $post = Post::create($viewer);
        $data = $input->getArrayCopy();

        try {
            $owner = $this->getOwner($data['owner'] ?? null, $viewer);
            $post->setOwner($owner);
        } catch (UserError $error) {
            throw new UserError(self::INVALID_OWNER);
        }

        if (isset($data['authors'])) {
            $authorsId = $data['authors'];
            $postAuthors = $this->postAuthorFactory->findOrCreatePostAuthors(
                $post,
                $authorsId,
                $viewer
            );
            $data['authors'] = $postAuthors;
        }

        if (isset($data['owner'])) {
            unset($data['owner']);
        }

        LocaleUtils::indexTranslations($data);
        $form = $this->formFactory->create(PostType::class, $post);
        $form->submit($data, false);
        if (!$form->isValid()) {
            return ['post' => null, 'errorCode' => self::INVALID_FORM];
        }

        $this->em->persist($post);

        try {
            $this->em->flush();
        } catch (\Exception $e) {
            $this->logger->error(
                __METHOD__ . ' => ' . $e->getErrorCode() . ' : ' . $e->getMessage()
            );

            throw new BadRequestHttpException('Sorry, please retry.');
        }

        $this->indexer->index(ClassUtils::getClass($post), $post->getId());
        $this->indexer->finishBulk();

        return ['post' => $post, 'errorCode' => null];
    }

    public function isGranted(): bool
    {
        return $this->authorizationChecker->isGranted(PostVoter::CREATE, new Post());
    }

    public function getOwner(?string $ownerId, User $viewer): Owner
    {
        return $this->settableOwnerResolver->__invoke($ownerId, $viewer);
    }
}
