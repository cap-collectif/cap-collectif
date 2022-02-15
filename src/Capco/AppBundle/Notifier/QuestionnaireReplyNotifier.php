<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\AbstractReply;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\ReplyAnonymous;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Mailer\Message\Questionnaire\QuestionnaireReplyAnonymousCreateAdminMessage;
use Capco\AppBundle\Mailer\Message\Questionnaire\QuestionnaireReplyAnonymousCreateConfirmMessage;
use Capco\AppBundle\Mailer\Message\Questionnaire\QuestionnaireReplyAnonymousDeleteAdminMessage;
use Capco\AppBundle\Mailer\Message\Questionnaire\QuestionnaireReplyAnonymousUpdateAdminMessage;
use Capco\UserBundle\Entity\User;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Questionnaire\QuestionnaireAcknowledgeReplyCreateMessage;
use Capco\AppBundle\Mailer\Message\Questionnaire\QuestionnaireAcknowledgeReplyUpdateMessage;
use Capco\AppBundle\Mailer\Message\Questionnaire\QuestionnaireReplyCreateAdminMessage;
use Capco\AppBundle\Mailer\Message\Questionnaire\QuestionnaireReplyDeleteAdminMessage;
use Capco\AppBundle\Mailer\Message\Questionnaire\QuestionnaireReplyUpdateAdminMessage;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\Traits\FormatDateTrait;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\AppBundle\Repository\QuestionnaireRepository;

class QuestionnaireReplyNotifier extends BaseNotifier
{
    use FormatDateTrait;
    public const QUESTIONNAIRE_REPLY_CREATE_STATE = 'create';
    public const QUESTIONNAIRE_REPLY_UPDATE_STATE = 'update';
    public const QUESTIONNAIRE_REPLY_DELETE_STATE = 'delete';

    private LoggerInterface $logger;
    private string $defaultLocale;
    private QuestionnaireRepository $questionnaireRepository;

    public function __construct(
        MailerService $mailer,
        SiteParameterResolver $siteParams,
        RouterInterface $router,
        LoggerInterface $logger,
        LocaleResolver $localeResolver,
        QuestionnaireRepository $questionnaireRepository
    ) {
        $this->logger = $logger;
        $this->defaultLocale = $localeResolver->getDefaultLocaleCodeForRequest();
        parent::__construct($mailer, $siteParams, $router, $localeResolver);
        $this->questionnaireRepository = $questionnaireRepository;
    }

    public function onCreate(AbstractReply $reply): void
    {
        if (!$this->isValidReply($reply)) {
            return;
        }
        /** @var Questionnaire $questionnaire */
        $questionnaire = $reply->getQuestionnaire();
        /** @var QuestionnaireStep $questionnaireStep */
        $questionnaireStep = $questionnaire->getStep();
        if (!$reply->getPublishedAt()) {
            $this->logger->error(__METHOD__ . ' bad reply', [
                'cause' => sprintf('Reply %s dont have published date', $reply->getId()),
            ]);

            return;
        }

        $isAnonReply = $reply instanceof ReplyAnonymous;

        $userUrl = !$isAnonReply
            ? $this->router->generate(
                'capco_user_profile_show_all',
                ['slug' => $reply->getAuthor()->getSlug(), '_locale' => $this->defaultLocale],
                RouterInterface::ABSOLUTE_URL
            )
            : null;

        $configUrl = $this->router->generate(
            'admin_capco_app_questionnaire_edit',
            ['id' => $questionnaire->getId(), '_locale' => $this->defaultLocale],
            RouterInterface::ABSOLUTE_URL
        );
        $replyShowUrl = $this->router->generate(
            'admin_capco_app_reply_show',
            ['id' => $reply->getId(), '_locale' => $this->defaultLocale],
            RouterInterface::ABSOLUTE_URL
        );
        $replyUrl = $this->router->generate(
            'app_project_show_questionnaire_reply',
            [
                'projectSlug' => $questionnaireStep->getProject()->getSlug(),
                'stepSlug' => $questionnaireStep->getSlug(),
                'replyId' => GlobalId::toGlobalId('Reply', $reply->getId()),
            ],
            RouterInterface::ABSOLUTE_URL
        );

        $params = [
            'date' => $this->getLongDate(
                $reply->getPublishedAt(),
                $this->defaultLocale,
                $this->siteParams->getValue('global.timezone')
            ),
            'time' => $this->getTime($reply->getPublishedAt()),
            'userURL' => $userUrl,
            'configURL' => $configUrl,
            'replyShowURL' => $replyShowUrl,
        ];

        if ($questionnaire->isNotifyResponseCreate()) {
            $recipientEmail = $questionnaire->getNotificationsConfiguration()->getEmail();
            $messageType = $isAnonReply
                ? QuestionnaireReplyAnonymousCreateAdminMessage::class
                : QuestionnaireReplyCreateAdminMessage::class;

            $this->mailer->createAndSendMessage(
                $messageType,
                $reply,
                $params,
                null,
                $recipientEmail
            );
        }

        if ($isAnonReply) {
            $this->confirmAnonymousEmail($reply);
        } elseif ($questionnaire->isAcknowledgeReplies()) {
            if ($reply->getStep()) {
                $params['endDate'] = $reply->getStep()->getEndAt()
                    ? $this->getLongDate(
                        $reply->getStep()->getEndAt(),
                        $reply->getAuthor()->getLocale() ?? $this->defaultLocale,
                        $this->siteParams->getValue('global.timezone')
                    )
                    : null;
                $params['stepURL'] = $replyUrl;
                $params['date'] = $this->getLongDate(
                    $reply->getPublishedAt(),
                    $this->defaultLocale,
                    $this->siteParams->getValue('global.timezone')
                );
            }
            $this->mailer->createAndSendMessage(
                QuestionnaireAcknowledgeReplyCreateMessage::class,
                $reply,
                $params,
                $reply->getAuthor()
            );
        }
    }

