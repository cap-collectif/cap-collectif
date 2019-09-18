<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Selection;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalAdminUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\User\UserUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalAknowledgeMessage;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalCreateAdminMessage;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalDeleteAdminMessage;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalOfficialAnswerMessage;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalStatusChangeInCollectMessage;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalStatusChangeInSelectionMessage;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalStatusChangeMessage;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalUpdateAdminMessage;
use Capco\AppBundle\Resolver\UrlResolver;
use Capco\AppBundle\SiteParameter\Resolver;
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

    public function __construct(
        MailerService $mailer,
        Resolver $siteParams,
        UserResolver $userResolver,
        ProposalAdminUrlResolver $proposalAdminUrlResolver,
        ProposalUrlResolver $proposalUrlResolver,
        UrlResolver $urlResolver,
        RouterInterface $router,
        TranslatorInterface $translator,
        UserUrlResolver $userUrlResolver
    ) {
        parent::__construct($mailer, $siteParams, $userResolver, $router);
        $this->proposalAdminUrlResolver = $proposalAdminUrlResolver;
        $this->proposalUrlResolver = $proposalUrlResolver;
        $this->urlResolver = $urlResolver;
        $this->translator = $translator;
        $this->userUrlResolver = $userUrlResolver;
    }

    public function onCreate(Proposal $proposal)
    {
        if (!$proposal->isDraft() && $proposal->getProposalForm()->isNotifyingOnCreate()) {
            $this->mailer->sendMessage(
                ProposalCreateAdminMessage::create(
                    $proposal,
                    $proposal->getSummary() ??
                        $this->translator->trans('project.votes.widget.no_value'),
                    $this->siteParams->getValue('admin.mail.notifications.receive_address'),
                    $this->proposalUrlResolver->__invoke($proposal),
                    $this->proposalAdminUrlResolver->__invoke($proposal),
                    $this->userUrlResolver->__invoke($proposal->getAuthor())
                )
            );
        }

        if (!$proposal->isDraft() && $proposal->getProposalForm()->isAllowAknowledge()) {
            $stepUrl = $this->urlResolver->getStepUrl($proposal->getStep(), true);
            $confirmationUrl = null;

            if ($proposal->getAuthor() && !$proposal->getAuthor()->isEmailConfirmed()) {
                $confirmationUrl = $this->router->generate(
                    'account_confirm_email',
                    [
                        'token' => $proposal->getAuthor()->getConfirmationToken()
                    ],
                    UrlGeneratorInterface::ABSOLUTE_URL
                );
            }

            $this->mailer->sendMessage(
                ProposalAknowledgeMessage::create(
                    $proposal,
                    $proposal->getAuthor()->getEmail(),
                    $stepUrl,
                    $this->proposalUrlResolver->__invoke($proposal),
                    $this->baseUrl,
                    $confirmationUrl,
                    'create'
                )
            );
        }
    }

    public function onDelete(Proposal $proposal)
    {
        if (!$proposal->isDraft()) {
            $this->mailer->sendMessage(
                ProposalDeleteAdminMessage::create(
                    $proposal,
                    $this->siteParams->getValue('admin.mail.notifications.receive_address'),
                    $this->proposalUrlResolver->__invoke($proposal),
                    $this->proposalAdminUrlResolver->__invoke($proposal),
                    $this->userUrlResolver->__invoke($proposal->getAuthor())
                )
            );
        }
    }

    public function onUpdate(Proposal $proposal)
    {
        if (
            !$proposal->isDraft() &&
            $proposal
                ->getProposalForm()
                ->getNotificationsConfiguration()
                ->isOnUpdate()
        ) {
            $this->mailer->sendMessage(
                ProposalUpdateAdminMessage::create(
                    $proposal,
                    $this->siteParams->getValue('admin.mail.notifications.receive_address'),
                    $this->proposalUrlResolver->__invoke($proposal),
                    $this->proposalAdminUrlResolver->__invoke($proposal),
                    $this->userUrlResolver->__invoke($proposal->getAuthor())
                )
            );
        }

        if (!$proposal->isDraft() && $proposal->getProposalForm()->isAllowAknowledge()) {
            $stepUrl = $this->urlResolver->getStepUrl($proposal->getStep(), true);
            $confirmationUrl = '';
            if (!$proposal->getAuthor()->isEmailConfirmed()) {
                $confirmationUrl = $this->router->generate(
                    'account_confirm_email',
                    [
                        'token' => $proposal->getAuthor()->getConfirmationToken()
                    ],
                    true
                );
            }
            $this->mailer->sendMessage(
                ProposalAknowledgeMessage::create(
                    $proposal,
                    $proposal->getAuthor()->getEmail(),
                    $stepUrl,
                    $this->proposalUrlResolver->__invoke($proposal),
                    $this->router->generate(
                        'app_homepage',
                        [],
                        UrlGeneratorInterface::ABSOLUTE_URL
                    ),
                    $confirmationUrl,
                    'update'
                )
            );
        }
    }

    public function onUpdateStatus(Proposal $proposal)
    {
        $this->mailer->sendMessage(
            ProposalStatusChangeMessage::create(
                $proposal,
                $this->proposalUrlResolver->__invoke($proposal),
                $this->baseUrl,
                $this->siteName,
                $this->siteUrl
            )
        );
    }

    public function onOfficialAnswer(Proposal $proposal, $post)
    {
        $this->mailer->sendMessage(
            ProposalOfficialAnswerMessage::create(
                $proposal,
                $post,
                $proposal->getAuthor()->getEmail()
            )
        );
    }

    public function onStatusChangeInCollect(Proposal $proposal)
    {
        $this->mailer->sendMessage(
            ProposalStatusChangeInCollectMessage::create(
                $proposal,
                $proposal->getAuthor()->getEmail()
            )
        );
        foreach ($proposal->getChildConnections() as $child) {
            $this->mailer->sendMessage(
                ProposalStatusChangeInCollectMessage::create(
                    $proposal,
                    $child->getAuthor()->getEmail()
                )
            );
        }
    }

    public function onStatusChangeInSelection(Selection $selection)
    {
        $this->mailer->sendMessage(
            ProposalStatusChangeInSelectionMessage::create(
                $selection,
                $selection
                    ->getProposal()
                    ->getAuthor()
                    ->getEmail()
            )
        );
        foreach ($selection->getProposal()->getChildConnections() as $child) {
            $this->mailer->sendMessage(
                ProposalStatusChangeInSelectionMessage::create(
                    $selection,
                    $child->getAuthor()->getEmail()
                )
            );
        }
    }
}
