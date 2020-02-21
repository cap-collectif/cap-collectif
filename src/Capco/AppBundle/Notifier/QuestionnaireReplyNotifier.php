<?php

namespace Capco\AppBundle\Notifier;

use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Questionnaire\QuestionnaireAcknowledgeReplyCreateMessage;
use Capco\AppBundle\Mailer\Message\Questionnaire\QuestionnaireAcknowledgeReplyUpdateMessage;
use Capco\AppBundle\Mailer\Message\Questionnaire\QuestionnaireReplyCreateAdminMessage;
use Capco\AppBundle\Mailer\Message\Questionnaire\QuestionnaireReplyDeleteAdminMessage;
use Capco\AppBundle\Mailer\Message\Questionnaire\QuestionnaireReplyUpdateAdminMessage;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\Traits\FormatDateTrait;
use Symfony\Component\Routing\RouterInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\AppBundle\GraphQL\Resolver\Step\StepUrlResolver;

class QuestionnaireReplyNotifier extends BaseNotifier
{
    use FormatDateTrait;
    public const QUESTIONNAIRE_REPLY_CREATE_STATE = 'create';
    public const QUESTIONNAIRE_REPLY_UPDATE_STATE = 'update';
    public const QUESTIONNAIRE_REPLY_DELETE_STATE = 'delete';

    private $stepUrlResolver;
    private $logger;
    private $defaultLocale;

    public function __construct(
        MailerService $mailer,
        SiteParameterResolver $siteParams,
        RouterInterface $router,
        StepUrlResolver $stepUrlResolver,
        LoggerInterface $logger,
        LocaleResolver $localeResolver
    ) {
        $this->stepUrlResolver = $stepUrlResolver;
        $this->logger = $logger;
        $this->defaultLocale = $localeResolver->getDefaultLocaleCodeForRequest();
        parent::__construct($mailer, $siteParams, $router, $localeResolver);
    }

