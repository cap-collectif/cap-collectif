<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalAnalysis;
use Capco\AppBundle\Entity\Selection;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalAdminUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\User\UserUrlResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Proposal\Analysis\AnalysisPublicationMessage;
use Capco\AppBundle\Mailer\Message\Proposal\Analysis\AssessmentPublicationMessage;
use Capco\AppBundle\Mailer\Message\Proposal\Analysis\DecisionPublicationAdminMessage;
use Capco\AppBundle\Mailer\Message\Proposal\Analysis\DecisionPublicationMessage;
use Capco\AppBundle\Mailer\Message\Proposal\Analysis\LastAnalysisPublicationMessage;
use Capco\AppBundle\Mailer\Message\Proposal\Analysis\ProposalDeleteMessage;
use Capco\AppBundle\Mailer\Message\Proposal\Analysis\ProposalUpdateMessage;
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
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class ProposalNotifier extends BaseNotifier
{
    protected ProposalAdminUrlResolver $proposalAdminUrlResolver;
    protected ProposalUrlResolver $proposalUrlResolver;
    protected UrlResolver $urlResolver;
    private TranslatorInterface $translator;
    private UserUrlResolver $userUrlResolver;
    private RequestStack $requestStack;
    private string $defaultLocale;
    private UserRepository $userRepository;

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
        LocaleResolver $localeResolver,
        UserRepository $userRepository
    ) {
        parent::__construct($mailer, $siteParams, $router, $localeResolver);
        $this->proposalAdminUrlResolver = $proposalAdminUrlResolver;
        $this->proposalUrlResolver = $proposalUrlResolver;
        $this->urlResolver = $urlResolver;
        $this->translator = $translator;
        $this->userUrlResolver = $userUrlResolver;
        $this->requestStack = $requestStack;
        $this->defaultLocale = $localeResolver->getDefaultLocaleCodeForRequest();
        $this->userRepository = $userRepository;
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
                'adminURL' => $this->proposalAdminUrlResolver->getEditUrl($proposal),
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

    public function onDelete(
        Proposal $proposal,
        ?User $supervisor = null,
        ?User $decisionMaker = null
    ) {
        if (
            $proposal->getProposalForm()->getNotificationsConfiguration() &&
            $proposal
                ->getProposalForm()
                ->getNotificationsConfiguration()
                ->isOnDelete() &&
            !$proposal->isDraft()
        ) {
            $this->mailer->createAndSendMessage(ProposalDeleteAdminMessage::class, $proposal, [
                'proposal' => $proposal,
                'proposalURL' => $this->proposalUrlResolver->__invoke(
                    $proposal,
                    $this->requestStack
                ),
                'adminURL' => $this->proposalAdminUrlResolver->getEditUrl($proposal),
                'authorURL' => $this->userUrlResolver->__invoke($proposal->getAuthor()),
            ]);
        }

        $this->notifyAllAnalystsOnDelete($proposal, $supervisor, $decisionMaker);
    }

    public function onUpdate(Proposal $proposal, \DateTimeInterface $updateDateTime)
    {
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
                'adminURL' => $this->proposalAdminUrlResolver->getEditUrl($proposal),
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

        $this->notifyAllAnalystsOnUpdate($proposal, $updateDateTime);
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

    public function onAnalysisPublication(
        Proposal $proposal,
        \DateTime $date,
        ProposalAnalysis $analysis
    ): void {
        $params = [
            'proposal' => $proposal,
            'proposalUrl' => $this->proposalUrlResolver->__invoke($proposal, $this->requestStack),
            'analyst' => $analysis->getUpdatedBy(),
            'analystUrl' => $this->userUrlResolver->__invoke($analysis->getUpdatedBy()),
            'adminURL' => $this->proposalAdminUrlResolver->getEditUrl($proposal),
            'publicationDate' => $date,
        ];

        if ($proposal->getSupervisor()) {
            $this->mailer->createAndSendMessage(
                AnalysisPublicationMessage::class,
                $proposal,
                $params,
                $proposal->getSupervisor()
            );
        }
        if ($proposal->getDecisionMaker()) {
            $this->mailer->createAndSendMessage(
                AnalysisPublicationMessage::class,
                $proposal,
                $params,
                $proposal->getDecisionMaker()
            );
        }
    }

    public function onLastAnalysisPublication(Proposal $proposal): void
    {
        $params = [
            'proposal' => $proposal,
            'proposalUrl' => $this->proposalUrlResolver->__invoke($proposal, $this->requestStack),
            'adminURL' => $this->proposalAdminUrlResolver->getEditUrl($proposal),
        ];
        foreach ($proposal->getAnalyses() as $analysis) {
            $analysis->getUpdatedBy()->url = $this->userUrlResolver->__invoke(
                $analysis->getUpdatedBy()
            );
        }
        if ($proposal->getSupervisor()) {
            $this->mailer->createAndSendMessage(
                LastAnalysisPublicationMessage::class,
                $proposal,
                $params,
                $proposal->getSupervisor()
            );
        }
        if ($proposal->getDecisionMaker()) {
            $this->mailer->createAndSendMessage(
                LastAnalysisPublicationMessage::class,
                $proposal,
                $params,
                $proposal->getDecisionMaker()
            );
        }
    }

    public function onAssessmentPublication(Proposal $proposal, \DateTime $date): void
    {
        if ($proposal->getDecisionMaker()) {
            $params = [
                'proposal' => $proposal,
                'proposalUrl' => $this->proposalUrlResolver->__invoke(
                    $proposal,
                    $this->requestStack
                ),
                'supervisorUrl' => $this->userUrlResolver->__invoke($proposal->getSupervisor()),
                'adminURL' => $this->proposalAdminUrlResolver->getEditUrl($proposal),
                'publicationDate' => $date,
            ];
            $this->mailer->createAndSendMessage(
                AssessmentPublicationMessage::class,
                $proposal,
                $params,
                $proposal->getDecisionMaker()
            );
        }
    }

    public function onDecisionPublication(Proposal $proposal, \DateTime $date): void
    {
        $params = [
            'proposal' => $proposal,
            'proposalUrl' => $this->proposalUrlResolver->__invoke($proposal, $this->requestStack),
            'decisionMakerUrl' => $this->userUrlResolver->__invoke($proposal->getDecisionMaker()),
            'adminURL' => $this->proposalAdminUrlResolver->getEditUrl($proposal),
            'publicationDate' => $date,
        ];
        $this->mailer->createAndSendMessage(
            DecisionPublicationAdminMessage::class,
            $proposal,
            $params
        );
        foreach ($this->userRepository->getAllAdmin() as $admin) {
            if ($admin->isConsentInternalCommunication()) {
                $this->mailer->createAndSendMessage(
                    DecisionPublicationMessage::class,
                    $proposal,
                    $params,
                    $admin
                );
            }
        }
        if ($proposal->getSupervisor()) {
            $this->mailer->createAndSendMessage(
                DecisionPublicationMessage::class,
                $proposal,
                $params,
                $proposal->getSupervisor()
            );
        }
        foreach ($proposal->getAnalysts() as $analyst) {
            $this->mailer->createAndSendMessage(
                DecisionPublicationMessage::class,
                $proposal,
                $params,
                $analyst
            );
        }
        $this->mailer->createAndSendMessage(
            DecisionPublicationMessage::class,
            $proposal,
            $params,
            $proposal->getAuthor()
        );
    }

    private function notifyAllAnalystsOnDelete(
        Proposal $proposal,
        ?User $supervisor,
        ?User $decisionMaker
    ): void {
        $params = [
            'baseUrl' => $this->router->generate(
                'app_homepage',
                [],
                UrlGeneratorInterface::ABSOLUTE_URL
            ),
            'isDeleted' => true,
            'updateDate' => $proposal->getDeletedAt()->format('d/m/Y'),
            'updateTime' => $proposal->getDeletedAt()->format('H:i:s'),
        ];

        if ($decisionMaker) {
            $this->notifyOneAnalyst($proposal, $params, $decisionMaker);
        }
        if ($supervisor) {
            $this->notifyOneAnalyst($proposal, $params, $supervisor);
        }
        foreach ($proposal->getAnalysts() as $analyst) {
            $this->notifyOneAnalyst($proposal, $params, $analyst);
        }
    }

    private function notifyAllAnalystsOnUpdate(
        Proposal $proposal,
        \DateTimeInterface $updateDateTime
    ): void {
        $params = [
            'baseUrl' => $this->router->generate(
                'app_homepage',
                [],
                UrlGeneratorInterface::ABSOLUTE_URL
            ),
            'proposalUrl' => $this->proposalUrlResolver->__invoke($proposal, $this->requestStack),
            'updateDate' => $updateDateTime->format('d/m/Y'),
            'updateTime' => $updateDateTime->format('H:i:s'),
            'isDeleted' => false,
        ];

        if ($proposal->getDecisionMaker()) {
            $this->notifyOneAnalyst($proposal, $params, $proposal->getDecisionMaker());
        }
        if ($proposal->getSupervisor()) {
            $this->notifyOneAnalyst($proposal, $params, $proposal->getSupervisor());
        }
        foreach ($proposal->getAnalysts() as $analyst) {
            $this->notifyOneAnalyst($proposal, $params, $analyst);
        }
    }

    private function notifyOneAnalyst(Proposal $proposal, array $params, User $analyst): void
    {
        $messageType = $params['isDeleted']
            ? ProposalDeleteMessage::class
            : ProposalUpdateMessage::class;
        $this->mailer->createAndSendMessage($messageType, $proposal, $params, $analyst);
    }
}
