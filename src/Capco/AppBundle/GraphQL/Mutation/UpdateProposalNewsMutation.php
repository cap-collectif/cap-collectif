<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\NotificationsConfiguration\ProposalFormNotificationConfiguration;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\PostTranslation;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Form\ProposalPostType;
use Capco\AppBundle\GraphQL\Mutation\Locale\LocaleUtils;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Mailer\Message\AbstractMessage;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;

class UpdateProposalNewsMutation implements MutationInterface
{
    public const POST_NOT_FOUND = 'POST_NOT_FOUND';
    public const ACCESS_DENIED = 'ACCESS_DENIED';
    public const INVALID_DATA = 'INVALID_DATA';
    public const PROPOSAL_NOT_FOUND = 'PROPOSAL_NOT_FOUND';

    private EntityManagerInterface $em;
    private GlobalIdResolver $globalIdResolver;
    private FormFactoryInterface $formFactory;
    private LoggerInterface $logger;
    private Publisher $publisher;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        GlobalIdResolver $globalIdResolver,
        LoggerInterface $logger,
        Publisher $publisher
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->globalIdResolver = $globalIdResolver;
        $this->logger = $logger;
        $this->publisher = $publisher;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        try {
            $proposalPost = $this->getPost($input, $viewer);
            $proposalPost = $this->updateProposalNews($input, $proposalPost);
            /** @var Proposal $firstProposal */
            $firstProposal = $proposalPost->getProposals()->first();
            if (!$firstProposal) {
                throw new UserError(self::PROPOSAL_NOT_FOUND);
            }
            /** @var ProposalFormNotificationConfiguration $config */
            $config = $firstProposal
                ->getProposalForm()
                ->getNotificationsConfiguration()
            ;

            if ($config->isOnProposalNewsUpdate()) {
                $this->publisher->publish(
                    'proposal_news.update',
                    new Message(json_encode(['proposalNewsId' => $proposalPost->getId()]))
                );
            }

            return ['proposalPost' => $proposalPost, 'errorCode' => null];
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }
    }

    private function getPost(Arg $input, User $viewer): Post
    {
        $proposalPostGlobalId = $input->offsetGet('postId');
        $proposalPost = $this->globalIdResolver->resolve($proposalPostGlobalId, $viewer);
        if (!$proposalPost || !$proposalPost instanceof Post) {
            $this->logger->error('Unknown post with id: ' . $proposalPostGlobalId);

            throw new UserError(self::POST_NOT_FOUND);
        }
        if (!$proposalPost->isAuthor($viewer) && !$viewer->isAdmin()) {
            throw new UserError(self::ACCESS_DENIED);
        }

        return $proposalPost;
    }

    private function updateProposalNews(Arg $input, Post $proposalPost): Post
    {
        $values = $input->getArrayCopy();
        unset($values['postId']);
        $form = $this->formFactory->create(ProposalPostType::class, $proposalPost);
        $form->submit($values, false);

        if (!$form->isValid()) {
            throw new UserError(self::INVALID_DATA);
        }

        LocaleUtils::indexTranslations($values);

        $translations = $proposalPost->getTranslations();
        /** @var PostTranslation $translation */
        foreach ($translations as $translation) {
            if (isset($values['translations'][$translation->getLocale()]['title'])) {
                $translation->setTitle($values['translations'][$translation->getLocale()]['title']);
            }
            if (isset($values['translations'][$translation->getLocale()]['body'])) {
                $translation->setBody(
                    AbstractMessage::escape(
                        $values['translations'][$translation->getLocale()]['body']
                    )
                );
            }
            if (isset($values['translations'][$translation->getLocale()]['abstract'])) {
                $translation->setAbstract(
                    $values['translations'][$translation->getLocale()]['abstract']
                );
            }
            $this->em->flush();
        }
        $firstProposal = $proposalPost->getProposals()->first();
        if (!$firstProposal) {
            throw new UserError(self::PROPOSAL_NOT_FOUND);
        }

        $this->em->flush();

        return $proposalPost;
    }
}