    public function onCreate(Reply $reply): void
    {
        if (!$this->isValidReply($reply)) {
            return;
        }
        $questionnaire = $reply->getQuestionnaire();
        $questionnaireStep = $questionnaire->getStep();
        if (!$reply->getPublishedAt()) {
            $this->logger->error(__METHOD__ . ' bad reply', [
                'cause' => sprintf('Reply %s dont have published date', $reply->getId())
            ]);

            return;
        }
        $userUrl = $this->router->generate(
            'capco_user_profile_show_all',
            ['slug' => $reply->getAuthor()->getSlug(), '_locale' => $this->defaultLocale],
            RouterInterface::ABSOLUTE_URL
        );
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
                'replyId' => GlobalId::toGlobalId('Reply', $reply->getId())
            ],
            RouterInterface::ABSOLUTE_URL
        );

        $params = [
            'date' => $this->getLongDate(
                $reply->getPublishedAt(),
                $this->siteParams->getValue('global.locale'),
                $this->siteParams->getValue('global.timezone')
            ),
            'time' => $this->getTime($reply->getPublishedAt()),
            'userURL' => $userUrl,
            'configURL' => $configUrl,
            'replyShowURL' => $replyShowUrl
        ];

        if ($questionnaire->isNotifyResponseCreate()) {
            $this->mailer->createAndSendMessage(
                QuestionnaireReplyCreateAdminMessage::class,
                $reply,
                $params
            );
        }
        if ($questionnaire->isAcknowledgeReplies()) {
            if ($reply->getStep()) {
                $params['endDate'] = $reply->getStep()->getEndAt()
                    ? $this->getLongDate(
                        $reply->getStep()->getEndAt(),
                        $reply->getAuthor()->getLocale() ?? $this->siteParams->getValue('global.locale'),
                        $this->siteParams->getValue('global.timezone')
                    )
                    : null;
                $params['stepURL'] = $replyUrl;
                $params['date'] = $this->getLongDate(
                    $reply->getPublishedAt(),
                    $this->siteParams->getValue('global.locale'),
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

    public function onUpdate(Reply $reply): void
    {
        if (!$this->isValidReply($reply)) {
            return;
        }

        $questionnaire = $reply->getQuestionnaire();
        $questionnaireStep = $questionnaire->getStep();

        if (!$reply->getUpdatedAt()) {
            $this->logger->error(__METHOD__ . ' bad reply', [
                'cause' => sprintf('Reply %s dont have updated date', $reply->getId())
            ]);

            return;
        }

        $userUrl = $this->router->generate(
            'capco_user_profile_show_all',
            ['slug' => $reply->getAuthor()->getSlug(), '_locale' => $this->defaultLocale],
            RouterInterface::ABSOLUTE_URL
        );
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
                'replyId' => GlobalId::toGlobalId('Reply', $reply->getId())
            ],
            RouterInterface::ABSOLUTE_URL
        );

        if ($questionnaire->isNotifyResponseUpdate()) {
            $this->mailer->createAndSendMessage(
                QuestionnaireReplyUpdateAdminMessage::class,
                $reply,
                [
                    'date' => $this->getLongDate(
                        $reply->getUpdatedAt(),
                        $this->siteParams->getValue('global.locale'),
                        $this->siteParams->getValue('global.timezone')
                    ),
                    'time' => $this->getTime($reply->getUpdatedAt()),
                    'userURL' => $userUrl,
                    'configURL' => $configUrl,
                    'replyShowURL' => $replyShowUrl
                ]
            );
        }
        if ($questionnaire->isAcknowledgeReplies()) {
            $params = [
                'date' => $this->getLongDate(
                    $reply->getUpdatedAt(),
                    $locale = $reply->getAuthor()->getLocale() ?? $this->siteParams->getValue('global.locale'),
                    $this->siteParams->getValue('global.timezone')
                ),
                'time' => $this->getTime($reply->getUpdatedAt()),
                'endDate' => $reply->getStep()->getEndAt()
                    ? $this->getLongDate(
                        $reply->getStep()->getEndAt(),
                        $locale = $reply->getAuthor()->getLocale() ?? $this->siteParams->getValue('global.locale'),
                        $this->siteParams->getValue('global.timezone')
                    )
                    : null,
                'userURL' => $userUrl,
                'configURL' => $configUrl,
                'stepURL' => $replyUrl
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
        $userUrl = $this->router->generate(
            'capco_user_profile_show_all',
            ['slug' => $reply['author_slug'], '_locale' => $this->defaultLocale],
            RouterInterface::ABSOLUTE_URL
        );
        $configUrl = $this->router->generate(
            'admin_capco_app_questionnaire_edit',
            ['id' => $reply['questionnaire_id'], '_locale' => $this->defaultLocale],
            RouterInterface::ABSOLUTE_URL
        );
        $date = \DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $reply['deleted_at']);

        return $this->mailer->createAndSendMessage(
            QuestionnaireReplyDeleteAdminMessage::class,
            $reply,
            [
                'userURL' => $userUrl,
                'configURL' => $configUrl,
                'date' => $this->getLongDate(
                    $date,
                    $this->siteParams->getValue('global.locale'),
                    $this->siteParams->getValue('global.timezone')
                ),
                'time' => $this->getTime($date)
            ]
        );
    }

    private function isValidReply(Reply $reply): bool
    {
        $questionnaire = $reply->getQuestionnaire();
        if (!$questionnaire) {
            $this->logger->error(__METHOD__ . ' bad survey', [
                'cause' => sprintf('reply %s dont have questionnaire', $reply->getId())
            ]);

            return false;
        }
        $questionnaireStep = $questionnaire->getStep();
        if (!$questionnaireStep) {
            $this->logger->error(__METHOD__ . ' bad survey', [
                'cause' => sprintf('survey %s dont have step', $questionnaire->getId())
            ]);

            return false;
        }
        if (!$reply->getStep()) {
            $this->logger->error(__METHOD__ . ' bad reply', [
                'cause' => sprintf('reply %s dont have step', $reply->getId())
            ]);

            return false;
        }

        return true;
    }
}
