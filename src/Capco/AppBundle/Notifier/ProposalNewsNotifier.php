<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\GraphQL\Resolver\Post\PostUrlResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalNewsCreateAdminMessage;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalNewsDeleteAdminMessage;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalNewsUpdateAdminMessage;
use Capco\AppBundle\Repository\PostRepository;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Repository\UserRepository;
use Symfony\Component\Routing\RouterInterface;

class ProposalNewsNotifier extends BaseNotifier
{
    public function __construct(
        MailerService $mailer,
        SiteParameterResolver $siteParams,
        RouterInterface $router,
        private readonly PostRepository $postRepository,
        LocaleResolver $localeResolver,
        private readonly PostUrlResolver $urlResolver,
        private readonly UserRepository $userRepository
    ) {
        parent::__construct($mailer, $siteParams, $router, $localeResolver);
        $this->siteParams = $siteParams;
    }

    public function onCreate(Post $proposalNews): bool
    {
        $adminsSubscribedToProposalNews = $this->userRepository->findBy([
            'subscribedToProposalNews' => true,
        ]);

        foreach ($adminsSubscribedToProposalNews as $admin) {
            $this->mailer->createAndSendMessage(
                ProposalNewsCreateAdminMessage::class,
                $proposalNews,
                [
                    'postURL' => $this->urlResolver->__invoke($proposalNews),
                ],
                $admin
            );
        }

        return true;
    }

    public function onUpdate(Post $proposalNews): bool
    {
        $adminsSubscribedToProposalNews = $this->userRepository->findBy([
            'subscribedToProposalNews' => true,
        ]);

        foreach ($adminsSubscribedToProposalNews as $admin) {
            $this->mailer->createAndSendMessage(
                ProposalNewsUpdateAdminMessage::class,
                $proposalNews,
                [
                    'postURL' => $this->urlResolver->__invoke($proposalNews),
                ],
                $admin
            );
        }

        return true;
    }

    public function onDelete(array $proposalNews): bool
    {
        $adminsSubscribedToProposalNews = $this->userRepository->findBy([
            'subscribedToProposalNews' => true,
        ]);
        foreach ($adminsSubscribedToProposalNews as $admin) {
            $this->mailer->createAndSendMessage(
                ProposalNewsDeleteAdminMessage::class,
                $element = null,
                [
                    'proposalName' => $proposalNews['proposalName'],
                    'projectName' => $proposalNews['projectName'],
                    'postAuthor' => $proposalNews['postAuthor'],
                ],
                $admin
            );
        }

        return true;
    }
}
