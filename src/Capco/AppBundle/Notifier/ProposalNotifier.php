<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Selection;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalAdminUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\User\UserUrlResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalAknowledgeCreateMessage;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalAknowledgeUpdateMessage;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalCreateAdminMessage;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalDeleteAdminMessage;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalOfficialAnswerMessage;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalStatusChangeInCollectMessage;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalStatusChangeInSelectionMessage;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalStatusChangeMessage;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalUpdateAdminMessage;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\Resolver\UrlResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Translation\TranslatorInterface;

class ProposalNotifier extends BaseNotifier
{
    protected $proposalAdminUrlResolver;
    protected $proposalUrlResolver;
    protected $urlResolver;
    private $translator;
    private $userUrlResolver;
    private $requestStack;
    private $defaultLocale;

    public function __construct(
        MailerService $mailer,
        SiteParameterResolver $siteParams,
        ProposalAdminUrlResolver $proposalAdminUrlResolver,
        ProposalUrlResolver $proposalUrlResolver,
        UrlResolver $urlResolver,
        RouterInterface $router,
        TranslatorInterface $translator,
        UserUrlResolver $userUrlResolver,
        RequestStack $requestStack,
        LocaleResolver $localeResolver
    ) {
        parent::__construct($mailer, $siteParams, $router, $localeResolver);
        $this->proposalAdminUrlResolver = $proposalAdminUrlResolver;
        $this->proposalUrlResolver = $proposalUrlResolver;
        $this->urlResolver = $urlResolver;
        $this->translator = $translator;
        $this->userUrlResolver = $userUrlResolver;
        $this->requestStack = $requestStack;
        $this->defaultLocale = $localeResolver->getDefaultLocaleCodeForRequest();
    }

    public function onCreate(Proposal $proposal)
    {
        if (!$proposal->isDraft() && $proposal->getProposalForm()->isNotifyingOnCreate()) {
            $this->mailer->createAndSendMessage(ProposalCreateAdminMessage::class, $proposal, [
                'proposal' => $proposal,
                'proposalSummary' =>
                    $proposal->getSummary() ??
                    $this->translator->trans('project.votes.widget.no_value'),
                'proposalURL' => $this->proposalUrlResolver->__invoke(
                    $proposal,
                    $this->requestStack
                ),
                'adminURL' => $this->proposalAdminUrlResolver->__invoke($proposal),
                'authorURL' => $this->userUrlResolver->__invoke($proposal->getAuthor()),
            ]);
        }

        if (!$proposal->isDraft() && $proposal->getProposalForm()->isAllowAknowledge()) {
            $stepUrl = $this->urlResolver->getStepUrl($proposal->getStep(), true);
            $confirmationUrl = null;

            if ($proposal->getAuthor() && !$proposal->getAuthor()->isEmailConfirmed()) {
                $confirmationUrl = $this->router->generate(
                    'account_confirm_email',
                    [
                        'token' => $proposal->getAuthor()->getConfirmationToken(),
                    ],
                    UrlGeneratorInterface::ABSOLUTE_URL
                );
            }

            $this->mailer->createAndSendMessage(
                ProposalAknowledgeCreateMessage::class,
                $proposal,
                [
                    'stepURL' => $stepUrl,
                    'proposalURL' => $this->proposalUrlResolver->__invoke(
                        $proposal,
                        $this->requestStack
                    ),
                    'confirmationURL' => $confirmationUrl,
                ],
                $proposal->getAuthor()
            );
        }
    }

    public function onDelete(Proposal $proposal)
    {
        if (!$proposal->isDraft()) {
            $this->mailer->createAndSendMessage(ProposalDeleteAdminMessage::class, $proposal, [
                'proposal' => $proposal,
                'proposalURL' => $this->proposalUrlResolver->__invoke(
                    $proposal,
                    $this->requestStack
                ),
                'adminURL' => $this->proposalAdminUrlResolver->__invoke($proposal),
                'authorURL' => $this->userUrlResolver->__invoke($proposal->getAuthor()),
            ]);
        }
    }

    public function onUpdate(Proposal $proposal)
    {
        $locale = $this->defaultLocale;
        $request = $this->requestStack->getCurrentRequest();
        if ($request) {
            $locale = $request->getLocale();
        }
        if (
            !$proposal->isDraft() &&
            $proposal
                ->getProposalForm()
                ->getNotificationsConfiguration()
                ->isOnUpdate()
        ) {
            $this->mailer->createAndSendMessage(ProposalUpdateAdminMessage::class, $proposal, [
                'proposal' => $proposal,
                'proposalURL' => $this->proposalUrlResolver->__invoke(
                    $proposal,
                    $this->requestStack
                ),
                'adminURL' => $this->proposalAdminUrlResolver->__invoke($proposal),
                'authorURL' => $this->userUrlResolver->__invoke($proposal->getAuthor()),
            ]);
        }

        if (!$proposal->isDraft() && $proposal->getProposalForm()->isAllowAknowledge()) {
            $stepUrl = $this->urlResolver->getStepUrl($proposal->getStep(), true);
            $confirmationUrl = '';
            if (!$proposal->getAuthor()->isEmailConfirmed()) {
                $confirmationUrl = $this->router->generate(
                    'account_confirm_email',
                    [
                        'token' => $proposal->getAuthor()->getConfirmationToken(),
                    ],
                    true
                );
            }

            $this->mailer->createAndSendMessage(
                ProposalAknowledgeUpdateMessage::class,
                $proposal,
                [
                    'stepURL' => $stepUrl,
                    'proposalURL' => $this->proposalUrlResolver->__invoke(
                        $proposal,
                        $this->requestStack
                    ),
                    'confirmationURL' => $confirmationUrl,
                ],
                $proposal->getAuthor()
            );
        }
    }

    public function onUpdateStatus(Proposal $proposal, \DateTime $date)
    {
        $this->mailer->createAndSendMessage(
            ProposalStatusChangeMessage::class,
            $proposal,
            [
                'proposalURL' => $this->proposalUrlResolver->__invoke(
                    $proposal,
                    $this->requestStack
                ),
                'date' => $date,
                'timezone' => $this->siteParams->getValue('global.timezone'),
                'locale' => $this->siteParams->getDefaultLocale(), //todo replace by author locale
            ],
            $proposal->getAuthor()
        );
    }

    public function onOfficialAnswer(Proposal $proposal, $post)
    {
        $this->mailer->createAndSendMessage(
            ProposalOfficialAnswerMessage::class,
            $proposal,
            ['post' => $post],
            $proposal->getAuthor()
        );
    }

    public function onStatusChangeInCollect(Proposal $proposal)
    {
        $this->mailer->createAndSendMessage(
            ProposalStatusChangeInCollectMessage::class,
            $proposal,
            [],
            $proposal->getAuthor()
        );
        foreach ($proposal->getChildConnections() as $child) {
            $this->mailer->createAndSendMessage(
                ProposalStatusChangeInCollectMessage::class,
                $proposal,
                [],
                $child->getAuthor()
            );
        }
    }

    public function onStatusChangeInSelection(Selection $selection)
    {
        $this->mailer->createAndSendMessage(
            ProposalStatusChangeInSelectionMessage::class,
            $selection,
            [],
            $selection->getProposal()->getAuthor()
        );
        foreach ($selection->getProposal()->getChildConnections() as $child) {
            $this->mailer->createAndSendMessage(
                ProposalStatusChangeInSelectionMessage::class,
                $selection,
                [],
                $child->getAuthor()
            );
        }
    }
}