    public function onUpdate(AbstractReply $reply): void
    {
        if (!$this->isValidReply($reply)) {
            return;
        }

        /** @var Questionnaire $questionnaire */
        $questionnaire = $reply->getQuestionnaire();
        /** @var QuestionnaireStep $questionnaireStep */
        $questionnaireStep = $questionnaire->getStep();

        if (!$reply->getUpdatedAt()) {
            $this->logger->error(__METHOD__ . ' bad reply', [
                'cause' => sprintf('Reply %s dont have updated date', $reply->getId()),
            ]);

            return;
        }

        $isAnonReply = $reply instanceof ReplyAnonymous;

        $userUrl = !$isAnonReply
            ? $this->router->generate(
                'capco_user_profile_show_all',
                ['slug' => $reply->getAuthor()->getSlug(), '_locale' => $this->defaultLocale],
                RouterInterface::ABSOLUTE_URL
            )
            : null;
        $configUrl = $this->router->generate(
            'admin_capco_app_questionnaire_edit',
            ['id' => $questionnaire->getId(), '_locale' => $this->defaultLocale],
            RouterInterface::ABSOLUTE_URL
        );
        $replyShowUrl = $this->router->generate(
            'admin_capco_app_reply_show',
            ['id' => $reply->getId(), '_locale' => $this->defaultLocale],
            RouterInterface::ABSOLUTE_URL
        );
        $replyUrl = $this->router->generate(
            'app_project_show_questionnaire_reply',
            [
                'projectSlug' => $questionnaireStep->getProject()->getSlug(),
                'stepSlug' => $questionnaireStep->getSlug(),
                'replyId' => GlobalId::toGlobalId('Reply', $reply->getId()),
            ],
            RouterInterface::ABSOLUTE_URL
        );

        if ($questionnaire->isNotifyResponseUpdate()) {
            $recipientEmail = $questionnaire->getNotificationsConfiguration()->getEmail();
            $messageType = $isAnonReply
                ? QuestionnaireReplyAnonymousUpdateAdminMessage::class
                : QuestionnaireReplyUpdateAdminMessage::class;

            $this->mailer->createAndSendMessage(
                $messageType,
                $reply,
                [
                    'date' => $this->getLongDate(
                        $reply->getUpdatedAt(),
                        $this->defaultLocale,
                        $this->siteParams->getValue('global.timezone')
                    ),
                    'time' => $this->getTime($reply->getUpdatedAt()),
                    'userURL' => $userUrl,
                    'configURL' => $configUrl,
                    'replyShowURL' => $replyShowUrl,
                ],
                null,
                $recipientEmail
            );
        }
        if ($questionnaire->isAcknowledgeReplies() && !$isAnonReply) {
            $params = [
                'date' => $this->getLongDate(
                    $reply->getUpdatedAt(),
                    $locale = $reply->getAuthor()->getLocale() ?? $this->defaultLocale,
                    $this->siteParams->getValue('global.timezone')
                ),
                'time' => $this->getTime($reply->getUpdatedAt()),
                'endDate' => $reply->getStep()->getEndAt()
                    ? $this->getLongDate(
                        $reply->getStep()->getEndAt(),
                        $locale = $reply->getAuthor()->getLocale() ?? $this->defaultLocale,
                        $this->siteParams->getValue('global.timezone')
                    )
                    : null,
                'userURL' => $userUrl,
                'configURL' => $configUrl,
                'stepURL' => $replyUrl,
            ];
            $this->mailer->createAndSendMessage(
                QuestionnaireAcknowledgeReplyUpdateMessage::class,
                $reply,
                $params,
                $reply->getAuthor()
            );
        }
    }

