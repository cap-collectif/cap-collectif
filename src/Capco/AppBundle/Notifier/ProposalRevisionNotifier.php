<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalRevision;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalUrlResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalRevisionMessage;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalRevisionRevisedMessage;
use Capco\AppBundle\Repository\ProposalRevisionRepository;
use Capco\AppBundle\Repository\SiteColorRepository;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Repository\UserRepository;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\RouterInterface;

class ProposalRevisionNotifier extends BaseNotifier
{
    private readonly string $defaultLocale;

    public function __construct(
        MailerService $mailer,
        SiteParameterResolver $siteParams,
        protected ProposalUrlResolver $proposalUrlResolver,
        RouterInterface $router,
        private readonly RequestStack $requestStack,
        LocaleResolver $localeResolver,
        private readonly UserRepository $userRepository,
        private readonly ProposalRevisionRepository $proposalRevisionRepository,
        private readonly SiteColorRepository $siteColorRepository
    ) {
        parent::__construct($mailer, $siteParams, $router, $localeResolver);
        $this->defaultLocale = $localeResolver->getDefaultLocaleCodeForRequest();
    }

    public function onCreate(ProposalRevision $revision, Proposal $proposal)
    {
        $otherRevisions = $this->proposalRevisionRepository->getRevisionsInPendingNotExpired(
            $proposal,
            $revision
        );
        $btnColor = $this->siteColorRepository
            ->findOneByKeyname('color.btn.primary.bg')
            ->getValue()
        ;
        $btnTextColor = $this->siteColorRepository->findOneByKeyname('color.btn.text')->getValue();
        $this->mailer->createAndSendMessage(
            ProposalRevisionMessage::class,
            $revision,
            [
                'revisions' => $otherRevisions,
                'btnColor' => $btnColor,
                'btnTextColor' => $btnTextColor,
                'local' => $this->defaultLocale,
                'proposalURL' => $this->proposalUrlResolver->__invoke(
                    $proposal,
                    $this->requestStack
                ),
            ],
            $proposal->getAuthor(),
            $proposal->getAuthor()->getEmail(),
            $revision->getAuthor()->getEmail()
        );
    }

    public function onUpdate(array $revisions, Proposal $proposal, string $revisedAt)
    {
        $btnColor = $this->siteColorRepository
            ->findOneByKeyname('color.btn.primary.bg')
            ->getValue()
        ;
        $btnTextColor = $this->siteColorRepository->findOneByKeyname('color.btn.text')->getValue();
        $usersToSendNotification = $this->userRepository->getAssignedUsersOnProposal(
            $proposal,
            $revisedAt
        );
        $ids = array_map(function ($user) {
            return $user['assignedUser'];
        }, $usersToSendNotification);
        $usersToSendNotification = $this->userRepository->findById($ids);

        foreach ($usersToSendNotification as $user) {
            $this->mailer->createAndSendMessage(
                ProposalRevisionRevisedMessage::class,
                $proposal,
                [
                    'revisions' => $revisions,
                    'btnColor' => $btnColor,
                    'btnTextColor' => $btnTextColor,
                    'proposalURL' => $this->proposalUrlResolver->__invoke(
                        $proposal,
                        $this->requestStack
                    ),
                ],
                $user
            );
        }
    }
}