    /**
     * @param array $reply
     *                     The reply is an array because a Reply entity doesn't have soft delete
     *                     The array looks like this :
     *                     [
     *                     'author_slug' => string,
     *                     'questionnaire_id' => string,
     *                     'project_title' => string,
     *                     'deleted_at' => string, which will be transformed into a \DateTimeInterface
     *                     'questionnaire_step_title' => string,
     *                     'author_name' => string,
     *                     ]
     *
     * @throws \Exception
     */
    public function onDelete(array $reply): bool
    {
        $questionnaire = $this->questionnaireRepository->find($reply['questionnaire_id']);
        $recipientEmail = $questionnaire->getNotificationsConfiguration()->getEmail();
        $isAnonReply = $reply['is_anon_reply'];

        $userUrl = !$isAnonReply
            ? $this->router->generate(
                'capco_user_profile_show_all',
                ['slug' => $reply['author_slug'], '_locale' => $this->defaultLocale],
                RouterInterface::ABSOLUTE_URL
            )
            : null;

        $configUrl = $this->router->generate(
            'admin_capco_app_questionnaire_edit',
            ['id' => $reply['questionnaire_id'], '_locale' => $this->defaultLocale],
            RouterInterface::ABSOLUTE_URL
        );
        $date = \DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $reply['deleted_at']);

        $messageType = $isAnonReply
            ? QuestionnaireReplyAnonymousDeleteAdminMessage::class
            : QuestionnaireReplyDeleteAdminMessage::class;

        return $this->mailer->createAndSendMessage(
            $messageType,
            $reply,
            [
                'userURL' => $userUrl,
                'configURL' => $configUrl,
                'date' => $this->getLongDate(
                    $date,
                    $this->defaultLocale,
                    $this->siteParams->getValue('global.timezone')
                ),
                'time' => $this->getTime($date),
            ],
            null,
            $recipientEmail
        );
    }

    private function isValidReply(AbstractReply $reply): bool
    {
        $questionnaire = $reply->getQuestionnaire();
        if (!$questionnaire) {
            $this->logger->error(__METHOD__ . ' bad survey', [
                'cause' => sprintf('reply %s dont have questionnaire', $reply->getId()),
            ]);

            return false;
        }
        $questionnaireStep = $questionnaire->getStep();
        if (!$questionnaireStep) {
            $this->logger->error(__METHOD__ . ' bad survey', [
                'cause' => sprintf('survey %s dont have step', $questionnaire->getId()),
            ]);

            return false;
        }
        if (!$reply->getStep()) {
            $this->logger->error(__METHOD__ . ' bad reply', [
                'cause' => sprintf('reply %s dont have step', $reply->getId()),
            ]);

            return false;
        }

        return true;
    }

    private function confirmAnonymousEmail(ReplyAnonymous $replyAnonymous): void
    {
        if ($replyAnonymous->getParticipantEmail()) {
            $this->mailer->createAndSendMessage(
                QuestionnaireReplyAnonymousCreateConfirmMessage::class,
                $replyAnonymous,
                [
                    'organizationName' => $this->siteParams->getValue(
                        'global.site.organization_name'
                    ),
                    'baseUrl' => $this->router->generate(
                        'app_homepage',
                        ['token' => $replyAnonymous->getToken()],
                        UrlGeneratorInterface::ABSOLUTE_URL
                    ),
                    'subscribeUrl' => $this->router->generate(
                        'capco_app_questionnaire_confirm_anonymous_email',
                        ['token' => $replyAnonymous->getToken()],
                        UrlGeneratorInterface::ABSOLUTE_URL
                    ),
                ],
                (new User())->setEmail($replyAnonymous->getParticipantEmail())
            );
        }
    }
}
